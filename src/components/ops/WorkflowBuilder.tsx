import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus, Play } from "lucide-react";

export function WorkflowBuilder() {
  const workflows = [
    {
      id: 1,
      name: "Weekly Investor Update",
      steps: 4,
      status: "active",
      lastRun: "3 days ago"
    },
    {
      id: 2,
      name: "New Marketing Campaign",
      steps: 6,
      status: "draft",
      lastRun: "Never"
    },
    {
      id: 3,
      name: "Product Launch Process",
      steps: 8,
      status: "active",
      lastRun: "1 week ago"
    },
  ];

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Workflow Builder
          </span>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="p-4 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium">{workflow.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {workflow.steps} steps • Last run: {workflow.lastRun}
                </p>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Play className="h-3 w-3" />
                Run
              </Button>
            </div>

            {/* Visual workflow representation */}
            <div className="flex items-center gap-2">
              {Array.from({ length: workflow.steps }).map((_, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  {idx < workflow.steps - 1 && (
                    <div className="w-4 h-0.5 bg-accent/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
