import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncOpsTaskToDashboard } from "@/lib/syncOpsTasks";

export function KanbanBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeColumn, setActiveColumn] = useState<"todo" | "progress" | "done">("todo");
  const [syncToDashboard, setSyncToDashboard] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [user?.id]);

  const loadTasks = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ops_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (e: any) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !user?.id) return;
    try {
      // Map UI columns to database status values
      const statusMap: Record<string, string> = {
        todo: "todo",
        progress: "in_progress",
        done: "done",
      };
      const { data, error } = await supabase
        .from("ops_tasks")
        .insert({
          user_id: user.id,
          title: newTaskTitle.trim(),
          status: statusMap[activeColumn] || "todo",
          priority: "medium",
          sync_to_dashboard: syncToDashboard,
        })
        .select()
        .single();
      if (error) throw error;
      
      // Sync to dashboard if enabled
      if (syncToDashboard && data) {
        try {
          await syncOpsTaskToDashboard(data.id, user.id);
        } catch (syncError: any) {
          console.error("Failed to sync task to dashboard:", syncError);
          toast.warning("Task added but failed to sync to dashboard");
        }
      }
      
      toast.success("Task added");
      setNewTaskTitle("");
      setSyncToDashboard(false);
      setShowAddForm(false);
      loadTasks();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add task");
    }
  };

  const moveTask = async (taskId: string, newStatus: "todo" | "progress" | "done") => {
    if (!user?.id) return;
    try {
      // Map UI status to database status
      const statusMap: Record<string, string> = {
        todo: "todo",
        progress: "in_progress",
        done: "done",
      };
      const { error } = await supabase
        .from("ops_tasks")
        .update({ status: statusMap[newStatus] || "todo" })
        .eq("id", taskId)
        .eq("user_id", user.id);
      if (error) throw error;
      
      // Sync to dashboard if enabled
      const task = tasks.find(t => t.id === taskId);
      if (task?.sync_to_dashboard) {
        try {
          await syncOpsTaskToDashboard(taskId, user.id);
        } catch (syncError: any) {
          console.error("Failed to sync task update to dashboard:", syncError);
        }
      }
      
      loadTasks();
    } catch (e: any) {
      toast.error("Failed to move task");
    }
  };
  
  const toggleSyncToDashboard = async (taskId: string, currentSyncState: boolean) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("ops_tasks")
        .update({ sync_to_dashboard: !currentSyncState })
        .eq("id", taskId)
        .eq("user_id", user.id);
      if (error) throw error;
      
      // Sync to dashboard or remove based on new state
      if (!currentSyncState) {
        // Enable sync - add to dashboard
        try {
          await syncOpsTaskToDashboard(taskId, user.id);
          toast.success("Task synced to dashboard");
        } catch (syncError: any) {
          toast.error("Failed to sync task to dashboard");
        }
      } else {
        // Disable sync - this will remove from dashboard via sync function
        try {
          await syncOpsTaskToDashboard(taskId, user.id);
          toast.success("Task removed from dashboard");
        } catch (syncError: any) {
          console.error("Failed to remove task from dashboard:", syncError);
        }
      }
      
      loadTasks();
    } catch (e: any) {
      toast.error("Failed to update sync setting");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("ops_tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Task deleted");
      loadTasks();
    } catch (e: any) {
      toast.error("Failed to delete task");
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "destructive";
    if (priority === "medium") return "default";
    return "secondary";
  };

  const columns = [
    { id: "todo" as const, title: "To Do", status: "todo" as const },
    { id: "progress" as const, title: "In Progress", status: "progress" as const },
    { id: "done" as const, title: "Done", status: "done" as const },
  ];

  const getTasksForColumn = (columnStatus: string) => {
    // Map column IDs to database status values
    const statusMap: Record<string, string[]> = {
      todo: ["todo"],
      progress: ["in_progress"],
      done: ["done"],
    };
    const dbStatuses = statusMap[columnStatus] || [];
    return tasks.filter((t) => dbStatuses.includes(t.status));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <Card key={column.id} className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{column.title}</span>
              <Badge variant="secondary">{getTasksForColumn(column.status).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[400px]">
            {loading ? (
              <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
            ) : getTasksForColumn(column.status).length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No tasks</div>
            ) : (
              getTasksForColumn(column.status).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium flex-1">{task.title}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteTask(task.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={getPriorityColor(task.priority || "medium")} className="text-xs">
                      {task.priority || "medium"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title={task.sync_to_dashboard ? "Synced to dashboard" : "Sync to dashboard"}
                        onClick={() => toggleSyncToDashboard(task.id, task.sync_to_dashboard || false)}
                      >
                        <LayoutDashboard className={`h-3 w-3 ${task.sync_to_dashboard ? "text-accent" : "text-muted-foreground"}`} />
                      </Button>
                      {column.id !== "done" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const nextStatus =
                              column.id === "todo"
                                ? "progress"
                                : column.id === "progress"
                                ? "done"
                                : "done";
                            moveTask(task.id, nextStatus);
                          }}
                        >
                          Move →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {showAddForm && activeColumn === column.id ? (
              <div className="p-3 rounded-lg border border-accent/40 space-y-2">
                <Input
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask();
                    if (e.key === "Escape") {
                      setShowAddForm(false);
                      setNewTaskTitle("");
                      setSyncToDashboard(false);
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`sync-${column.id}`}
                    checked={syncToDashboard}
                    onCheckedChange={(checked) => setSyncToDashboard(checked === true)}
                  />
                  <label
                    htmlFor={`sync-${column.id}`}
                    className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
                  >
                    <LayoutDashboard className="h-3 w-3" />
                    Sync to Dashboard
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addTask} disabled={!newTaskTitle.trim()}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTaskTitle("");
                      setSyncToDashboard(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  setActiveColumn(column.id);
                  setShowAddForm(true);
                }}
                disabled={!user}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}