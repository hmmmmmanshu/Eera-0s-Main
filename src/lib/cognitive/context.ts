import { supabase } from "@/integrations/supabase/client";

export interface CognitiveContext {
  userProfile: {
    id: string;
    name?: string;
    timezone?: string;
    tone?: string;
    language?: string;
  };
  currentWeek: {
    moodAverage: number | null;
    moods: Array<{ date: string; score: number; tags?: string[] }>; // last 7 days
    topTags: string[];
  };
  recentReflections: Array<{ id: string; created_at: string; text: string; ai_summary?: string | null }>;
  activeIdeas: Array<{ id: string; title: string; category?: string; priority?: number }>;
  upcomingEvents: Array<{ id: string; title: string; start_time: string; end_time?: string | null }>;
  goalsThemes: string[];
}

/**
 * Assemble a compact per-request context snapshot (~4–8KB).
 * Fetches only minimal fields and defers heavy content.
 */
export async function assembleCognitiveContext(userId: string): Promise<CognitiveContext> {
  // Profile basics
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, startup_name, timezone, tone_personality")
    .eq("id", userId)
    .single();

  // Last 7 days moods
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: moodsData } = await supabase
    .from("cognitive_moods")
    .select("created_at, intensity, tags")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const moods = (moodsData || []).map((m) => ({
    date: m.created_at,
    score: m.intensity ?? 0,
    tags: Array.isArray(m.tags) ? m.tags : [],
  }));
  const moodAverage = moods.length ? Number((moods.reduce((a, b) => a + (b.score || 0), 0) / moods.length).toFixed(2)) : null;
  const tagCounter: Record<string, number> = {};
  moods.forEach((m) => (m.tags || []).forEach((t) => (tagCounter[t] = (tagCounter[t] || 0) + 1)));
  const topTags = Object.entries(tagCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => t);

  // Recent reflections
  const { data: reflections } = await supabase
    .from("cognitive_reflections")
    .select("id, created_at, content, ai_summary")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Active ideas (top priority)
  const { data: ideas } = await supabase
    .from("cognitive_ideas")
    .select("id, title, category, status, priority")
    .eq("user_id", userId)
    .in("status", ["new", "active"]) as any;

  const topIdeas = (ideas || [])
    .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 5)
    .map((i: any) => ({ id: i.id, title: i.title, category: i.category, priority: i.priority }));

  // Upcoming events (7 days)
  const { data: events } = await supabase
    .from("cognitive_events")
    .select("id, title, start_time, end_time")
    .eq("user_id", userId)
    .gte("start_time", since)
    .order("start_time", { ascending: true })
    .limit(20);

  // Themes: from profile + frequent reflection tags
  const profileThemes: string[] = [];
  if (profile?.tone_personality) profileThemes.push(profile.tone_personality);
  const themes = Array.from(new Set([...profileThemes, ...topTags])).slice(0, 10);

  return {
    userProfile: {
      id: userId,
      name: profile?.startup_name,
      timezone: profile?.timezone,
      tone: profile?.tone_personality,
      language: undefined,
    },
    currentWeek: { moodAverage, moods, topTags },
    recentReflections: (reflections || []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      text: r.content,
      ai_summary: r.ai_summary,
    })),
    activeIdeas: topIdeas,
    upcomingEvents: (events || []).map((e: any) => ({ id: e.id, title: e.title, start_time: e.start_time, end_time: e.end_time })),
    goalsThemes: themes,
  };
}


