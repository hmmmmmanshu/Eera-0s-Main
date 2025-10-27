import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function CapTable() {
  const stakeholders = [
    { name: "Founders", percentage: 65, shares: 6500000, color: "bg-accent" },
    { name: "Investors", percentage: 25, shares: 2500000, color: "bg-secondary" },
    { name: "Employees (ESOP)", percentage: 10, shares: 1000000, color: "bg-muted" },
  ];

  const totalShares = stakeholders.reduce((sum, s) => sum + s.shares, 0);
  const postMoneyValuation = 15000000;
  const pricePerShare = postMoneyValuation / totalShares;

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Ownership</span>
          <Users className="h-5 w-5 text-accent" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold">${(postMoneyValuation / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Post-money valuation • ${pricePerShare.toFixed(4)}/share
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          {stakeholders.map((holder, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{holder.name}</span>
                <span className="font-semibold">{holder.percentage}%</span>
              </div>
              <Progress 
                value={holder.percentage} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {holder.shares.toLocaleString()} shares • ${((holder.shares * pricePerShare) / 1000000).toFixed(2)}M value
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
