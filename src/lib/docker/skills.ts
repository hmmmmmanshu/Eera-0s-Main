/** Docker skills orchestrator
 * - Attempts to call Docker Engine API to ensure a container is running
 * - If Docker is not available, degrades gracefully and returns null
 * - Each skill exposes HTTP on localhost:port
 */

export interface Skill {
  id: string;
  image: string; // docker image name
  port: number; // host port expected
  healthPath?: string; // e.g., /healthz
  endpointPath: string; // task endpoint, e.g. /run
  expectedLatencyMs?: number;
}

export const SKILLS: Record<string, Skill> = {
  sentiment: {
    id: "sentiment",
    image: "ghcr.io/local-ai/sentiment:latest",
    port: 7011,
    healthPath: "/healthz",
    endpointPath: "/analyze",
    expectedLatencyMs: 1200,
  },
  topics: {
    id: "topics",
    image: "ghcr.io/local-ai/keywords:latest",
    port: 7012,
    healthPath: "/healthz",
    endpointPath: "/extract",
    expectedLatencyMs: 1800,
  },
  task_extractor: {
    id: "task_extractor",
    image: "ghcr.io/acharya-ai/task-extractor:latest",
    port: 7021,
    healthPath: "/healthz",
    endpointPath: "/run",
    expectedLatencyMs: 1500,
  },
  sop_parser: {
    id: "sop_parser",
    image: "ghcr.io/acharya-ai/sop-parser:latest",
    port: 7022,
    healthPath: "/healthz",
    endpointPath: "/run",
    expectedLatencyMs: 2000,
  },
  workflow_runner: {
    id: "workflow_runner",
    image: "ghcr.io/acharya-ai/workflow-runner:latest",
    port: 7031,
    healthPath: "/healthz",
    endpointPath: "/run",
    expectedLatencyMs: 2500,
  },
  scheduler: {
    id: "scheduler",
    image: "ghcr.io/acharya-ai/scheduler:latest",
    port: 7041,
    healthPath: "/healthz",
    endpointPath: "/run",
    expectedLatencyMs: 1000,
  },
  metrics_aggregator: {
    id: "metrics_aggregator",
    image: "ghcr.io/acharya-ai/metrics-aggregator:latest",
    port: 7051,
    healthPath: "/healthz",
    endpointPath: "/run",
    expectedLatencyMs: 1800,
  },
};

export interface SkillStatus {
  dockerAvailable: boolean;
  skills: Array<{ id: string; healthy: boolean }>;
}

export async function isDockerAvailable(): Promise<boolean> {
  try {
    // Docker Desktop can expose 2375 if enabled; otherwise this will fail quickly.
    const res = await fetch("http://localhost:2375/_ping", { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ensureSkill(skill: Skill): Promise<boolean> {
  // Try health check first
  try {
    const healthUrl = `http://127.0.0.1:${skill.port}${skill.healthPath || "/healthz"}`;
    const h = await fetch(healthUrl);
    if (h.ok) return true;
  } catch {}

  // If Docker API not available, degrade
  if (!(await isDockerAvailable())) {
    console.warn(`[docker skills] Docker not available; skipping start for ${skill.id}`);
    return false;
  }

  // Minimal attempt: try to start container if exists by image name (best-effort).
  // Note: comprehensive container management intentionally skipped for safety.
  try {
    // List containers by image
    const containers = await fetch("http://localhost:2375/containers/json").then((r) => r.json());
    const running = containers?.some((c: any) => c.Image?.includes(skill.image));
    if (running) return true;
  } catch {}

  console.info(`[docker skills] Skill ${skill.id} not running; please start ${skill.image} mapping port ${skill.port}`);
  return false;
}

export async function runSkill<TReq extends object, TRes = any>(skillId: keyof typeof SKILLS, payload: TReq): Promise<TRes | null> {
  const skill = SKILLS[skillId as string];
  if (!skill) throw new Error(`Unknown skill: ${String(skillId)}`);

  const ready = await ensureSkill(skill);
  if (!ready) return null;

  const url = `http://127.0.0.1:${skill.port}${skill.endpointPath}`;
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) return null;
    return (await res.json()) as TRes;
  } catch (e) {
    console.warn(`[docker skills] call failed for ${skill.id}`, e);
    return null;
  }
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

export async function runSkillUnified<T = any>(skillId: keyof typeof SKILLS, input: any, userId?: string, traceId?: string): Promise<RunnerOutput<T>> {
  const skill = SKILLS[skillId as string];
  if (!skill) return { status: "error", code: "unknown_skill", message: String(skillId) };
  const ready = await ensureSkill(skill);
  if (!ready) return { status: "error", code: "not_available", message: "Docker or skill offline" };
  const url = `http://127.0.0.1:${skill.port}${skill.endpointPath}`;
  const payload: RunnerInput = { skillId: String(skillId), input, userContext: userId ? { userId } : undefined, traceId };
  try {
    const started = Date.now();
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const elapsed = Date.now() - started;
    if (!res.ok) {
      const text = await res.text();
      return { status: "error", code: `http_${res.status}`, message: text || res.statusText, timingsMs: elapsed };
    }
    const data = await res.json();
    return { status: "ok", output: data, timingsMs: elapsed };
  } catch (e: any) {
    return { status: "error", code: "network", message: e?.message || "network error" };
  }
}


