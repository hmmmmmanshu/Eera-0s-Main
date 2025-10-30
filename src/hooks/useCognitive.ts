import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { assembleCognitiveContext } from "@/lib/cognitive/context";
import { getOrCreateWeeklySnapshot, saveSessionMessage, type Persona } from "@/lib/cognitive/memory";
import { runSkill } from "@/lib/docker/skills";
import { generateText } from "@/lib/openrouter";

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
      .insert({ user_id: userId, kind: payload.type, content: payload.content })
      .select("id, content, created_at")
      .single();
    if (error) throw error;

    // Run local skills (best-effort)
    const senti = await runSkill("sentiment", { text: payload.content });
    const topics = await runSkill("topics", { text: payload.content });

    const tags = Array.from(new Set([...(topics?.keywords || []), ...(senti?.emotions || [])])).slice(0, 10);
    const sentiment_score = typeof senti?.score === "number" ? senti.score : null;

    await supabase
      .from("cognitive_reflections")
      .update({ tags, sentiment_score })
      .eq("id", inserted.id);

    // AI summary (LLM)
    const ctx = await assembleCognitiveContext(userId);
    const sys = `Summarize the reflection in 3-5 bullets. Be concise. Tone=${ctx.userProfile.tone || "neutral"}.`;
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    const summary = await generateText({
      model: "google/gemini-2.0-flash-exp:free",
      system: sys,
      prompt: trimText(payload.content, 2000),
      maxTokens: 320,
    });
    await supabase.from("cognitive_reflections").update({ ai_summary: summary }).eq("id", inserted.id);

    return { id: inserted.id, tags, sentiment_score, ai_summary: summary };
  }, [userId]);

  const weeklyOverview = useCallback(async () => {
    if (!userId) throw new Error("No user");
    const snapshot = await getOrCreateWeeklySnapshot(userId, async () => {
      const ctx = await assembleCognitiveContext(userId);
      // Ask LLM for compact weekly summary
      const prompt = JSON.stringify({
        moods: ctx.currentWeek,
        reflections: ctx.recentReflections.map(r => ({ id: r.id, text: r.text, tags: r.tags, ai_summary: r.ai_summary })),
      });
      if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
      const summary = await generateText({
        model: "google/gemini-2.0-flash-exp:free",
        system: "You output strict JSON with fields: moodAverage, topMoods, themes, insights[3], actions[3].",
        prompt: trimText(prompt, 6000),
        json: true,
        maxTokens: 600,
      });
      try { return JSON.parse(summary); } catch { return { raw: summary }; }
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
    const reply = await generateText({
      model: "google/gemini-2.0-flash-exp:free",
      system,
      prompt: trimText(`CONTEXT=${contextPrompt}\nUSER=${message}`, 6000),
      maxTokens: 480,
    });
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
    const json = await generateText({ model: "google/gemini-2.0-flash-exp:free", system, prompt: trimText(prompt, 6000), json: true, maxTokens: 700 });
    try { return JSON.parse(json); } catch { return []; }
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
      .select("id, created_at, content, ai_summary, tags, sentiment_score")
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
      .select("id, created_at, content, tags")
      .eq("user_id", userId)
      .gte("created_at", fromISO)
      .lte("created_at", toISO)
      .order("created_at", { ascending: true });
    const prompt = JSON.stringify({ range: { fromISO, toISO }, reflections: data });
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    const res = await generateText({ model: "google/gemini-2.0-flash-exp:free", system: "Summarize reflections into themes and 3 actions. Output JSON.", prompt: trimText(prompt, 6000), json: true, maxTokens: 700 });
    try { return JSON.parse(res); } catch { return { raw: res }; }
  }, [userId]);

  return { addReflection, weeklyOverview, cognitiveChat, generateIdeas, saveIdea, suggestSlots, createEvent, fetchReflectionById, fetchIdeasByStatus, summarizeRange };
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


