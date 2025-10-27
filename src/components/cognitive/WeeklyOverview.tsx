import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Award, Activity } from "lucide-react";

export function WeeklyOverview() {
  const metrics = [
    { label: "Goals Achieved", value: 82, icon: Target, color: "text-green-500" },
    { label: "Mood Trend", value: 74, trend: "+6.2%", icon: Activity, color: "text-purple-500" },
    { label: "Productivity", value: 88, icon: TrendingUp, color: "text-blue-500" },
    { label: "Focus Areas", value: 3, icon: Award, color: "text-amber-500" },
  ];

  const highlights = [
    "✨ Engagement increased 20% - great work on content strategy",
    "🎯 Completed 8/10 planned tasks this week",
    "💡 Generated 5 actionable ideas from reflection",
    "⚠️ Runway forecasting needs attention",
  ];

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Weekly Overview
          </CardTitle>
          <Badge variant="outline">Oct 14-20, 2025</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-2xl font-bold">{metric.value}{typeof metric.value === 'number' && metric.value < 10 ? '' : '%'}</span>
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              {metric.trend && (
                <Badge variant="outline" className="text-xs">
                  {metric.trend}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Key Highlights</p>
          <div className="space-y-2">
            {highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                <p className="text-muted-foreground">{highlight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Week Focus */}
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Suggested Focus Areas</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Team clarity & 1-on-1s</span>
              <Badge variant="secondary" className="text-xs">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Runway forecasting</span>
              <Badge variant="secondary" className="text-xs">Critical</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
