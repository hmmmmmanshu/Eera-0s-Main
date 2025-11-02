import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncOpsTaskToDashboard } from "@/lib/syncOpsTasks";

export function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [syncToDashboard, setSyncToDashboard] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTodos();
    }
  }, [user?.id]);

  const loadTodos = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ops_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setTodos(data || []);
    } catch (e: any) {
      toast.error("Failed to load todos");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTask.trim() || !user?.id) {
      toast.error("Enter a task");
      return;
    }
    try {
      const { data, error } = await supabase.from("ops_tasks").insert({
        user_id: user.id,
        title: newTask.trim(),
        status: "todo",
        priority: "medium",
        sync_to_dashboard: syncToDashboard,
      }).select().single();
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
      setNewTask("");
      setSyncToDashboard(false);
      loadTodos();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add task");
    }
  };

  const toggleTodo = async (id: string, currentStatus: string) => {
    if (!user?.id) return;
    try {
      const newStatus = currentStatus === "done" ? "todo" : "done";
      const { error } = await supabase
        .from("ops_tasks")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      
      // Sync to dashboard if enabled
      const todo = todos.find(t => t.id === id);
      if (todo?.sync_to_dashboard) {
        try {
          await syncOpsTaskToDashboard(id, user.id);
        } catch (syncError: any) {
          console.error("Failed to sync task update to dashboard:", syncError);
        }
      }
      
      loadTodos();
    } catch (e: any) {
      toast.error("Failed to update task");
    }
  };
  
  const toggleSyncToDashboard = async (todoId: string, currentSyncState: boolean) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("ops_tasks")
        .update({ sync_to_dashboard: !currentSyncState })
        .eq("id", todoId)
        .eq("user_id", user.id);
      if (error) throw error;
      
      // Sync to dashboard or remove based on new state
      if (!currentSyncState) {
        // Enable sync - add to dashboard
        try {
          await syncOpsTaskToDashboard(todoId, user.id);
          toast.success("Task synced to dashboard");
        } catch (syncError: any) {
          toast.error("Failed to sync task to dashboard");
        }
      } else {
        // Disable sync - this will remove from dashboard via sync function
        try {
          await syncOpsTaskToDashboard(todoId, user.id);
          toast.success("Task removed from dashboard");
        } catch (syncError: any) {
          console.error("Failed to remove task from dashboard:", syncError);
        }
      }
      
      loadTodos();
    } catch (e: any) {
      toast.error("Failed to update sync setting");
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from("ops_tasks").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Task deleted");
      loadTodos();
    } catch (e: any) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="text-lg">To-Do List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            className="flex-1"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
            disabled={!user}
          />
          <Button size="icon" onClick={addTodo} disabled={!user || !newTask.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="sync-todo"
            checked={syncToDashboard}
            onCheckedChange={(checked) => setSyncToDashboard(checked === true)}
          />
          <label
            htmlFor="sync-todo"
            className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
          >
            <LayoutDashboard className="h-3 w-3" />
            Sync new tasks to Dashboard
          </label>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
          ) : todos.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No tasks yet</div>
          ) : (
            todos.map((todo) => {
              const isCompleted = todo.status === "done";
              return (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all ${
                    isCompleted ? "opacity-60" : ""
                  }`}
                >
                  <Checkbox checked={isCompleted} onCheckedChange={() => toggleTodo(todo.id, todo.status)} />
                  <div className="flex-1">
                    <p className={`text-sm ${isCompleted ? "line-through" : ""}`}>{todo.title}</p>
                    {todo.due_date && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(todo.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title={todo.sync_to_dashboard ? "Synced to dashboard" : "Sync to dashboard"}
                      onClick={() => toggleSyncToDashboard(todo.id, todo.sync_to_dashboard || false)}
                    >
                      <LayoutDashboard className={`h-3 w-3 ${todo.sync_to_dashboard ? "text-accent" : "text-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTodo(todo.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}