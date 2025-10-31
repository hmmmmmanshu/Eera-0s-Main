import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Receipt, Loader2 } from "lucide-react";
import { useInvoices } from "@/hooks/useFinanceData";
import { useExpenses } from "@/hooks/useFinanceData";
import { usePayrollSummary } from "@/hooks/useFinanceData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export function FinancialMetricsGrid() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const lastMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const { data: invoices = [] } = useInvoices();
  const { data: expenses = [] } = useExpenses();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { data: payrollSummary } = usePayrollSummary(currentMonthStr);

  // Fetch current month cash flow
  const { data: cashFlow = [] } = useQuery({
    queryKey: ["cash-flow-current"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("finance_cash_flow")
        .select("*")
        .eq("user_id", user.id)
        .gte("month", currentMonthStart.toISOString().split("T")[0])
        .lte("month", currentMonthEnd.toISOString().split("T")[0]);

      if (error) throw error;
      return data || [];
    },
  });

  const metrics = useMemo(() => {
    // Current month revenue (paid invoices)
    const currentMonthRevenue = invoices
      .filter((inv) => {
        if (inv.status !== "paid") return false;
        const paidDate = inv.paid_date ? parseISO(inv.paid_date) : parseISO(inv.created_at);
        return isWithinInterval(paidDate, { start: currentMonthStart, end: currentMonthEnd });
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Last month revenue
    const lastMonthRevenue = invoices
      .filter((inv) => {
        if (inv.status !== "paid") return false;
        const paidDate = inv.paid_date ? parseISO(inv.paid_date) : parseISO(inv.created_at);
        return isWithinInterval(paidDate, { start: lastMonthStart, end: lastMonthEnd });
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Current month expenses
    const currentMonthExpenses = expenses
      .filter((exp) => {
        const expDate = parseISO(exp.expense_date);
        return isWithinInterval(expDate, { start: currentMonthStart, end: currentMonthEnd });
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Last month expenses
    const lastMonthExpenses = expenses
      .filter((exp) => {
        const expDate = parseISO(exp.expense_date);
        return isWithinInterval(expDate, { start: lastMonthStart, end: lastMonthEnd });
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Outstanding invoices (sent/pending)
    const outstandingInvoices = invoices
      .filter((inv) => inv.status === "sent" || inv.status === "pending" || inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Net profit
    const netProfit = currentMonthRevenue - currentMonthExpenses - (payrollSummary?.total_monthly_payroll || 0);
    const lastMonthNetProfit = lastMonthRevenue - lastMonthExpenses;

    // Calculate changes
    const revenueChange = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    const expensesChange = lastMonthExpenses > 0
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;
    const profitChange = lastMonthNetProfit !== 0
      ? ((netProfit - lastMonthNetProfit) / Math.abs(lastMonthNetProfit)) * 100
      : 0;

    // Operating margin
    const operatingMargin = currentMonthRevenue > 0 
      ? ((netProfit / currentMonthRevenue) * 100) 
      : 0;

    return [
      {
        label: "Monthly Revenue",
        value: `₹${(currentMonthRevenue / 1000).toFixed(0)}K`,
        change: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(0)}%`,
        trend: revenueChange > 0 ? "up" : revenueChange < 0 ? "down" : "neutral",
        icon: DollarSign,
        color: "text-green-500"
      },
      {
        label: "Monthly Expenses",
        value: `₹${((currentMonthExpenses + (payrollSummary?.total_monthly_payroll || 0)) / 1000).toFixed(0)}K`,
        change: `${expensesChange >= 0 ? "+" : ""}${expensesChange.toFixed(0)}%`,
        trend: expensesChange > 0 ? "up" : expensesChange < 0 ? "down" : "neutral",
        icon: CreditCard,
        color: "text-red-500"
      },
      {
        label: "Net Profit (MTD)",
        value: `₹${(netProfit / 1000).toFixed(0)}K`,
        change: `${profitChange >= 0 ? "+" : ""}${profitChange.toFixed(0)}%`,
        trend: profitChange > 0 ? "up" : profitChange < 0 ? "down" : "neutral",
        icon: PiggyBank,
        color: "text-accent"
      },
      {
        label: "Outstanding Invoices",
        value: `₹${(outstandingInvoices / 1000).toFixed(0)}K`,
        change: "—",
        trend: "neutral",
        icon: Receipt,
        color: "text-yellow-500"
      },
      {
        label: "Payroll (Monthly)",
        value: `₹${((payrollSummary?.total_monthly_payroll || 0) / 1000).toFixed(0)}K`,
        change: "—",
        trend: "neutral",
        icon: DollarSign,
        color: "text-muted-foreground"
      },
      {
        label: "Operating Margin",
        value: `${operatingMargin.toFixed(0)}%`,
        change: "—",
        trend: operatingMargin > 20 ? "up" : operatingMargin < 10 ? "down" : "neutral",
        icon: TrendingUp,
        color: "text-accent"
      }
    ];
  }, [invoices, expenses, payrollSummary, currentMonthStart, currentMonthEnd, lastMonthStart, lastMonthEnd]);

  if (!metrics || metrics.length === 0) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="border-accent/20 bg-gradient-to-br from-background to-accent/5 hover:border-accent/40 transition-all hover:scale-105">
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
              {metric.change !== "—" ? `${metric.change} vs last month` : metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
