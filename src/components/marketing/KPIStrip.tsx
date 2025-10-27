import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Heart, Award } from "lucide-react";

const kpis = [
  {
    label: "Impressions",
    value: "12.4K",
    change: "+23%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    label: "Engagement Rate",
    value: "4.2%",
    change: "+0.8%",
    trend: "up" as const,
    icon: Heart,
  },
  {
    label: "New Followers",
    value: "+156",
    change: "+12%",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "Top Platform",
    value: "LinkedIn",
    change: "2.1K reach",
    trend: "neutral" as const,
    icon: Award,
  },
];

export const KPIStrip = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              {kpi.trend !== "neutral" && (
                <span className={`text-xs font-medium ${
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              {kpi.trend === "neutral" && (
                <p className="text-xs text-muted-foreground">{kpi.change}</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
