import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMarketingTargets, useCreateTarget, useUpdateTarget } from "@/hooks/useMarketingData";
import { Settings, Target, TrendingUp, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface TargetConfig {
  name: string;
  key: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}

const TARGET_CONFIGS: TargetConfig[] = [
  {
    name: "Number of Posts",
    key: "posts",
    icon: <Target className="w-4 h-4" />,
    min: 1,
    max: 100,
    step: 1,
    format: (v) => `${v} posts`,
  },
  {
    name: "Impressions",
    key: "impressions",
    icon: <TrendingUp className="w-4 h-4" />,
    min: 100,
    max: 1000000,
    step: 1000,
    format: (v) => `${(v / 1000).toFixed(0)}K`,
  },
  {
    name: "Reach",
    key: "reach",
    icon: <TrendingUp className="w-4 h-4" />,
    min: 100,
    max: 500000,
    step: 1000,
    format: (v) => `${(v / 1000).toFixed(0)}K`,
  },
  {
    name: "Likes",
    key: "likes",
    icon: <Target className="w-4 h-4" />,
    min: 10,
    max: 100000,
    step: 100,
    format: (v) => `${(v / 1000).toFixed(1)}K`,
  },
  {
    name: "Comments",
    key: "comments",
    icon: <Target className="w-4 h-4" />,
    min: 5,
    max: 10000,
    step: 50,
    format: (v) => `${v}`,
  },
  {
    name: "Shares",
    key: "shares",
    icon: <Target className="w-4 h-4" />,
    min: 5,
    max: 10000,
    step: 50,
    format: (v) => `${v}`,
  },
  {
    name: "Engagement",
    key: "engagement",
    icon: <TrendingUp className="w-4 h-4" />,
    min: 100,
    max: 50000,
    step: 100,
    format: (v) => `${(v / 1000).toFixed(1)}K`,
  },
  {
    name: "Clicks",
    key: "clicks",
    icon: <Target className="w-4 h-4" />,
    min: 10,
    max: 50000,
    step: 100,
    format: (v) => `${(v / 1000).toFixed(1)}K`,
  },
];

function getDeadlineForPeriod(period: "weekly" | "monthly"): string {
  const now = new Date();
  if (period === "weekly") {
    // Get next Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 59, 999);
    return nextSunday.toISOString().split("T")[0];
  } else {
    // Get last day of current month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return lastDay.toISOString().split("T")[0];
  }
}

export const TargetsProgress = () => {
  const { data: targets = [], isLoading } = useMarketingTargets();
  const createTargetMutation = useCreateTarget();
  const updateTargetMutation = useUpdateTarget();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [weeklyValues, setWeeklyValues] = useState<Record<string, number>>({});
  const [monthlyValues, setMonthlyValues] = useState<Record<string, number>>({});

  // Initialize target values from existing targets
  useEffect(() => {
    const weekly: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    
    targets.forEach((target) => {
      const targetNameLower = target.name.toLowerCase();
      const key = TARGET_CONFIGS.find((config) => 
        targetNameLower.includes(config.key.toLowerCase())
      )?.key;
      
      if (key) {
        if (targetNameLower.includes("weekly")) {
          weekly[key] = target.target_value;
        } else if (targetNameLower.includes("monthly")) {
          monthly[key] = target.target_value;
        }
      }
    });
    
    setWeeklyValues(weekly);
    setMonthlyValues(monthly);
  }, [targets]);

  const handleSliderChange = (key: string, value: number[]) => {
    if (activeTab === "weekly") {
      setWeeklyValues((prev) => ({
        ...prev,
        [key]: value[0],
      }));
    } else {
      setMonthlyValues((prev) => ({
        ...prev,
        [key]: value[0],
      }));
    }
  };

  const handleSaveTargets = async () => {
    try {
      const deadline = getDeadlineForPeriod(activeTab);
      const periodPrefix = activeTab === "weekly" ? "Weekly" : "Monthly";
      const targetValues = activeTab === "weekly" ? weeklyValues : monthlyValues;

      // Save or update each target
      for (const config of TARGET_CONFIGS) {
        const defaultValue = activeTab === "weekly" 
          ? config.min 
          : Math.max(config.min * 2, config.min);
        const targetValue = targetValues[config.key] || defaultValue;
        const targetName = `${periodPrefix} ${config.name}`;
        
        // Check if target already exists (match by name and period)
        const existingTarget = targets.find(
          (t) => t.name.toLowerCase() === targetName.toLowerCase()
        );

        if (existingTarget) {
          // Update existing target
          await updateTargetMutation.mutateAsync({
            id: existingTarget.id,
            updates: {
              target_value: targetValue,
              deadline,
            },
          });
        } else {
          // Create new target
          await createTargetMutation.mutateAsync({
            name: targetName,
            target_value: targetValue,
            current_value: 0,
            deadline,
          });
        }
      }

      toast.success(`${activeTab === "weekly" ? "Weekly" : "Monthly"} targets saved successfully!`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save targets:", error);
      toast.error("Failed to save targets");
    }
  };

  // Filter targets by period
  const weeklyTargets = targets.filter((t) => t.name.toLowerCase().startsWith("weekly"));
  const monthlyTargets = targets.filter((t) => t.name.toLowerCase().startsWith("monthly"));

  // Get current period targets
  const currentTargets = activeTab === "weekly" ? weeklyTargets : monthlyTargets;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Weekly & Monthly Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading targets...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly & Monthly Targets
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Set Targets
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Set Your Targets</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "weekly" | "monthly")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly" className="space-y-6 mt-4">
                  {TARGET_CONFIGS.map((config) => {
                    const currentValue = weeklyValues[config.key] || config.min;
                    return (
                      <div key={config.key} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            {config.icon}
                            {config.name}
                          </Label>
                          <span className="text-sm font-semibold text-accent">
                            {config.format(currentValue)}
                          </span>
                        </div>
                        <Slider
                          value={[currentValue]}
                          onValueChange={(value) => handleSliderChange(config.key, value)}
                          min={config.min}
                          max={config.max}
                          step={config.step}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{config.format(config.min)}</span>
                          <span>{config.format(config.max)}</span>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
                <TabsContent value="monthly" className="space-y-6 mt-4">
                  {TARGET_CONFIGS.map((config) => {
                    // Monthly targets are typically 4x weekly targets, but allow higher ranges
                    const monthlyMin = Math.max(config.min * 2, config.min);
                    const monthlyMax = config.max * 4;
                    const currentValue = monthlyValues[config.key] || monthlyMin;
                    return (
                      <div key={config.key} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            {config.icon}
                            {config.name}
                          </Label>
                          <span className="text-sm font-semibold text-accent">
                            {config.format(currentValue)}
                          </span>
                        </div>
                        <Slider
                          value={[currentValue]}
                          onValueChange={(value) => handleSliderChange(config.key, value)}
                          min={monthlyMin}
                          max={monthlyMax}
                          step={config.step * 2}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{config.format(monthlyMin)}</span>
                          <span>{config.format(monthlyMax)}</span>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTargets} disabled={createTargetMutation.isPending || updateTargetMutation.isPending}>
                  Save Targets
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {targets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No targets set yet</p>
            <p className="text-sm">Click "Set Targets" to create your first targets!</p>
          </div>
        ) : (
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="weekly" className="space-y-6 mt-4">
              {weeklyTargets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No weekly targets set</p>
                  <p className="text-sm mt-1">Set your weekly targets to get started!</p>
                </div>
              ) : (
                weeklyTargets.map((target) => {
                  const progress = target.target_value > 0 
                    ? (target.current_value / target.target_value) * 100 
                    : 0;
                  const isOverTarget = progress >= 100;
                  
                  return (
                    <div key={target.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{target.name.replace("Weekly ", "")}</span>
                        <span className={isOverTarget ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {target.current_value.toLocaleString()}/{target.target_value.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={isOverTarget ? "[&>div]:bg-green-600" : ""}
                      />
                      <p className="text-xs text-muted-foreground">
                        {isOverTarget 
                          ? `🎉 Target exceeded by ${(progress - 100).toFixed(0)}%`
                          : `${(100 - progress).toFixed(0)}% to go`
                        }
                      </p>
                    </div>
                  );
                })
              )}
            </TabsContent>
            <TabsContent value="monthly" className="space-y-6 mt-4">
              {monthlyTargets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No monthly targets set</p>
                  <p className="text-sm mt-1">Set your monthly targets to get started!</p>
                </div>
              ) : (
                monthlyTargets.map((target) => {
                  const progress = target.target_value > 0 
                    ? (target.current_value / target.target_value) * 100 
                    : 0;
                  const isOverTarget = progress >= 100;
                  
                  return (
                    <div key={target.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{target.name.replace("Monthly ", "")}</span>
                        <span className={isOverTarget ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {target.current_value.toLocaleString()}/{target.target_value.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={isOverTarget ? "[&>div]:bg-green-600" : ""}
                      />
                      <p className="text-xs text-muted-foreground">
                        {isOverTarget 
                          ? `🎉 Target exceeded by ${(progress - 100).toFixed(0)}%`
                          : `${(100 - progress).toFixed(0)}% to go`
                        }
                      </p>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
