import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function PayrollOverview() {
  const payrollData = {
    totalMonthly: 65000,
    employees: 8,
    contractors: 3,
    nextPaymentDate: "Jan 31, 2024",
    breakdown: [
      { category: "Engineering", amount: 35000, percentage: 54 },
      { category: "Marketing", amount: 15000, percentage: 23 },
      { category: "Operations", amount: 15000, percentage: 23 },
    ]
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Payroll
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">${(payrollData.totalMonthly / 1000).toFixed(0)}K</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {payrollData.employees} employees • {payrollData.contractors} contractors
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          {payrollData.breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.category}</span>
                <span className="font-semibold">${item.amount.toLocaleString()}</span>
              </div>
              <Progress value={item.percentage} className="h-1.5" />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Next Payment</p>
              <p className="font-semibold">{payrollData.nextPaymentDate}</p>
            </div>
            <DollarSign className="h-5 w-5 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
