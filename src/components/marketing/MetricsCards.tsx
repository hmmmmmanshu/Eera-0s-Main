import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, TrendingUp, FileText, Calendar } from "lucide-react";
import { useMarketingStats, type Platform } from "@/hooks/useMarketingData";

interface MetricsCardsProps {
  platform?: Platform;
}

export const MetricsCards = ({ platform }: MetricsCardsProps) => {
  const { metrics, totalViews, totalPosts, scheduledPosts, publishedPosts } = useMarketingStats(platform);

  // Calculate posts this week
  const thisWeekPosts = publishedPosts; // Can be refined with date filtering

  const metricsData = [
  {
    title: "Impressions",
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toLocaleString(),
      change: `${metrics.reach.change >= 0 ? "+" : ""}${metrics.reach.change.toFixed(1)}%`,
    icon: Eye,
      trend: metrics.reach.trend,
  },
  {
    title: "Reach",
      value: metrics.reach.value >= 1000 
        ? `${(metrics.reach.value / 1000).toFixed(1)}K` 
        : metrics.reach.value.toLocaleString(),
      change: `${metrics.reach.change >= 0 ? "+" : ""}${metrics.reach.change.toFixed(1)}%`,
    icon: Users,
      trend: metrics.reach.trend,
  },
  {
    title: "Engagement Rate",
      value: `${(metrics.engagement.value / 100).toFixed(1)}%`,
      change: `${metrics.engagement.change >= 0 ? "+" : ""}${metrics.engagement.change.toFixed(1)}%`,
    icon: TrendingUp,
      trend: metrics.engagement.trend,
  },
  {
    title: "Posts This Week",
      value: thisWeekPosts.toString(),
      change: `${totalPosts} total`,
    icon: FileText,
    trend: "neutral" as const,
  },
  {
    title: "Scheduled",
      value: scheduledPosts.toString(),
    change: "Next 7 days",
    icon: Calendar,
    trend: "neutral" as const,
  },
];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {metricsData.map((metric) => {
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
                    : metric.trend === "down"
                    ? "text-red-600"
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
