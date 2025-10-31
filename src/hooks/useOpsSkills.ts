import { useCallback } from "react";
import { runSkillUnified } from "@/lib/docker/skills";
import { supabase } from "@/integrations/supabase/client";
import { logOpsAgentic } from "@/lib/cognitive/telemetry";

export function useOpsSkills(userId?: string | null) {
  const quickAddTaskFromNote = useCallback(async (note: string) => {
    if (!userId) throw new Error("No user");
    const res = await runSkillUnified<{ title: string; priority?: string; dueDate?: string; tags?: string[]; subtasks?: string[] }>("task_extractor", { text: note }, userId);
    if (res.status !== "ok" || !res.output) throw new Error(res.message || "task extractor failed");
    const out = res.output;
    const { data, error } = await supabase
      .from("ops_tasks")
      .insert({
        user_id: userId,
        title: out.title || note.slice(0, 64),
        priority: out.priority || "medium",
        due_date: out.dueDate || null,
        tags: out.tags || [],
        subtasks: out.subtasks || [],
        status: "todo",
      })
      .select("id")
      .single();
    await logOpsAgentic(userId, "ops.task_extractor", "success", { payloadSize: note.length });
    if (error) throw error;
    return data?.id as string | undefined;
  }, [userId]);

  const generateSOPSteps = useCallback(async (title: string, draft: string) => {
    if (!userId) throw new Error("No user");
    const res = await runSkillUnified<{ steps: any; issues?: string[] }>("sop_parser", { title, draft }, userId);
    if (res.status !== "ok" || !res.output) throw new Error(res.message || "sop parser failed");
    const { steps } = res.output;
    const { data, error } = await supabase
      .from("ops_sops")
      .insert({ user_id: userId, title, steps, version: "1.0" })
      .select("id")
      .single();
    await logOpsAgentic(userId, "ops.sop_parser", "success", { payloadSize: draft.length });
    if (error) throw error;
    return data?.id as string | undefined;
  }, [userId]);

  const runWorkflow = useCallback(async (name: string, payload?: any) => {
    if (!userId) throw new Error("No user");
    await logOpsAgentic(userId, "ops.workflow.start", "success", { note: name });
    const res = await runSkillUnified<{ runId: string }>("workflow_runner", { name, payload }, userId);
    if (res.status !== "ok") throw new Error(res.message || "workflow failed");
    await supabase
      .from("ops_workflows")
      .update({ last_run: new Date().toISOString() })
      .eq("user_id", userId)
      .ilike("name", name);
    await logOpsAgentic(userId, "ops.workflow.complete", "success", { note: name });
    return res.output?.runId;
  }, [userId]);

  const scheduleWorkflowCron = useCallback(async (name: string, cron: string) => {
    if (!userId) throw new Error("No user");
    const res = await runSkillUnified("scheduler", { name, cron }, userId);
    if (res.status !== "ok") throw new Error(res.message || "schedule failed");
    await logOpsAgentic(userId, "ops.scheduler", "success", { note: `${name}@${cron}` });
    return true;
  }, [userId]);

  const getOpsInsights = useCallback(async () => {
    if (!userId) throw new Error("No user");
    const res = await runSkillUnified<{ insights: string[] }>("metrics_aggregator", { lookbackDays: 7 }, userId);
    if (res.status !== "ok") throw new Error(res.message || "insights failed");
    await logOpsAgentic(userId, "ops.metrics_aggregator", "success");
    return res.output?.insights || [];
  }, [userId]);

  return { quickAddTaskFromNote, generateSOPSteps, runWorkflow, scheduleWorkflowCron, getOpsInsights };
}
