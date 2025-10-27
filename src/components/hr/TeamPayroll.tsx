import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, TrendingUp, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TeamPayroll() {
  const employees = [
    { name: "John Doe", role: "Engineering Lead", salary: "$8,500", status: "Paid", performance: "4.5/5" },
    { name: "Jane Smith", role: "Product Manager", salary: "$7,800", status: "Paid", performance: "4.8/5" },
    { name: "Mike Johnson", role: "Senior Developer", salary: "$6,500", status: "Pending", performance: "4.2/5" },
    { name: "Sarah Williams", role: "UX Designer", salary: "$6,000", status: "Paid", performance: "4.6/5" },
    { name: "Tom Brown", role: "Marketing Lead", salary: "$7,200", status: "Paid", performance: "4.3/5" },
  ];

  return (
    <div className="space-y-6">
      {/* Payroll Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly Payroll</p>
                <p className="text-3xl font-bold mt-2">$48,500</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-3xl font-bold mt-2">$6,500</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-3xl font-bold mt-2">24</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Structure Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Team Structure & Payroll
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">Process Payroll</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Monthly Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell className="font-mono">{employee.salary}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "Paid" ? "default" : "outline"}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.performance}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Org Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive org chart visualization</p>
              <Button variant="outline" className="mt-4">Build Org Chart</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
