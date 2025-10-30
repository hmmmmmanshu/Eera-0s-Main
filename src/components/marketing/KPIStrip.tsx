import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Heart, Award } from "lucide-react";
import { useMarketingStats, type Platform } from "@/hooks/useMarketingData";

interface KPIStripProps {
  platform?: Platform;
}

export const KPIStrip = ({ platform }: KPIStripProps) => {
  const { metrics, totalViews, totalLikes, publishedPosts } = useMarketingStats(platform);

  // Calculate engagement rate
  const engagementRate = totalViews > 0 
    ? ((totalLikes / totalViews) * 100).toFixed(1)
    : "0.0";

  // Determine top platform by reach
  const topPlatform = platform || "All";

  const kpis = [
    {
      label: "Reach",
      value: metrics.reach.value >= 1000 
        ? `${(metrics.reach.value / 1000).toFixed(1)}K` 
        : metrics.reach.value.toString(),
      change: `${metrics.reach.change >= 0 ? "+" : ""}${metrics.reach.change.toFixed(1)}%`,
      trend: metrics.reach.trend,
      icon: TrendingUp,
    },
    {
      label: "Engagement Rate",
      value: `${engagementRate}%`,
      change: `${metrics.engagement.change >= 0 ? "+" : ""}${metrics.engagement.change.toFixed(1)}%`,
      trend: metrics.engagement.trend,
      icon: Heart,
    },
    {
      label: "Total Posts",
      value: publishedPosts.toString(),
      change: `${publishedPosts} published`,
      trend: "neutral" as const,
      icon: Users,
    },
    {
      label: "Top Platform",
      value: topPlatform,
      change: `${metrics.reach.value} reach`,
      trend: "neutral" as const,
      icon: Award,
    },
  ];

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
