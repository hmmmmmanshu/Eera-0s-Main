/** Supabase Edge Functions skills orchestrator
 * - Calls Supabase Edge Functions instead of local Docker containers
 * - Works on Vercel and local dev (via Supabase)
 */

export interface Skill {
  id: string;
  edgeFunction: string; // Edge Function name/path, e.g. "ops-skills/task-extractor"
  expectedLatencyMs?: number;
}

export const SKILLS: Record<string, Skill> = {
  task_extractor: {
    id: "task_extractor",
    edgeFunction: "ops-skills/task-extractor",
    expectedLatencyMs: 1500,
  },
  sop_parser: {
    id: "sop_parser",
    edgeFunction: "ops-skills/sop-parser",
    expectedLatencyMs: 2000,
  },
  workflow_runner: {
    id: "workflow_runner",
    edgeFunction: "ops-skills/workflow-runner",
    expectedLatencyMs: 2500,
  },
  scheduler: {
    id: "scheduler",
    edgeFunction: "ops-skills/scheduler",
    expectedLatencyMs: 1000,
  },
  metrics_aggregator: {
    id: "metrics_aggregator",
    edgeFunction: "ops-skills/metrics-aggregator",
    expectedLatencyMs: 1800,
  },
};

export interface SkillStatus {
  edgeFunctionsAvailable: boolean;
  skills: Array<{ id: string; healthy: boolean }>;
}

// Unified runner payload for Ops skills
export interface RunnerInput {
  skillId: string;
  input: any;
  userContext?: { userId: string };
  traceId?: string;
}

export interface RunnerOutput<T = any> {
  status: "ok" | "error";
  output?: T;
  code?: string;
  message?: string;
  timingsMs?: number;
}

export async function runSkillUnified<T = any>(
  skillId: keyof typeof SKILLS,
  input: any,
  userId?: string,
  traceId?: string
): Promise<RunnerOutput<T>> {
  const skill = SKILLS[skillId as string];
  if (!skill) return { status: "error", code: "unknown_skill", message: String(skillId) };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (!supabaseUrl || !supabaseKey) {
    // Gracefully degrade - don't throw error, just return failure
    console.warn("[skills] Supabase config missing - Edge Functions unavailable");
    return { status: "error", code: "config_missing", message: "Edge Functions not available in basic mode" };
  }

  const url = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${skill.edgeFunction}`;
  const payload: RunnerInput = { skillId: String(skillId), input, userContext: userId ? { userId } : undefined, traceId };

  try {
    const started = Date.now();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - started;

    if (!res.ok) {
      const text = await res.text();
      return { status: "error", code: `http_${res.status}`, message: text || res.statusText, timingsMs: elapsed };
    }

    const data = (await res.json()) as T;
    return { status: "ok", output: data, timingsMs: elapsed };
  } catch (e: any) {
    return { status: "error", code: "network", message: e?.message || "network error" };
  }
}

// Skills status helper used by UI to display availability
export async function getSkillsStatus(): Promise<SkillStatus> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (!supabaseUrl || !supabaseKey) {
    return { edgeFunctionsAvailable: false, skills: [] };
  }

  const entries = Object.values(SKILLS);
  const results: Array<{ id: string; healthy: boolean }> = [];

  for (const s of entries) {
    let healthy = false;
    try {
      const url = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${s.edgeFunction}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ __health: true }),
      });
      healthy = res.status !== 404;
    } catch {
      healthy = false;
    }
    results.push({ id: s.id, healthy });
  }

  return { edgeFunctionsAvailable: results.some((s) => s.healthy), skills: results };
}

// Back-compat simple runner used by some hooks
export async function runSkill<TReq extends object, TRes = any>(
  skillId: keyof typeof SKILLS,
  payload: TReq
): Promise<TRes | null> {
  const res = await runSkillUnified<TRes>(skillId, payload);
  if (res.status === "ok") return (res.output as TRes) ?? null;
  return null;
}


