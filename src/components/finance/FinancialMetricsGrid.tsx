import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Receipt } from "lucide-react";

export function FinancialMetricsGrid() {
  const metrics = [
    {
      label: "Monthly Revenue",
      value: "$127K",
      change: "+23%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      label: "Monthly Expenses",
      value: "$89K",
      change: "+8%",
      trend: "up",
      icon: CreditCard,
      color: "text-red-500"
    },
    {
      label: "Net Profit (MTD)",
      value: "$38K",
      change: "+45%",
      trend: "up",
      icon: PiggyBank,
      color: "text-accent"
    },
    {
      label: "Outstanding Invoices",
      value: "$52K",
      change: "-12%",
      trend: "down",
      icon: Receipt,
      color: "text-yellow-500"
    },
    {
      label: "Payroll (Monthly)",
      value: "$65K",
      change: "0%",
      trend: "neutral",
      icon: DollarSign,
      color: "text-muted-foreground"
    },
    {
      label: "Operating Margin",
      value: "31%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-accent"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="border-accent/20 hover:border-accent/40 transition-all hover:scale-105">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
              {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
              {metric.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
            <p className={`text-xs font-semibold ${
              metric.trend === "up" ? "text-green-500" : 
              metric.trend === "down" ? "text-red-500" : 
              "text-muted-foreground"
            }`}>
              {metric.change} vs last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
