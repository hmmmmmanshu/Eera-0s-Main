import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertCircle, Lightbulb, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function VirtualCFOInsights() {
  const insights = [
    {
      type: "optimization",
      icon: Target,
      title: "Cost Optimization Opportunity",
      description: "You could save $3.2K/month by switching to annual plans for 3 software subscriptions (Slack, Notion, Figma)",
      priority: "high",
      action: "Review Subscriptions"
    },
    {
      type: "runway",
      icon: TrendingUp,
      title: "Runway Extension Strategy",
      description: "Closing the Series A deal would extend runway by 27 months. Consider accelerating negotiations.",
      priority: "high",
      action: "View Details"
    },
    {
      type: "warning",
      icon: AlertCircle,
      title: "Invoice Collection Alert",
      description: "3 invoices totaling $52K are past due. Follow-up could improve cash position by 6.4%",
      priority: "medium",
      action: "Send Reminders"
    },
    {
      type: "opportunity",
      icon: Lightbulb,
      title: "Tax Optimization",
      description: "R&D tax credits could yield $18-25K in savings this quarter. Consider filing.",
      priority: "medium",
      action: "Learn More"
    }
  ];

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "destructive";
    if (priority === "medium") return "default";
    return "secondary";
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            Virtual CFO Insights
          </span>
          <Badge variant="secondary" className="gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all hover:scale-[1.02] space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <insight.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                {insight.action}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Weekly Financial Health Score</h4>
              <p className="text-sm text-muted-foreground">Based on 12 key financial metrics</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-accent">87</div>
              <p className="text-xs text-muted-foreground">Excellent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
