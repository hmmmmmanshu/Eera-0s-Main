import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Generate mock heatmap data for the last 30 days
const generateHeatmapData = () => {
  const days = 30;
  const platforms = ["LinkedIn", "Instagram"];
  const data: { [key: string]: { [key: string]: number } } = {};
  
  platforms.forEach(platform => {
    data[platform] = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];
      data[platform][dateStr] = Math.floor(Math.random() * 100);
    }
  });
  
  return data;
};

const getIntensityColor = (value: number) => {
  if (value === 0) return "bg-muted";
  if (value < 25) return "bg-accent/30";
  if (value < 50) return "bg-accent/50";
  if (value < 75) return "bg-accent/70";
  return "bg-accent";
};

export const ActivityHeatmap = () => {
  const [metric, setMetric] = useState<"impressions" | "engagement" | "posts">("impressions");
  const heatmapData = generateHeatmapData();
  const platforms = Object.keys(heatmapData);
  const dates = Object.keys(heatmapData[platforms[0]]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Heatmap</CardTitle>
          <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
            <TabsList>
              <TabsTrigger value="impressions">Impressions</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{platform}</p>
              <div className="flex gap-1 overflow-x-auto pb-2">
                <TooltipProvider>
                  {dates.map((date) => {
                    const value = heatmapData[platform][date];
                    return (
                      <Tooltip key={date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-6 h-6 rounded cursor-pointer transition-all hover:ring-2 hover:ring-accent ${getIntensityColor(value)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{platform}</p>
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
              {[0, 25, 50, 75, 100].map((val) => (
                <div
                  key={val}
                  className={`w-4 h-4 rounded ${getIntensityColor(val)}`}
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
