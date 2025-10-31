import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePayrollData, usePayrollSummary } from "@/hooks/useFinanceData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { analyzePayroll } from "@/lib/gemini";
import {
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  FileText,
  Brain,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PayrollDashboard() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { data: payrollData = [], isLoading } = usePayrollData(currentMonth);
  const { data: summary } = usePayrollSummary(currentMonth);
  
  // Fetch employees - fallback to hired candidates if no employees exist
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["hr-employees-for-payroll"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // First try hr_employees
      const { data: employeesData, error: employeesError } = await supabase
        .from("hr_employees")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (employeesError && employeesError.code !== "PGRST116") throw employeesError;
      
      if (employeesData && employeesData.length > 0) {
        return employeesData.map((emp) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          designation: emp.designation,
          department: emp.department,
          salary: emp.salary,
          status: emp.status,
        }));
      }
      
      // Fallback to hired candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("hr_candidates")
        .select("id, name, email, salary, role_id")
        .eq("user_id", user.id)
        .eq("status", "hired");
      
      if (candidatesError) throw candidatesError;
      
      return candidatesData?.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        designation: "Employee",
        department: null,
        salary: c.salary ? parseFloat(c.salary.toString()) : 0,
        status: "active",
      })) || [];
    },
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [payrollAnalysis, setPayrollAnalysis] = useState<any>(null);

  // Get last 6 months for chart
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
  }

  const { data: historicalPayroll = [] } = usePayrollData(); // Get all months

  const handleAnalyzePayroll = async () => {
    if (!payrollData || payrollData.length === 0) {
      toast.error("No payroll data to analyze");
      return;
    }

    try {
      setAnalyzing(true);
      const analysis = await analyzePayroll(
        payrollData as any[],
        employees || []
      );
      setPayrollAnalysis(analysis);
      toast.success("Payroll analysis completed");
    } catch (error: any) {
      toast.error(`Failed to analyze payroll: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Prepare chart data
  const chartData = months.map((month) => {
    const monthData = historicalPayroll.filter((p: any) => p.pay_period === month);
    return {
      month: format(new Date(month + "-01"), "MMM"),
      total: monthData.reduce((sum: number, p: any) => sum + p.net_pay, 0),
      gross: monthData.reduce((sum: number, p: any) => sum + p.gross_pay, 0),
      taxes: monthData.reduce((sum: number, p: any) => sum + p.tax_deduction, 0),
    };
  });

  if (isLoading || employeesLoading) {
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

  // Calculate total from employees if no payroll summary
  const totalMonthlyPayroll = summary?.total_monthly_payroll || 
    employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);
  const employeeCount = summary?.employee_count || employees.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Monthly Payroll</p>
                <p className="text-2xl font-bold">
                  ₹{totalMonthlyPayroll.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{employeeCount}</p>
              </div>
              <Users className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tax Deductions</p>
                <p className="text-2xl font-bold">
                  ₹{(summary?.total_tax_deductions || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Pay</p>
                <p className="text-2xl font-bold">
                  ₹{(summary?.total_net_pay || totalMonthlyPayroll).toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardHeader>
          <CardTitle>6-Month Payroll Trend</CardTitle>
          <CardDescription>Monthly payroll breakdown over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.some((d) => d.total > 0 || d.gross > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="total" fill="hsl(var(--accent))" name="Total Payroll" />
                <Bar dataKey="gross" fill="hsl(142, 76%, 36%)" name="Gross Pay" />
                <Bar dataKey="taxes" fill="hsl(346, 77%, 49%)" name="Tax Deductions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No historical payroll data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Payroll Table */}
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Month Payroll</CardTitle>
              <CardDescription>
                Payroll details for {format(new Date(currentMonth + "-01"), "MMMM yyyy")}
              </CardDescription>
            </div>
            <Button
              onClick={handleAnalyzePayroll}
              disabled={analyzing || (!payrollData || payrollData.length === 0)}
              variant="outline"
              className="gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payrollData.length === 0 && employees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payroll data for this month</p>
              <p className="text-xs mt-2">No employees found. Add employees from HR Hub first.</p>
            </div>
          ) : payrollData.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4 text-muted-foreground">
                <p className="mb-2">No payroll records for this month</p>
                <p className="text-xs">Payroll records will appear here once created</p>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Available Employees ({employees.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Monthly Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.designation || "-"}</TableCell>
                        <TableCell>{emp.department || "-"}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{emp.salary ? Number(emp.salary).toLocaleString() : "0"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Tax Deduction</TableHead>
                  <TableHead>Other Deductions</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((payroll: any) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">
                      {payroll.employee?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{payroll.employee?.designation || "-"}</TableCell>
                    <TableCell>₹{payroll.gross_pay.toLocaleString()}</TableCell>
                    <TableCell>₹{payroll.tax_deduction.toLocaleString()}</TableCell>
                    <TableCell>₹{payroll.other_deductions.toLocaleString()}</TableCell>
                    <TableCell>₹{payroll.bonuses.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{payroll.net_pay.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payroll.status === "paid"
                            ? "default"
                            : payroll.status === "processed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {payroll.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {payrollAnalysis && (
        <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              AI Payroll Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Tax Efficiency Score</p>
                <p className="text-3xl font-bold">{payrollAnalysis.taxEfficiency}/100</p>
              </div>
            </div>

            {payrollAnalysis.anomalies && payrollAnalysis.anomalies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Anomalies
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {payrollAnalysis.anomalies.map((anomaly: string, idx: number) => (
                    <li key={idx}>{anomaly}</li>
                  ))}
                </ul>
              </div>
            )}

            {payrollAnalysis.optimizationSuggestions &&
              payrollAnalysis.optimizationSuggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Optimization Suggestions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {payrollAnalysis.optimizationSuggestions.map((suggestion: string, idx: number) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

            {payrollAnalysis.complianceNotes &&
              payrollAnalysis.complianceNotes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Compliance Notes</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {payrollAnalysis.complianceNotes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
