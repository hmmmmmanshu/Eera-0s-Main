import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AgenticFeed() {
  const activities = [
    {
      id: 1,
      agent: "Ops AI",
      action: "Created new SOP: Marketing Launch Workflow",
      timestamp: "2 min ago",
      type: "success"
    },
    {
      id: 2,
      agent: "Strategy AI",
      action: "Suggested optimization for Q1 planning process",
      timestamp: "15 min ago",
      type: "insight"
    },
    {
      id: 3,
      agent: "Workflow AI",
      action: "Automated weekly report generation",
      timestamp: "1 hour ago",
      type: "success"
    },
    {
      id: 4,
      agent: "Compliance AI",
      action: "Alert: Tax filing deadline in 5 days",
      timestamp: "2 hours ago",
      type: "warning"
    },
    {
      id: 5,
      agent: "Ops AI",
      action: "Completed experiment data analysis for Exp #4",
      timestamp: "3 hours ago",
      type: "success"
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "insight":
        return <Sparkles className="h-4 w-4 text-accent" />;
      default:
        return <Bot className="h-4 w-4 text-accent" />;
    }
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-accent" />
          Agentic Feed
          <span className="relative flex h-2 w-2 ml-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {activity.agent}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm">{activity.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
