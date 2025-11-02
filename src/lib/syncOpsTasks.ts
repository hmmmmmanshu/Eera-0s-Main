import { supabase } from "@/integrations/supabase/client";

/**
 * Syncs an ops_task to the dashboard tasks table
 * Maps ops_tasks fields to tasks table fields
 */
export async function syncOpsTaskToDashboard(opsTaskId: string, userId: string) {
  try {
    // Get the ops task
    const { data: opsTask, error: fetchError } = await supabase
      .from("ops_tasks")
      .select("*")
      .eq("id", opsTaskId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !opsTask) {
      throw new Error("Ops task not found");
    }

    // Check if sync is enabled
    if (!opsTask.sync_to_dashboard) {
      // If sync is disabled, remove the task from dashboard if it exists
      await supabase
        .from("tasks")
        .delete()
        .eq("ops_task_id", opsTaskId);
      return { success: true, action: "removed" };
    }

    // Map ops_tasks to tasks format
    // tasks table requires due_date, so use a default if not set
    const defaultDueDate = opsTask.due_date 
      ? new Date(opsTask.due_date).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default to 7 days from now

    // Map status to completed: done = true, others = false
    const completed = opsTask.status === "done";

    // Check if task already exists in dashboard
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("id")
      .eq("ops_task_id", opsTaskId)
      .single();

    const taskData = {
      user_id: userId,
      title: opsTask.title,
      description: opsTask.description || null,
      due_date: defaultDueDate,
      completed: completed,
      priority: (opsTask.priority || "medium") as "low" | "medium" | "high",
      category: "ops" as const,
      ops_task_id: opsTaskId,
    };

    if (existingTask) {
      // Update existing task
      const { error: updateError } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", existingTask.id);

      if (updateError) throw updateError;
      return { success: true, action: "updated", taskId: existingTask.id };
    } else {
      // Insert new task
      const { data: newTask, error: insertError } = await supabase
        .from("tasks")
        .insert(taskData)
        .select("id")
        .single();

      if (insertError) throw insertError;
      return { success: true, action: "created", taskId: newTask.id };
    }
  } catch (error: any) {
    console.error("Error syncing ops task to dashboard:", error);
    throw error;
  }
}

/**
 * Syncs all ops tasks for a user that have sync_to_dashboard enabled
 */
export async function syncAllOpsTasksToDashboard(userId: string) {
  try {
    const { data: opsTasks, error } = await supabase
      .from("ops_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("sync_to_dashboard", true);

    if (error) throw error;

    const results = [];
    for (const opsTask of opsTasks || []) {
      try {
        const result = await syncOpsTaskToDashboard(opsTask.id, userId);
        results.push({ opsTaskId: opsTask.id, ...result });
      } catch (err: any) {
        results.push({ opsTaskId: opsTask.id, success: false, error: err.message });
      }
    }

    return { success: true, results };
  } catch (error: any) {
    console.error("Error syncing all ops tasks:", error);
    throw error;
  }
}

