import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivityHeatmap } from "@/hooks/useMarketingData";

const getIntensityColor = (value: number, maxValue: number) => {
  if (value === 0) return "bg-muted";
  const percentage = (value / maxValue) * 100;
  if (percentage < 25) return "bg-accent/30";
  if (percentage < 50) return "bg-accent/50";
  if (percentage < 75) return "bg-accent/70";
  return "bg-accent";
};

export const ActivityHeatmap = () => {
  const [metric, setMetric] = useState<"posts">("posts");
  
  // Calculate date range for last 30 days
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);

  const { data: activityData = [], isLoading } = useActivityHeatmap(startDate, endDate);

  // Group data by platform and date
  const heatmapData = useMemo(() => {
    const grouped: { [platform: string]: { [date: string]: number } } = {};
    
    activityData.forEach((activity) => {
      if (!grouped[activity.platform]) {
        grouped[activity.platform] = {};
      }
      grouped[activity.platform][activity.date] = activity.count;
    });

    return grouped;
  }, [activityData]);

  const platforms = Object.keys(heatmapData);
  
  // Generate all dates in range
  const dates = useMemo(() => {
    const allDates: string[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      allDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return allDates;
  }, [startDate, endDate]);

  // Find max value for color intensity
  const maxValue = useMemo(() => {
    let max = 0;
    Object.values(heatmapData).forEach((platformData) => {
      Object.values(platformData).forEach((count) => {
        if (count > max) max = count;
      });
    });
    return max || 1; // Prevent division by zero
  }, [heatmapData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading activity data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (platforms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No activity data yet. Start publishing posts to see your activity heatmap!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Heatmap</CardTitle>
          <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground capitalize">{platform}</p>
              <div className="flex gap-1 overflow-x-auto pb-2">
                <TooltipProvider>
                  {dates.map((date) => {
                    const value = heatmapData[platform]?.[date] || 0;
                    return (
                      <Tooltip key={date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-6 h-6 rounded cursor-pointer transition-all hover:ring-2 hover:ring-accent ${getIntensityColor(value, maxValue)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium capitalize">{platform}</p>
                            <p className="text-xs">{new Date(date).toLocaleDateString()}</p>
                            <p className="text-xs">{value} {metric}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>
          ))}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded ${getIntensityColor(Math.floor(maxValue * ratio), maxValue)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
