import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ExpenseTracking() {
  const expenses = {
    total: 89000,
    budget: 95000,
    categories: [
      { name: "Software & Tools", amount: 25000, budget: 28000, color: "bg-accent" },
      { name: "Marketing & Ads", amount: 22000, budget: 25000, color: "bg-secondary" },
      { name: "Office & Operations", amount: 18000, budget: 20000, color: "bg-muted" },
      { name: "Professional Services", amount: 15000, budget: 15000, color: "bg-accent/60" },
      { name: "Other", amount: 9000, budget: 7000, color: "bg-muted/60" },
    ]
  };

  const utilizationRate = (expenses.total / expenses.budget) * 100;

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-accent" />
            Expenses
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold">${(expenses.total / 1000).toFixed(0)}K</span>
            <span className="text-sm text-muted-foreground">/ ${(expenses.budget / 1000).toFixed(0)}K</span>
          </div>
          <Progress value={utilizationRate} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground">
            {utilizationRate.toFixed(0)}% of monthly budget used
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border max-h-48 overflow-y-auto">
          {expenses.categories.map((category, idx) => {
            const categoryUtilization = (category.amount / category.budget) * 100;
            return (
              <div key={idx} className="space-y-1 p-2 rounded-lg hover:bg-accent/10 transition-colors">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{category.name}</span>
                  <span className="font-semibold">
                    ${category.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={categoryUtilization} className="h-1 flex-1" />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {categoryUtilization.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
