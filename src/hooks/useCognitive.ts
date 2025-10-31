import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { assembleCognitiveContext } from "@/lib/cognitive/context";
import { getOrCreateWeeklySnapshot, saveSessionMessage, type Persona } from "@/lib/cognitive/memory";
import { runSkill, getSkillsStatus } from "@/lib/docker/skills";
import { generateText, preflightTextRoute, LIGHT_TEXT_PRIMARY, LIGHT_TEXT_FALLBACK } from "@/lib/openrouter";
import { logLLM, logSkill } from "@/lib/cognitive/telemetry";

const TEXT_MODEL_PRIMARY = LIGHT_TEXT_PRIMARY;
const TEXT_MODEL_FALLBACK = LIGHT_TEXT_FALLBACK;

export function useCognitiveActions(userId?: string | null) {
  // Simple call budget: max 5 LLM calls per 60s per session
  function withinBudget(): boolean {
    try {
      const key = "cog_call_budget";
      const now = Date.now();
      const windowMs = 60_000;
      const maxCalls = 5;
      const raw = sessionStorage.getItem(key);
      const arr = raw ? (JSON.parse(raw) as number[]) : [];
      const recent = arr.filter((t) => now - t < windowMs);
      if (recent.length >= maxCalls) return false;
      recent.push(now);
      sessionStorage.setItem(key, JSON.stringify(recent));
      return true;
    } catch { return true; }
  }

  function trimText(input: string, maxChars = 4000): string {
    if (input.length <= maxChars) return input;
    return input.slice(0, maxChars) + "\n[...truncated...]";
  }
  const addReflection = useCallback(async (payload: { type: "journal" | "insight" | "goal" | "gratitude"; content: string }) => {
    if (!userId) throw new Error("No user");
    const { data: inserted, error } = await supabase
      .from("cognitive_reflections")
      .insert({ user_id: userId, content: payload.content })
      .select("id, content, created_at")
      .single();
    if (error) throw error;

    // Run local skills (best-effort)
    const startSenti = Date.now();
    const senti = await runSkill("sentiment", { text: payload.content });
    await logSkill(userId, "sentiment", senti ? "success" : "skip", { durationMs: Date.now() - startSenti });
    const startTopics = Date.now();
    const topics = await runSkill("topics", { text: payload.content });
    await logSkill(userId, "topics", topics ? "success" : "skip", { durationMs: Date.now() - startTopics });

    const tags = Array.from(new Set([...(topics?.keywords || []), ...(senti?.emotions || [])])).slice(0, 10);
    const sentiment_score = typeof senti?.score === "number" ? senti.score : null;

    // Persisting derived tags/sentiment is disabled until columns exist in schema
    // (kept local for return value / UI only)

    // AI summary (LLM)
    const ctx = await assembleCognitiveContext(userId);
    const sys = `Summarize the reflection in 3-5 bullets. Be concise. Tone=${ctx.userProfile.tone || "neutral"}.`;
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    let ai_summary: string | null = null;
    try {
      const t0 = Date.now();
      const summary = await generateText({
        model: TEXT_MODEL_PRIMARY,
        system: sys,
        prompt: trimText(payload.content, 2000),
        maxTokens: 300,
      });
      await logLLM(userId, "reflection.summary", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
      ai_summary = summary;
    } catch (e: any) {
      try {
        const t1 = Date.now();
        const summary2 = await generateText({
          model: TEXT_MODEL_FALLBACK,
          system: sys,
          prompt: trimText(payload.content, 2000),
          maxTokens: 300,
        });
        await logLLM(userId, "reflection.summary", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
        ai_summary = summary2;
      } catch (e2: any) {
        await logLLM(userId, "reflection.summary", TEXT_MODEL_FALLBACK, "failure", { error: e2?.message });
      }
    }
    if (ai_summary) {
      await supabase.from("cognitive_reflections").update({ ai_summary }).eq("id", inserted.id);
    }

    return { id: inserted.id, tags, sentiment_score, ai_summary };
  }, [userId]);

  const weeklyOverview = useCallback(async () => {
    if (!userId) throw new Error("No user");
    const snapshot = await getOrCreateWeeklySnapshot(userId, async () => {
      const ctx = await assembleCognitiveContext(userId);
      // Ask LLM for compact weekly summary
      const prompt = JSON.stringify({
        moods: ctx.currentWeek,
        reflections: ctx.recentReflections.map(r => ({ id: r.id, text: r.text, ai_summary: r.ai_summary })),
      });
      if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
      let jsonText: string | null = null;
      try {
        const t0 = Date.now();
        jsonText = await generateText({
          model: TEXT_MODEL_PRIMARY,
          system: "You output strict JSON with fields: moodAverage, topMoods, themes, insights[3], actions[3].",
          prompt: trimText(prompt, 6000),
          json: true,
          maxTokens: 500,
        });
        await logLLM(userId, "weekly.snapshot", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
      } catch {
        try {
          const t1 = Date.now();
          jsonText = await generateText({
            model: TEXT_MODEL_FALLBACK,
            system: "You output strict JSON with fields: moodAverage, topMoods, themes, insights[3], actions[3].",
            prompt: trimText(prompt, 6000),
            json: true,
            maxTokens: 500,
          });
          await logLLM(userId, "weekly.snapshot", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
        } catch {}
      }
      if (jsonText) {
        try { return JSON.parse(jsonText); } catch { /* fallthrough */ }
      }
      // Last-resort: derive minimal snapshot locally without LLM
      const moodAverage = ctx.currentWeek.moodAverage;
      const topMoods = ctx.currentWeek.moods.slice(-5).map(m => m.score);
      const themes = ctx.goalsThemes;
      return { moodAverage, topMoods, themes, insights: [], actions: [] };
    });
    return snapshot;
  }, [userId]);

  const cognitiveChat = useCallback(async (message: string, persona: Persona = "friend") => {
    if (!userId) throw new Error("No user");
    saveSessionMessage({ role: "user", content: message, ts: Date.now(), persona });
    const ctx = await assembleCognitiveContext(userId);
    const system = personaSystem(persona, ctx.userProfile.tone);
    const contextPrompt = JSON.stringify({
      profile: ctx.userProfile,
      week: ctx.currentWeek,
      snapshot_hint: "Use the latest weekly snapshot if available.",
    });
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    let reply: string | null = null;
    try {
      const t0 = Date.now();
      reply = await generateText({
        model: TEXT_MODEL_PRIMARY,
        system,
        prompt: trimText(`CONTEXT=${contextPrompt}\nUSER=${message}`, 6000),
        maxTokens: 420,
      });
      await logLLM(userId, "chat.reply", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
    } catch {
      try {
        const t1 = Date.now();
        reply = await generateText({
          model: TEXT_MODEL_FALLBACK,
          system,
          prompt: trimText(`CONTEXT=${contextPrompt}\nUSER=${message}`, 6000),
          maxTokens: 420,
        });
        await logLLM(userId, "chat.reply", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
      } catch {}
    }
    if (!reply) {
      // Local minimal fallback to avoid silent failure
      reply = "I couldn't reach the assistant right now. Based on your recent context, here are next steps: 1) capture a reflection, 2) pick one focus theme this week, 3) schedule a 30-min block.";
    }
    // Simple citation line using tags/date window
    const weekDates = ctx.currentWeek.moods.map(m => m.date);
    const from = weekDates[0] ? new Date(weekDates[0]).toDateString().split(" ").slice(0,3).join(" ") : "recent days";
    const to = weekDates[weekDates.length-1] ? new Date(weekDates[weekDates.length-1]).toDateString().split(" ").slice(0,3).join(" ") : "";
    const tag = ctx.currentWeek.topTags?.[0];
    const citation = tag ? `\n\n— Based on entries from ${from}${to?`–${to}`:""} tagged '${tag}'.` : "";
    const finalReply = reply + citation;
    saveSessionMessage({ role: "assistant", content: finalReply, ts: Date.now(), persona });
    return finalReply;
  }, [userId]);

  // Ideas generation (persona + themes), and save
  const generateIdeas = useCallback(async (persona: Persona = "guide") => {
    if (!userId) throw new Error("No user");
    const ctx = await assembleCognitiveContext(userId);
    const system = personaSystem(persona, ctx.userProfile.tone);
    const prompt = `Using themes=${JSON.stringify(ctx.goalsThemes)}, generate 5 startup ideas as JSON array of {title, category, rationale, nextStep}. Keep each field under 160 chars.`;
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    try {
      const t0 = Date.now();
      const json = await generateText({ model: TEXT_MODEL_PRIMARY, system, prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 });
      await logLLM(userId, "ideas.generate", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
      return JSON.parse(json);
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("429") || msg.includes("rate") || msg.includes("402")) {
        const t1 = Date.now();
        const json2 = await generateText({ model: TEXT_MODEL_FALLBACK, system, prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 });
        await logLLM(userId, "ideas.generate", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
        try { return JSON.parse(json2); } catch { return []; }
      }
      return [];
    }
  }, [userId]);

  const saveIdea = useCallback(async (idea: { title: string; category?: string; rationale?: string; nextStep?: string }) => {
    if (!userId) throw new Error("No user");
    const { data, error } = await supabase
      .from("cognitive_ideas")
      .insert({ user_id: userId, title: idea.title, category: idea.category, rationale: idea.rationale, next_step: idea.nextStep, status: "new", priority: 5 })
      .select("id")
      .single();
    if (error) throw error;
    return data?.id;
  }, [userId]);

  // Energy-aware scheduling
  const suggestSlots = useCallback(async () => {
    if (!userId) throw new Error("No user");
    const ctx = await assembleCognitiveContext(userId);
    // Infer simple peaks: assume higher mood score hours are 10am-12pm and 3-5pm if average > baseline
    // For now, use next 7 days at 10:00 and 15:00 local time
    const tz = ctx.userProfile.timezone || "UTC";
    const dates: { start: string; end: string }[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(); d.setDate(d.getDate() + (i + 1));
      const d1 = new Date(d); d1.setHours(10, 0, 0, 0);
      const d2 = new Date(d); d2.setHours(15, 0, 0, 0);
      dates.push({ start: d1.toISOString(), end: new Date(d1.getTime() + 60 * 60 * 1000).toISOString() });
      if (dates.length >= 3) break;
      dates.push({ start: d2.toISOString(), end: new Date(d2.getTime() + 60 * 60 * 1000).toISOString() });
      if (dates.length >= 3) break;
    }
    return dates;
  }, [userId]);

  const createEvent = useCallback(async (payload: { title: string; start_time: string; end_time?: string | null }) => {
    if (!userId) throw new Error("No user");
    const { data, error } = await supabase
      .from("cognitive_events")
      .insert({ user_id: userId, title: payload.title, start_time: payload.start_time, end_time: payload.end_time || null })
      .select("id")
      .single();
    if (error) throw error;
    return data?.id;
  }, [userId]);

  // Tools exposed for UI/LLM orchestration
  const fetchReflectionById = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("cognitive_reflections")
      .select("id, created_at, content, ai_summary")
      .eq("id", id)
      .single();
    if (error) throw error; return data;
  }, []);

  const fetchIdeasByStatus = useCallback(async (status: string) => {
    if (!userId) throw new Error("No user");
    const { data, error } = await supabase
      .from("cognitive_ideas")
      .select("id, title, category, status, priority, rationale, next_step")
      .eq("user_id", userId)
      .eq("status", status)
      .order("priority", { ascending: false });
    if (error) throw error; return data;
  }, [userId]);

  const summarizeRange = useCallback(async (fromISO: string, toISO: string) => {
    if (!userId) throw new Error("No user");
    const { data } = await supabase
      .from("cognitive_reflections")
      .select("id, created_at, content")
      .eq("user_id", userId)
      .gte("created_at", fromISO)
      .lte("created_at", toISO)
      .order("created_at", { ascending: true });
    const prompt = JSON.stringify({ range: { fromISO, toISO }, reflections: data });
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    let res: any;
    try {
      const t0 = Date.now();
      res = await generateText({ model: TEXT_MODEL_PRIMARY, system: "Summarize reflections into themes and 3 actions. Output JSON.", prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 });
      await logLLM(userId, "range.summary", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
    } catch {
      const t1 = Date.now();
      res = await generateText({ model: TEXT_MODEL_FALLBACK, system: "Summarize reflections into themes and 3 actions. Output JSON.", prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 });
      await logLLM(userId, "range.summary", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
    }
    try { return JSON.parse(res); } catch { return { raw: res }; }
  }, [userId]);

  const preflightLLM = useCallback(async () => {
    return preflightTextRoute([TEXT_MODEL_PRIMARY, TEXT_MODEL_FALLBACK]);
  }, []);

  const skillsStatus = useCallback(async () => {
    return getSkillsStatus();
  }, []);

  return { addReflection, weeklyOverview, cognitiveChat, generateIdeas, saveIdea, suggestSlots, createEvent, fetchReflectionById, fetchIdeasByStatus, summarizeRange, preflightLLM, skillsStatus };
}

function personaSystem(persona: Persona, tone?: string) {
  const base = tone ? `Match user tone=${tone}.` : "";
  switch (persona) {
    case "friend":
      return `${base} You are empathetic and casual. Encourage, reflect back feelings, keep it light.`;
    case "guide":
      return `${base} You are structured and supportive. Provide steps and frameworks.`;
    case "mentor":
      return `${base} You are direct and strategic. High-signal, prioritize leverage.`;
    case "ea":
      return `${base} You are an executive assistant. Be concise, action-oriented, checklist-first.`;
  }
}


