import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { assembleCognitiveContext } from "@/lib/cognitive/context";
import { getOrCreateWeeklySnapshot, saveSessionMessage, type Persona } from "@/lib/cognitive/memory";
import { generateChatResponse, classifyChatMessage, type ChatMessage } from "@/lib/gemini";
import { logLLM } from "@/lib/cognitive/telemetry";

const OUTPUT_TOKENS = 450; // max tokens per assistant reply
const CONTEXT_BUDGET = 9000; // ~9KB context budget

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

  // AI-powered sentiment analysis using Gemini
  async function analyzeSentiment(text: string): Promise<{ score: number; emotions: string[] }> {
    try {
      const prompt = `Analyze sentiment of this text. Output JSON with this exact structure: {"score": 1-10 (1=very negative, 10=very positive), "emotions": ["emotion1", "emotion2", "emotion3"]}

TEXT: ${text}`;
      
      const result = await generateText({
        model: TEXT_MODEL_PRIMARY,
        system: "You are a sentiment analyzer. Output strict JSON only. Use this format: {\"score\": number, \"emotions\": [\"string\", \"string\"]}",
        prompt: trimText(prompt, 3000),
        json: true,
        maxTokens: 150,
      });
      
      const parsed = typeof result.content === "string" ? JSON.parse(result.content) : result.content;
      return {
        score: typeof parsed.score === "number" ? Math.max(1, Math.min(10, parsed.score)) : 5,
        emotions: Array.isArray(parsed.emotions) ? parsed.emotions.slice(0, 3) : ["neutral"],
      };
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      // Fallback: neutral sentiment
      return { score: 5, emotions: ["neutral"] };
    }
  }

  // AI-powered topic extraction using Gemini
  async function extractTopics(text: string): Promise<{ keywords: string[] }> {
    try {
      const prompt = `Extract 3-5 key topics/themes from this text. Output JSON with this exact structure: {"keywords": ["topic1", "topic2", "topic3"]}

TEXT: ${text}`;
      
      const result = await generateText({
        model: TEXT_MODEL_PRIMARY,
        system: "You are a topic extractor. Output strict JSON only. Use this format: {\"keywords\": [\"string\", \"string\"]}",
        prompt: trimText(prompt, 3000),
        json: true,
        maxTokens: 150,
      });
      
      const parsed = typeof result.content === "string" ? JSON.parse(result.content) : result.content;
      return {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
      };
    } catch (error) {
      console.error("Topic extraction error:", error);
      return { keywords: [] };
    }
  }

  // --- New: Chat sessions & plan extraction ---
  const createOrGetSession = useCallback(async (activeHub?: string) => {
    if (!userId) throw new Error("No user");
    const { data } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id as string;
    const { data: inserted, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, active_hub: activeHub || null, title: "Session" })
      .select("id")
      .single();
    if (error) throw error;
    return inserted.id as string;
  }, [userId]);

  const pinPlanToSession = useCallback(async (planId: string) => {
    if (!userId) throw new Error("No user");
    const sid = await createOrGetSession();
    await supabase.from("chat_sessions").update({ pinned_plan_id: planId }).eq("id", sid);
    return sid;
  }, [userId, createOrGetSession]);

  async function buildContextBudgeted(sessionId: string, hub?: string, pinnedPlanId?: string | null) {
    const ctx = await assembleCognitiveContext(userId!);
    // last 10 messages
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(10);
    // recent plans for hub
    let plans: any[] = [];
    if (hub) {
      const { data } = await supabase
        .from("hub_plans")
        .select("id, title, summary, status, next_step, last_discussed_at")
        .eq("user_id", userId)
        .eq("hub", hub)
        .order("last_discussed_at", { ascending: false })
        .limit(3);
      plans = data || [];
    }
    // pinned plan details
    let pinned: any = null;
    if (pinnedPlanId) {
      const { data } = await supabase
        .from("hub_plans")
        .select("id, hub, title, summary, status, next_step, due_date")
        .eq("id", pinnedPlanId)
        .maybeSingle();
      pinned = data || null;
    }
    // hub notes
    let notes: any[] = [];
    if (hub) {
      const { data } = await supabase
        .from("hub_context_notes")
        .select("key, value")
        .eq("user_id", userId)
        .eq("hub", hub)
        .limit(10);
      notes = data || [];
    }
    const payload = { profile: ctx.userProfile, week: ctx.currentWeek, hub, notes, plans, pinned, recent: (msgs || []).reverse() };
    let s = JSON.stringify(payload);
    const budget = CONTEXT_BUDGET; // ~9KB budget
    if (s.length > budget) s = s.slice(0, budget) + "\n[...truncated context...]";
    return s;
  }

  const sendChatWithPlanExtract = useCallback(async (message: string) => {
    if (!userId) throw new Error("No user");
    const sessionId = await createOrGetSession();
    // Save user message
    await supabase.from("chat_messages").insert({ session_id: sessionId, user_id: userId, role: "user", content: message });

    // Classify hub + subcategories and plan extraction
    const classifyPrompt = `Classify the user's message. Output strict JSON with fields: {hub: one of marketing|sales|finance|ops|hr|legal|cognitive, subcategories: string[], intent: one of plan|question|journal|issue, plan: {title: string, summary: string, next_step: string} | null}`;
    const t0 = Date.now();
    let classification = "";
    try {
      classification = (await generateText({ model: TEXT_MODEL_PRIMARY, system: classifyPrompt, prompt: trimText(message, 4000), json: true as any, maxTokens: JSON_TOKENS })).content;
      await logLLM(userId, "chat.classify", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
    } catch {
      classification = (await generateText({ model: TEXT_MODEL_FALLBACK, system: classifyPrompt, prompt: trimText(message, 4000), json: true as any, maxTokens: JSON_TOKENS })).content;
      await logLLM(userId, "chat.classify", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t0 });
    }
    let cls: any = {};
    try { cls = JSON.parse(classification); } catch {}

    // Upsert plan if present
    let pinnedPlan: string | null = null;
    if (cls?.plan?.title && cls?.hub) {
      const { data: plan } = await supabase
        .from("hub_plans")
        .insert({
          user_id: userId,
          hub: cls.hub,
          subcategories: Array.isArray(cls.subcategories) ? cls.subcategories : [],
          title: cls.plan.title,
          summary: cls.plan.summary || null,
          next_step: cls.plan.next_step || null,
          last_discussed_at: new Date().toISOString(),
          source_session_id: sessionId,
        })
        .select("id")
        .single();
      pinnedPlan = plan?.id || null;
    }

    // Compose assistant reply with context
    const system = `You are Acharya, an operator-mentor. Be concise. Use user's tone if given. If a plan exists, reflect and propose next logical step.`;
    const contextPrompt = await buildContextBudgeted(sessionId, cls?.hub, pinnedPlan);
    const t1 = Date.now();
    let reply = (await generateText({ model: TEXT_MODEL_PRIMARY, system, prompt: trimText(`CONTEXT=${contextPrompt}\nUSER=${message}`, 7000), maxTokens: OUTPUT_TOKENS })).content;
    await logLLM(userId, "chat.reply", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t1 });
    if (!reply) {
      reply = (await generateText({ model: TEXT_MODEL_FALLBACK, system, prompt: trimText(`CONTEXT=${contextPrompt}\nUSER=${message}`, 7000), maxTokens: OUTPUT_TOKENS })).content;
      await logLLM(userId, "chat.reply", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
    }

    await supabase.from("chat_messages").insert({ session_id: sessionId, user_id: userId, role: "assistant", content: reply, hub: cls?.hub || null, subcategories: Array.isArray(cls?.subcategories) ? cls.subcategories : [] });
    return { reply, sessionId, pinnedPlanId: pinnedPlan, classification: cls };
  }, [userId, createOrGetSession]);
  const addReflection = useCallback(async (payload: { type: "journal" | "insight" | "goal" | "gratitude"; content: string }) => {
    if (!userId) throw new Error("No user");
    const { data: inserted, error } = await supabase
      .from("cognitive_reflections")
      .insert({ user_id: userId, content: payload.content })
      .select("id, content, created_at")
      .single();
    if (error) throw error;

    // AI-powered sentiment and topic extraction
    const startSenti = Date.now();
    const senti = await analyzeSentiment(payload.content);
    await logLLM(userId, "reflection.sentiment", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - startSenti });

    const startTopics = Date.now();
    const topics = await extractTopics(payload.content);
    await logLLM(userId, "reflection.topics", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - startTopics });

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
      const summary = (await generateText({
        model: TEXT_MODEL_PRIMARY,
        system: sys,
        prompt: trimText(payload.content, 2000),
        maxTokens: 300,
      })).content;
      await logLLM(userId, "reflection.summary", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
      ai_summary = summary;
    } catch (e: any) {
      try {
        const t1 = Date.now();
        const summary2 = (await generateText({
          model: TEXT_MODEL_FALLBACK,
          system: sys,
          prompt: trimText(payload.content, 2000),
          maxTokens: 300,
        })).content;
        await logLLM(userId, "reflection.summary", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
        ai_summary = summary2;
      } catch (e2: any) {
        await logLLM(userId, "reflection.summary", TEXT_MODEL_FALLBACK, "failure", { error: e2?.message });
      }
    }
    if (ai_summary) {
      await supabase.from("cognitive_reflections").update({ ai_summary }).eq("id", inserted.id);
    }

    // Lightweight classification for journaling
    try {
      const classifyPrompt = `Classify reflection. Output JSON {intent: journal|insight|plan|issue, hub: marketing|sales|finance|ops|hr|legal|cognitive, subcategories: string[], sentiment: string, tags: string[]}`;
      let res = (await generateText({ model: TEXT_MODEL_PRIMARY, system: classifyPrompt, prompt: trimText(payload.content, 3500), json: true as any, maxTokens: 300 })).content;
      try { const cls = JSON.parse(res);
        await supabase.from("journal_classifications").insert({ user_id: userId, reflection_id: inserted.id, intent: cls?.intent || 'journal', hub: cls?.hub || null, subcategories: Array.isArray(cls?.subcategories)? cls.subcategories:[], sentiment: cls?.sentiment || null, tags: Array.isArray(cls?.tags)? cls.tags: [] });
      } catch {}
    } catch {}

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
        jsonText = (await generateText({
          model: TEXT_MODEL_PRIMARY,
          system: "You output strict JSON with fields: moodAverage, topMoods, themes, insights[3], actions[3].",
          prompt: trimText(prompt, 6000),
          json: true,
          maxTokens: 500,
        })).content;
        await logLLM(userId, "weekly.snapshot", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
      } catch {
        try {
          const t1 = Date.now();
          jsonText = (await generateText({
            model: TEXT_MODEL_FALLBACK,
            system: "You output strict JSON with fields: moodAverage, topMoods, themes, insights[3], actions[3].",
            prompt: trimText(prompt, 6000),
            json: true,
            maxTokens: 500,
          })).content;
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
      reply = (await generateText({
        model: TEXT_MODEL_PRIMARY,
        system,
        prompt: trimText(`CONTEXT=${contextPrompt}\nUSER=${message}`, 6000),
        maxTokens: 420,
      })).content;
      await logLLM(userId, "chat.reply", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
    } catch {
      try {
        const t1 = Date.now();
        reply = (await generateText({
          model: TEXT_MODEL_FALLBACK,
          system,
          prompt: trimText(`CONTEXT=${contextPrompt}\nUSER=${message}`, 6000),
          maxTokens: 420,
        })).content;
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
    const prompt = `Using themes=${JSON.stringify(ctx.goalsThemes)}, generate exactly 5 startup ideas. Output as a JSON array directly, not wrapped in an object. Each idea should have: title, category, rationale, nextStep. Keep each field under 160 chars. Example: [{"title": "...", "category": "...", "rationale": "...", "nextStep": "..."}, ...]`;
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    try {
      const t0 = Date.now();
      const json = (await generateText({ model: TEXT_MODEL_PRIMARY, system, prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 })).content;
      await logLLM(userId, "ideas.generate", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
      const parsed = JSON.parse(json);
      // Handle case where JSON mode returns an object with an array inside
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed && typeof parsed === 'object') {
        // Check common keys where array might be nested
        if (Array.isArray(parsed.ideas)) return parsed.ideas;
        if (Array.isArray(parsed.items)) return parsed.items;
        if (Array.isArray(parsed.result)) return parsed.result;
        // If it's an object with array values, return first array found
        const arrays = Object.values(parsed).filter(Array.isArray);
        if (arrays.length > 0) return arrays[0] as any[];
      }
      return [];
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("429") || msg.includes("rate") || msg.includes("402")) {
        const t1 = Date.now();
        const json2 = (await generateText({ model: TEXT_MODEL_FALLBACK, system, prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 })).content;
        await logLLM(userId, "ideas.generate", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
        try {
          const parsed = JSON.parse(json2);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.ideas)) return parsed.ideas;
            if (Array.isArray(parsed.items)) return parsed.items;
            if (Array.isArray(parsed.result)) return parsed.result;
            const arrays = Object.values(parsed).filter(Array.isArray);
            if (arrays.length > 0) return arrays[0] as any[];
          }
          return [];
        } catch { return []; }
      }
      return [];
    }
  }, [userId]);

  const saveIdea = useCallback(async (idea: { title: string; category?: string; rationale?: string; nextStep?: string }) => {
    if (!userId) throw new Error("No user");
    // Combine rationale and nextStep into description field
    const description = [idea.rationale, idea.nextStep].filter(Boolean).join(". ");
    const { data, error } = await supabase
      .from("cognitive_ideas")
      .insert({ user_id: userId, title: idea.title, category: idea.category, description: description || null, status: "brainstorm", priority: 5 })
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
      res = (await generateText({ model: TEXT_MODEL_PRIMARY, system: "Summarize reflections into themes and 3 actions. Output JSON.", prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 })).content;
      await logLLM(userId, "range.summary", TEXT_MODEL_PRIMARY, "success", { durationMs: Date.now() - t0 });
    } catch {
      const t1 = Date.now();
      res = (await generateText({ model: TEXT_MODEL_FALLBACK, system: "Summarize reflections into themes and 3 actions. Output JSON.", prompt: trimText(prompt, 6000), json: true as any, maxTokens: 600 })).content;
      await logLLM(userId, "range.summary", TEXT_MODEL_FALLBACK, "success", { durationMs: Date.now() - t1 });
    }
    try { return JSON.parse(res); } catch { return { raw: res }; }
  }, [userId]);

  const preflightLLM = useCallback(async () => {
    return preflightTextRoute([TEXT_MODEL_PRIMARY, TEXT_MODEL_FALLBACK]);
  }, []);

  return { addReflection, weeklyOverview, cognitiveChat, generateIdeas, saveIdea, suggestSlots, createEvent, fetchReflectionById, fetchIdeasByStatus, summarizeRange, preflightLLM, sendChatWithPlanExtract, pinPlanToSession };
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


