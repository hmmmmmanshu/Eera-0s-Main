import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, GitBranch } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function OpsAnalytics() {
  const metrics = [
    {
      label: "Task Completion Rate",
      value: "87%",
      progress: 87,
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      label: "AI vs Human Actions",
      value: "60/40",
      progress: 60,
      icon: BarChart3,
      color: "text-accent"
    },
    {
      label: "Active Experiments",
      value: "4",
      progress: 40,
      icon: GitBranch,
      color: "text-yellow-500"
    },
    {
      label: "Avg. Workflow Cycle Time",
      value: "2.3 days",
      progress: 75,
      icon: Clock,
      color: "text-blue-500"
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-accent" />
        Analytics & Progress
      </h3>

      <div className="grid md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="border-accent/20 hover:border-accent/40 transition-all">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <span className="text-2xl font-bold">{metric.value}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <Progress value={metric.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
