import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OptimizationInsights() {
  const insights = [
    {
      id: 1,
      title: "Experiment #4 Success",
      description: "Async standups improved engagement by +12%. Consider replicating weekly.",
      impact: "high",
      action: "Replicate Process"
    },
    {
      id: 2,
      title: "Workflow Bottleneck Detected",
      description: "Marketing approval step takes 3 days on average. Consider automation.",
      impact: "medium",
      action: "Review Workflow"
    },
    {
      id: 3,
      title: "SOP Update Needed",
      description: "Financial close process hasn't been updated in 6 months. Review recommended.",
      impact: "low",
      action: "Schedule Review"
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-green-500 border-green-500/20 bg-green-500/10";
      case "medium":
        return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "low":
        return "text-muted-foreground border-accent/20 bg-accent/5";
      default:
        return "text-muted-foreground border-accent/20 bg-accent/5";
    }
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-accent" />
          Optimization Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getImpactColor(insight.impact)} transition-all`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <Target className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs opacity-80">{insight.description}</p>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                {insight.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
