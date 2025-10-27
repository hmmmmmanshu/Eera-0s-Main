import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export function KanbanBoard() {
  const columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: [
        { id: 1, title: "Update Q1 investor deck", priority: "high", aiSuggested: true },
        { id: 2, title: "Review marketing budget", priority: "medium", aiSuggested: false },
        { id: 3, title: "Schedule team standup", priority: "low", aiSuggested: false },
      ]
    },
    {
      id: "progress",
      title: "In Progress",
      tasks: [
        { id: 4, title: "Finalize product roadmap", priority: "high", aiSuggested: false },
        { id: 5, title: "Conduct user interviews", priority: "medium", aiSuggested: true },
      ]
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        { id: 6, title: "Deploy v2.1 to production", priority: "high", aiSuggested: false },
        { id: 7, title: "Monthly financial report", priority: "medium", aiSuggested: true },
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "destructive";
    if (priority === "medium") return "default";
    return "secondary";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <Card key={column.id} className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{column.title}</span>
              <Badge variant="secondary">{column.tasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all cursor-move space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1">{task.title}</p>
                  {task.aiSuggested && (
                    <Sparkles className="h-4 w-4 text-accent shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
