import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePayrollSummary } from "@/hooks/useFinanceData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function PayrollOverview() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { data: summary, isLoading: summaryLoading } = usePayrollSummary(currentMonth);

  // Fetch employees or hired candidates for salary calculation
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["hr-employees-active"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First try hr_employees
      const { data: employeesData, error: employeesError } = await supabase
        .from("hr_employees")
        .select("id, name, salary, designation, department, status")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (employeesError && employeesError.code !== "PGRST116") throw employeesError;

      if (employeesData && employeesData.length > 0) {
        return employeesData;
      }

      // Fallback to hired candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("hr_candidates")
        .select("id, name, salary, role_id")
        .eq("user_id", user.id)
        .eq("status", "hired");

      if (candidatesError) throw candidatesError;

      return candidatesData?.map((c) => ({
        id: c.id,
        name: c.name,
        salary: c.salary ? parseFloat(c.salary.toString()) : 0,
        designation: "Employee",
        department: null,
        status: "active",
      })) || [];
    },
  });

  const isLoading = summaryLoading || employeesLoading;

  // Calculate total monthly payroll
  const totalMonthly = summary?.total_monthly_payroll || employees.reduce((sum, emp) => {
    const salary = typeof emp.salary === 'string' ? parseFloat(emp.salary) : (emp.salary || 0);
    return sum + salary;
  }, 0);

  const employeeCount = employees.length;

  // Group by department for breakdown
  const breakdown = employees.reduce((acc, emp) => {
    const dept = emp.department || "Other";
    const salary = typeof emp.salary === 'string' ? parseFloat(emp.salary) : (emp.salary || 0);
    if (!acc[dept]) {
      acc[dept] = { category: dept, amount: 0, count: 0 };
    }
    acc[dept].amount += salary;
    acc[dept].count += 1;
    return acc;
  }, {} as Record<string, { category: string; amount: number; count: number }>);

  const breakdownArray = Object.values(breakdown).map((item) => ({
    ...item,
    percentage: totalMonthly > 0 ? Math.round((item.amount / totalMonthly) * 100) : 0,
  }));

  const nextPaymentDate = summary?.nextPaymentDate 
    ? format(new Date(summary.nextPaymentDate), "MMM dd, yyyy")
    : format(new Date(now.getFullYear(), now.getMonth(), 25), "MMM dd, yyyy");

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
            <span className="text-3xl font-bold">₹{(totalMonthly / 1000).toFixed(0)}K</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {employeeCount} {employeeCount === 1 ? "employee" : "employees"}
          </p>
        </div>

        {breakdownArray.length > 0 ? (
        <div className="space-y-3 pt-2 border-t border-border">
            {breakdownArray.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.category}</span>
                  <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
              </div>
              <Progress value={item.percentage} className="h-1.5" />
            </div>
          ))}
        </div>
        ) : (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground text-center py-4">
              No payroll data available
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Next Payment</p>
              <p className="font-semibold">{nextPaymentDate}</p>
            </div>
            <DollarSign className="h-5 w-5 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
