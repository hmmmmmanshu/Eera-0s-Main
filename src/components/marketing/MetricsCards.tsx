import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, TrendingUp, FileText, Calendar } from "lucide-react";

const metrics = [
  {
    title: "Impressions",
    value: "12,453",
    change: "+23.1%",
    icon: Eye,
    trend: "up" as const,
  },
  {
    title: "Reach",
    value: "8,234",
    change: "+18.2%",
    icon: Users,
    trend: "up" as const,
  },
  {
    title: "Engagement Rate",
    value: "4.2%",
    change: "+0.8%",
    icon: TrendingUp,
    trend: "up" as const,
  },
  {
    title: "Posts This Week",
    value: "7",
    change: "Target: 5",
    icon: FileText,
    trend: "neutral" as const,
  },
  {
    title: "Scheduled",
    value: "12",
    change: "Next 7 days",
    icon: Calendar,
    trend: "neutral" as const,
  },
];

export const MetricsCards = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className={`text-xs ${
                  metric.trend === "up" 
                    ? "text-green-600" 
                    : "text-muted-foreground"
                }`}>
                  {metric.change}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
