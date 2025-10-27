import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Beaker, TrendingUp, TrendingDown, Plus } from "lucide-react";

export function ExperimentTracker() {
  const experiments = [
    {
      id: 1,
      hypothesis: "Switching to async standups increases productivity",
      status: "running",
      impact: "+12%",
      trend: "up",
      duration: "2 weeks"
    },
    {
      id: 2,
      hypothesis: "Weekly blog posts improve SEO rankings",
      status: "completed",
      impact: "+8%",
      trend: "up",
      duration: "4 weeks"
    },
    {
      id: 3,
      hypothesis: "Quarterly planning reduces sprint velocity",
      status: "completed",
      impact: "-5%",
      trend: "down",
      duration: "6 weeks"
    },
    {
      id: 4,
      hypothesis: "AI-generated social posts increase engagement",
      status: "planning",
      impact: "TBD",
      trend: "neutral",
      duration: "Not started"
    },
  ];

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Experiment Tracker
          </span>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Experiment
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="p-4 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{exp.hypothesis}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Duration: {exp.duration}
                </p>
              </div>
              <Badge 
                variant={exp.status === "running" ? "default" : exp.status === "completed" ? "secondary" : "outline"}
                className="shrink-0"
              >
                {exp.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Impact:</span>
                <span className={`font-semibold text-sm flex items-center gap-1 ${
                  exp.trend === "up" ? "text-green-500" : 
                  exp.trend === "down" ? "text-red-500" : 
                  "text-muted-foreground"
                }`}>
                  {exp.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {exp.trend === "down" && <TrendingDown className="h-3 w-3" />}
                  {exp.impact}
                </span>
              </div>
              <Button size="sm" variant="ghost">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
