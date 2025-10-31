import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState("");

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
      const { error } = await supabase.from("ops_tasks").insert({
        user_id: user.id,
        title: newTask.trim(),
        status: "todo",
        priority: "medium",
      });
      if (error) throw error;
      toast.success("Task added");
      setNewTask("");
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
      loadTodos();
    } catch (e: any) {
      toast.error("Failed to update task");
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
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTodo(todo.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}