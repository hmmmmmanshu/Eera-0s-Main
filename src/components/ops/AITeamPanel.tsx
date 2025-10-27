import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Brain, Zap, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AITeamPanel() {
  const agents = [
    {
      id: 1,
      name: "Ops AI",
      role: "Executes automations",
      icon: Zap,
      status: "active",
      lastAction: "Created workflow template",
      timestamp: "2 min ago"
    },
    {
      id: 2,
      name: "Strategy AI",
      role: "Designs experiments",
      icon: Brain,
      status: "active",
      lastAction: "Analyzed Q1 metrics",
      timestamp: "15 min ago"
    },
    {
      id: 3,
      name: "Workflow AI",
      role: "Suggests process templates",
      icon: Bot,
      status: "idle",
      lastAction: "Optimized approval chain",
      timestamp: "1 hour ago"
    },
    {
      id: 4,
      name: "Compliance AI",
      role: "Tracks deadlines",
      icon: Shield,
      status: "active",
      lastAction: "Sent tax reminder",
      timestamp: "2 hours ago"
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500" : "bg-muted";
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-accent" />
          AI Team Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                  <agent.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{agent.name}</h4>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{agent.role}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Last: {agent.lastAction}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {agent.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
