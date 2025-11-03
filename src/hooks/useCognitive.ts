import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { assembleCognitiveContext } from "@/lib/cognitive/context";
import { getOrCreateWeeklySnapshot, saveSessionMessage, type Persona } from "@/lib/cognitive/memory";
import { generateChatResponse, generateChatResponseStreaming, classifyChatMessage, type ChatMessage } from "@/lib/gemini";
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
      
      const jsonResponse = await generateChatResponse({
        systemPrompt: "You are a sentiment analyzer. Output strict JSON only. Use this format: {\"score\": number, \"emotions\": [\"string\", \"string\"]}",
        messages: [{ role: "user", content: trimText(prompt, 3000) }],
        jsonMode: true,
        maxTokens: 150,
      });
      
      const parsed = JSON.parse(jsonResponse);
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
      
      const jsonResponse = await generateChatResponse({
        systemPrompt: "You are a topic extractor. Output strict JSON only. Use this format: {\"keywords\": [\"string\", \"string\"]}",
        messages: [{ role: "user", content: trimText(prompt, 3000) }],
        jsonMode: true,
        maxTokens: 150,
      });
      
      const parsed = JSON.parse(jsonResponse);
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
    
    // Classify message to determine category and hub
    const t0 = Date.now();
    let classification: {
      hub: string | null;
      category: string;
      subcategories: string[];
      intent: string;
    };
    try {
      classification = await classifyChatMessage(message);
      await logLLM(userId, "chat.classify", "gemini", "success", { durationMs: Date.now() - t0 });
    } catch (error) {
      console.error("Classification error:", error);
      classification = { hub: null, category: "general", subcategories: [], intent: "question" };
      await logLLM(userId, "chat.classify", "gemini", "failure", { error: (error as Error)?.message });
    }

    // Save user message with classification
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: userId,
      role: "user",
      content: message,
      hub: classification.hub,
      category: classification.category,
      subcategories: classification.subcategories,
    });

    // Update session with category if not set
    if (classification.category && classification.category !== "general") {
      await supabase
        .from("chat_sessions")
        .update({ category: classification.category, active_hub: classification.hub })
        .eq("id", sessionId);
    }

    // Get recent messages for context (reduced to 5 for faster loading)
    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Build context for assistant
    const contextPrompt = await buildContextBudgeted(sessionId, classification.hub || undefined, null);
    
    // Build message history for Gemini
    const chatHistory: ChatMessage[] = [
      {
        role: "system",
        content: `You are Acharya, an operator-mentor. Always reply in this structure:\n\nSummary:\n- one sentence\n\nRecommendations:\n- 2-3 bullets\n\nNext steps:\n- 2-3 concrete bullets\n\nUse user's tone if given. Context: ${contextPrompt}`,
      },
    ];

    // Add recent conversation history (in chronological order, limit to last 4)
    if (recentMessages && recentMessages.length > 0) {
      const sortedMessages = [...recentMessages].reverse();
      for (const msg of sortedMessages.slice(0, 4)) {
        chatHistory.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    // Add current user message
    chatHistory.push({
      role: "user",
      content: message,
    });

    // Generate reply using Gemini
    const t1 = Date.now();
    let reply: string;
    try {
      reply = await generateChatResponse({
        systemPrompt: `You are Acharya, an operator-mentor helping founders. Be concise, actionable, and empathetic.\n\nAlways reply using this structure:\nSummary (one sentence)\nRecommendations (bullets)\nNext steps (bullets)\n\nContext about the user: ${contextPrompt}`,
        messages: chatHistory,
        temperature: 0.7,
        maxTokens: OUTPUT_TOKENS,
      });
      await logLLM(userId, "chat.reply", "gemini", "success", { durationMs: Date.now() - t1 });
    } catch (error) {
      console.error("Chat generation error:", error);
      reply = "I'm having trouble processing that right now. Could you try rephrasing?";
      await logLLM(userId, "chat.reply", "gemini", "failure", { error: (error as Error)?.message });
    }

    // Save assistant reply with classification
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: userId,
      role: "assistant",
      content: reply,
      hub: classification.hub,
      category: classification.category,
      subcategories: classification.subcategories,
    });

    // Check if we should create a plan (if intent is "plan")
    let pinnedPlan: string | null = null;
    if (classification.intent === "plan" && classification.hub) {
      // Try to extract plan details from the conversation
      try {
        const planExtractPrompt = `Extract actionable plan details from this conversation. Output JSON: {title: string, summary: string, next_step: string} | null`;
        const planJson = await generateChatResponse({
          systemPrompt: planExtractPrompt,
          messages: chatHistory,
          jsonMode: true,
          maxTokens: 200,
        });
        const planData = JSON.parse(planJson);
        
        if (planData?.title) {
          const { data: plan } = await supabase
            .from("hub_plans")
            .insert({
              user_id: userId,
              hub: classification.hub,
              subcategories: classification.subcategories,
              title: planData.title,
              summary: planData.summary || null,
              next_step: planData.next_step || null,
              last_discussed_at: new Date().toISOString(),
              source_session_id: sessionId,
            })
            .select("id")
            .single();
          pinnedPlan = plan?.id || null;
          
          if (pinnedPlan) {
            await supabase.from("chat_sessions").update({ pinned_plan_id: pinnedPlan }).eq("id", sessionId);
          }
        }
      } catch (error) {
        console.error("Plan extraction error:", error);
      }
    }

    return {
      reply,
      sessionId,
      pinnedPlanId: pinnedPlan,
      classification,
    };
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
      const summary = await generateChatResponse({ systemPrompt: sys, messages: [{ role: "user", content: trimText(payload.content, 2000) }], maxTokens: 300 });
      await logLLM(userId, "reflection.summary", "gemini", "success", { durationMs: Date.now() - t0 });
      ai_summary = summary;
    } catch (e: any) {
      await logLLM(userId, "reflection.summary", "gemini", "failure", { error: e?.message });
    }
    if (ai_summary) {
      await supabase.from("cognitive_reflections").update({ ai_summary }).eq("id", inserted.id);
    }

    // Lightweight classification for journaling
    try {
      const classifyPrompt = `Classify reflection. Output JSON {intent: journal|insight|plan|issue, hub: marketing|sales|finance|ops|hr|legal|cognitive, subcategories: string[], sentiment: string, tags: string[]}`;
      let res = await generateChatResponse({ systemPrompt: classifyPrompt, messages: [{ role: "user", content: trimText(payload.content, 3500) }], jsonMode: true, maxTokens: 300 });
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
      try {
        const t0 = Date.now();
        const jsonText = await generateChatResponse({ systemPrompt: "You output strict JSON with fields: moodAverage, topMoods, themes, insights[3], actions[3].", messages: [{ role: "user", content: trimText(prompt, 6000) }], jsonMode: true, maxTokens: 500 });
        await logLLM(userId, "weekly.snapshot", "gemini", "success", { durationMs: Date.now() - t0 });
        try { return JSON.parse(jsonText); } catch {}
      } catch {}
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
    
    // Create or get session for this persona chat
    const sessionId = await createOrGetSession("cognitive");
    
    // Classify the message
    const classification = await classifyChatMessage(message);
    
    // Save user message
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: userId,
      role: "user",
      content: message,
      hub: "cognitive",
      category: classification.category,
      subcategories: classification.subcategories,
    });
    
    // Also save to sessionStorage for backward compatibility
    saveSessionMessage({ role: "user", content: message, ts: Date.now(), persona });
    
    const ctx = await assembleCognitiveContext(userId);
    const system = `${personaSystem(persona, ctx.userProfile.tone)}\n\nAlways reply using this structure:\nSummary (one sentence)\nRecommendations (bullets)\nNext steps (bullets)`;
    const contextPrompt = JSON.stringify({
      profile: ctx.userProfile,
      week: ctx.currentWeek,
      snapshot_hint: "Use the latest weekly snapshot if available.",
    });
    
    if (!withinBudget()) throw new Error("Rate limit: please wait a few seconds.");
    
    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(10);
    
    // Build chat history
    const chatHistory: ChatMessage[] = [
      {
        role: "system",
        content: `${system}\n\nContext: ${contextPrompt}`,
      },
    ];
    
    if (recentMessages && recentMessages.length > 0) {
      const sortedMessages = [...recentMessages].reverse();
      for (const msg of sortedMessages.slice(0, 9)) {
        chatHistory.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }
    
    chatHistory.push({ role: "user", content: message });
    
    let reply: string | null = null;
    try {
      const t0 = Date.now();
      reply = await generateChatResponse({
        systemPrompt: system,
        messages: chatHistory,
        temperature: 0.7,
        maxTokens: 420,
      });
      await logLLM(userId, "chat.reply", "gemini", "success", { durationMs: Date.now() - t0 });
    } catch (error) {
      console.error("Cognitive chat error:", error);
      await logLLM(userId, "chat.reply", "gemini", "failure", { error: (error as Error)?.message });
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
    
    // Save assistant reply
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: userId,
      role: "assistant",
      content: finalReply,
      hub: "cognitive",
      category: classification.category,
      subcategories: classification.subcategories,
    });
    
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
      const json = await generateChatResponse({ systemPrompt: system, messages: [{ role: "user", content: trimText(prompt, 6000) }], jsonMode: true, maxTokens: 600 });
      await logLLM(userId, "ideas.generate", "gemini", "success", { durationMs: Date.now() - t0 });
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
    } catch { return []; }
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
    try {
      const t0 = Date.now();
      const res = await generateChatResponse({ systemPrompt: "Summarize reflections into themes and 3 actions. Output JSON.", messages: [{ role: "user", content: trimText(prompt, 6000) }], jsonMode: true, maxTokens: 600 });
      await logLLM(userId, "range.summary", "gemini", "success", { durationMs: Date.now() - t0 });
      try { return JSON.parse(res); } catch { return { raw: res }; }
    } catch (e) { return { error: (e as any)?.message }; }
  }, [userId]);

  const preflightLLM = useCallback(async () => {
    // Check if Gemini API is configured
    try {
      const { getGeminiModel } = await import("@/lib/gemini");
      await getGeminiModel();
      return { model: "gemini", ok: true };
    } catch (error) {
      return { model: null, ok: false, message: (error as Error)?.message || "Gemini not configured" };
    }
  }, []);

  // Streaming version of sendChatWithPlanExtract
  const sendChatWithPlanExtractStreaming = useCallback(async function* (
    message: string
  ): AsyncGenerator<{ chunk?: string; complete?: { reply: string; sessionId: string; pinnedPlanId: string | null; classification: any } }, void, unknown> {
    if (!userId) throw new Error("No user");
    const sessionId = await createOrGetSession();
    
    // Start classification and context loading in parallel for faster response
    const classificationPromise = classifyChatMessage(message).catch(() => ({ 
      hub: null, category: "general", subcategories: [], intent: "question" 
    }));
    const recentMessagesPromise = supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(5);
    const contextPromise = buildContextBudgeted(sessionId, undefined, null);

    // Wait for classification (faster)
    const classification = await classificationPromise;

    // Save user message immediately (optimistic)
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: userId,
      role: "user",
      content: message,
      hub: classification.hub,
      category: classification.category,
      subcategories: classification.subcategories,
    });

    // Get messages and context in parallel
    const { data: recentMessages } = await recentMessagesPromise;
    const contextPrompt = await contextPromise;

    // Build chat history (reduced context)
    const chatHistory: ChatMessage[] = [{
      role: "system",
      content: `You are Acharya, an operator-mentor. Be concise. Context: ${contextPrompt}`,
    }];

    if (recentMessages && recentMessages.length > 0) {
      const sortedMessages = [...recentMessages].reverse().slice(0, 4);
      for (const msg of sortedMessages) {
        chatHistory.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    chatHistory.push({ role: "user", content: message });

    // Stream response
    let fullReply = "";
    try {
      const stream = generateChatResponseStreaming({
        systemPrompt: `You are Acharya, an operator-mentor helping founders. Be concise, actionable, and empathetic. Context: ${contextPrompt}`,
        messages: chatHistory,
        temperature: 0.7,
        maxTokens: OUTPUT_TOKENS,
      });

      for await (const chunk of stream) {
        fullReply += chunk;
        yield { chunk };
      }

      // Save complete reply
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        user_id: userId,
        role: "assistant",
        content: fullReply,
        hub: classification.hub,
        category: classification.category,
        subcategories: classification.subcategories,
      });

      // Extract plan in background (don't wait)
      let pinnedPlan: string | null = null;
      if (classification.intent === "plan" && classification.hub) {
        // Do this async, don't block
        (async () => {
          try {
            const planJson = await generateChatResponse({
              systemPrompt: `Extract actionable plan details. Output JSON: {title: string, summary: string, next_step: string} | null`,
              messages: chatHistory,
              jsonMode: true,
              maxTokens: 200,
            });
            const planData = JSON.parse(planJson);
            if (planData?.title) {
              const { data: plan } = await supabase
                .from("hub_plans")
                .insert({
                  user_id: userId,
                  hub: classification.hub,
                  subcategories: classification.subcategories,
                  title: planData.title,
                  summary: planData.summary || null,
                  next_step: planData.next_step || null,
                  last_discussed_at: new Date().toISOString(),
                  source_session_id: sessionId,
                })
                .select("id")
                .single();
              if (plan?.id) {
                await supabase.from("chat_sessions").update({ pinned_plan_id: plan.id }).eq("id", sessionId);
              }
            }
          } catch (error) {
            console.error("Plan extraction error:", error);
          }
        })();
      }

      yield { 
        complete: { 
          reply: fullReply, 
          sessionId, 
          pinnedPlanId: pinnedPlan, 
          classification 
        } 
      };
    } catch (error) {
      console.error("Chat streaming error:", error);
      const errorReply = "I'm having trouble processing that right now. Could you try rephrasing?";
      yield { chunk: errorReply };
      yield { 
        complete: { 
          reply: errorReply, 
          sessionId, 
          pinnedPlanId: null, 
          classification 
        } 
      };
    }
  }, [userId, createOrGetSession]);

  // Utility: list recent messages for a session
  const listRecentMessages = useCallback(async (sessionId: string, limit = 20) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw error; return data || [];
  }, []);

  return { addReflection, weeklyOverview, cognitiveChat, generateIdeas, saveIdea, suggestSlots, createEvent, fetchReflectionById, fetchIdeasByStatus, summarizeRange, preflightLLM, sendChatWithPlanExtract, sendChatWithPlanExtractStreaming, pinPlanToSession, listRecentMessages, createOrGetSession };
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


