import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMarketingTargets } from "@/hooks/useMarketingData";

export const TargetsProgress = () => {
  const { data: targets = [], isLoading } = useMarketingTargets();

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

  if (targets.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Weekly & Monthly Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No targets set yet. Create your first target to track progress!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Weekly & Monthly Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {targets.map((target) => {
          const progress = (target.current_value / target.target_value) * 100;
          const isOverTarget = progress >= 100;
          
          return (
            <div key={target.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{target.name}</span>
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
        })}
      </CardContent>
    </Card>
  );
};
