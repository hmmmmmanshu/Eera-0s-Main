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
  endpointPath: string; // task endpoint, e.g. /analyze
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
};

async function dockerAvailable(): Promise<boolean> {
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
  if (!(await dockerAvailable())) {
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


