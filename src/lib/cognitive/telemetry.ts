import { supabase } from "@/integrations/supabase/client";

type Status = "success" | "failure" | "skip";

export interface TelemetryDetails {
  model?: string;
  tokens?: number;
  durationMs?: number;
  error?: string;
  skillId?: string;
  payloadSize?: number;
  note?: string;
}

export async function logOpsAgentic(userId: string, action: string, status: Status, details?: TelemetryDetails) {
  try {
    await supabase
      .from("ops_agentic_logs")
      .insert({
        user_id: userId,
        agent: "cognitive",
        action,
        status,
        details: sanitize(details),
      });
  } catch {}
}

export async function logLLM(userId: string, action: string, model: string, status: Status, meta?: { tokens?: number; durationMs?: number; error?: string }) {
  return logOpsAgentic(userId, action, status, { model, tokens: meta?.tokens, durationMs: meta?.durationMs, error: meta?.error });
}

export async function logSkill(userId: string, skillId: string, status: Status, meta?: { durationMs?: number; error?: string; payloadSize?: number }) {
  return logOpsAgentic(userId, `skill:${skillId}`, status, { skillId, durationMs: meta?.durationMs, error: meta?.error, payloadSize: meta?.payloadSize });
}

function sanitize(details?: TelemetryDetails) {
  if (!details) return null;
  // Avoid storing large payloads or PII
  const { note, model, tokens, durationMs, error, skillId, payloadSize } = details;
  return { note, model, tokens, durationMs, error: truncate(error), skillId, payloadSize } as TelemetryDetails;
}

function truncate(s?: string, max = 300) {
  if (!s) return s;
  return s.length > max ? s.slice(0, max) + "…" : s;
}


