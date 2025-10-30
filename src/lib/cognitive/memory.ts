import { supabase } from "@/integrations/supabase/client";

export type Persona = "friend" | "guide" | "mentor" | "ea";

const SESSION_KEY = "cognitive_session_history";

export interface SessionMessage {
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
  persona?: Persona;
}

export function loadSessionMessages(): SessionMessage[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveSessionMessage(msg: SessionMessage) {
  const cur = loadSessionMessages();
  const next = [...cur, msg].slice(-10); // keep last 10
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
}

export interface WeeklySnapshot {
  id?: string;
  user_id: string;
  week_start: string; // ISO Monday
  payload: any; // compact JSON
  created_at?: string;
}

export async function getOrCreateWeeklySnapshot(userId: string, generator: () => Promise<any>): Promise<WeeklySnapshot> {
  const monday = getMondayISO(new Date());
  const { data: existing } = await supabase
    .from("ai_context_snapshots")
    .select("id, user_id, week_start, payload, created_at")
    .eq("user_id", userId)
    .eq("week_start", monday)
    .limit(1)
    .maybeSingle();

  if (existing) return existing as WeeklySnapshot;

  const payload = await generator();
  const { data: inserted, error } = await supabase
    .from("ai_context_snapshots")
    .insert({ user_id: userId, week_start: monday, payload })
    .select("id, user_id, week_start, payload, created_at")
    .single();
  if (error) throw error;
  return inserted as WeeklySnapshot;
}

function getMondayISO(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}


