import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRunway } from "@/hooks/useFinanceData";
import { format, addMonths } from "date-fns";

export function RunwayCard() {
  const { data: runway, isLoading } = useRunway();

  const runwayMonths = runway?.runway_months ? Number(runway.runway_months) : 0;
  const burnRate = runway?.monthly_burn_rate ? Number(runway.monthly_burn_rate) : 0;
  const cashBalance = runway?.cash_balance ? Number(runway.cash_balance) : 0;
  const runwayPercentage = (runwayMonths / 24) * 100; // Assuming 24 months is healthy

  // Calculate projected depletion date
  const projectedDate = runwayMonths > 0 ? addMonths(new Date(), Math.floor(runwayMonths)) : null;

  if (isLoading) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!runway) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">Runway</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No runway data available</p>
        </CardContent>
      </Card>
    );
  }

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
            <span className="font-semibold">₹{cashBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Burn</span>
            <span className="font-semibold flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              ₹{burnRate.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Projected Depletion</span>
            <span className="font-semibold">
              {projectedDate ? format(projectedDate, "MMM yyyy") : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
