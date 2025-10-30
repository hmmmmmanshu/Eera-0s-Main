import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { assembleCognitiveContext } from "@/lib/cognitive/context";
import { getOrCreateWeeklySnapshot, saveSessionMessage, type Persona } from "@/lib/cognitive/memory";
import { runSkill } from "@/lib/docker/skills";
import { generateText } from "@/lib/openrouter";

export function useCognitiveActions(userId?: string | null) {
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
    const summary = await generateText({
      model: "google/gemini-2.0-flash-exp:free",
      system: sys,
      prompt: payload.content,
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
      const summary = await generateText({
        model: "google/gemini-2.0-flash-exp:free",
        system: "You output strict JSON with fields: moodAverage, topMoods, themes, insights[3], actions[3].",
        prompt,
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
    const reply = await generateText({
      model: "google/gemini-2.0-flash-exp:free",
      system,
      prompt: `CONTEXT=${contextPrompt}\nUSER=${message}`,
      maxTokens: 480,
    });
    saveSessionMessage({ role: "assistant", content: reply, ts: Date.now(), persona });
    return reply;
  }, [userId]);

  return { addReflection, weeklyOverview, cognitiveChat };
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


