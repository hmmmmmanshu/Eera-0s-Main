import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FundingPipeline() {
  const deals = [
    { name: "Series A - Venture Capital", stage: "Term Sheet", amount: 2000000, probability: 70 },
    { name: "Government Grant", stage: "Application Review", amount: 150000, probability: 50 },
    { name: "Angel Round Extension", stage: "Committed", amount: 500000, probability: 95 },
  ];

  const totalPipeline = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.amount * deal.probability / 100), 0);

  const getStageColor = (stage: string) => {
    if (stage === "Committed") return "bg-green-500";
    if (stage === "Term Sheet") return "bg-accent";
    return "bg-yellow-500";
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Funding Pipeline</span>
          <TrendingUp className="h-5 w-5 text-accent" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold">${(totalPipeline / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Weighted: ${(weightedValue / 1000000).toFixed(1)}M
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          {deals.map((deal, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className={`h-2 w-2 fill-current ${getStageColor(deal.stage)}`} />
                  <span className="text-sm font-medium">{deal.name}</span>
                </div>
                <span className="text-sm font-semibold">${(deal.amount / 1000).toLocaleString()}K</span>
              </div>
              <div className="flex items-center justify-between ml-4">
                <span className="text-xs text-muted-foreground">{deal.stage}</span>
                <Badge variant="secondary" className="text-xs">
                  {deal.probability}% likely
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
