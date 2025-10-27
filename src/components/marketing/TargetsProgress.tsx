import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const targets = [
  {
    label: "Posts This Week",
    current: 7,
    target: 5,
    unit: "posts",
  },
  {
    label: "Monthly Impressions",
    current: 45200,
    target: 50000,
    unit: "impressions",
  },
  {
    label: "Engagement Rate",
    current: 4.2,
    target: 5.0,
    unit: "%",
  },
  {
    label: "New Followers",
    current: 156,
    target: 200,
    unit: "followers",
  },
];

export const TargetsProgress = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Weekly & Monthly Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {targets.map((target) => {
          const progress = (target.current / target.target) * 100;
          const isOverTarget = progress >= 100;
          
          return (
            <div key={target.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{target.label}</span>
                <span className={isOverTarget ? "text-green-600 font-medium" : "text-muted-foreground"}>
                  {target.unit === "impressions" 
                    ? target.current.toLocaleString() 
                    : target.current.toFixed(target.unit === "%" ? 1 : 0)}
                  /{target.target.toLocaleString()} {target.unit}
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
