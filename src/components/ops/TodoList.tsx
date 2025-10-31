import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOpsSkills } from "@/hooks/useOpsSkills";
import { toast } from "sonner";

export function TodoList() {
  const todos = [
    { id: 1, text: "Send investor update email", completed: false, dueDate: "Today" },
    { id: 2, text: "Review legal contracts", completed: false, dueDate: "Tomorrow" },
    { id: 3, text: "Update team wiki", completed: true, dueDate: "Yesterday" },
    { id: 4, text: "Schedule marketing campaign review", completed: false, dueDate: "This Week" },
    { id: 5, text: "Approve expense reports", completed: true, dueDate: "Yesterday" },
  ];

  const { user } = useAuth();
  const { quickAddTaskFromNote } = useOpsSkills(user?.id);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="text-lg">Quick To-Do List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Add a task... (natural language supported)" 
            className="flex-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button size="icon" disabled={busy} onClick={async () => {
            if (!note.trim()) { toast.error("Write a note first"); return; }
            try {
              setBusy(true);
              const id = await quickAddTaskFromNote(note.trim());
              toast.success("Task created");
              setNote("");
            } catch (e: any) {
              toast.error(e?.message || "Failed to create task");
            } finally { setBusy(false); }
          }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all ${
                todo.completed ? "opacity-60" : ""
              }`}
            >
              <Checkbox checked={todo.completed} />
              <div className="flex-1">
                <p className={`text-sm ${todo.completed ? "line-through" : ""}`}>
                  {todo.text}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{todo.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
