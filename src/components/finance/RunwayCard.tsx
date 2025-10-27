import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function RunwayCard() {
  const runwayMonths = 18;
  const burnRate = 45000;
  const cashBalance = 810000;
  const runwayPercentage = (runwayMonths / 24) * 100; // Assuming 24 months is healthy

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Runway</span>
          {runwayMonths < 12 && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold">{runwayMonths}</span>
            <span className="text-xl text-muted-foreground">months</span>
          </div>
          <Progress value={runwayPercentage} className="h-2" />
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cash Balance</span>
            <span className="font-semibold">${cashBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Burn</span>
            <span className="font-semibold flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              ${burnRate.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Projected Depletion</span>
            <span className="font-semibold">Jul 2026</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
