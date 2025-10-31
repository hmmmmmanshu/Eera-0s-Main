import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRunway, useInvoices, useComplianceTasks } from "@/hooks/useFinanceData";
import { DollarSign, AlertTriangle, Shield, FileText } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FinanceWidget() {
  const { data: runway } = useRunway();
  const { data: invoices = [] } = useInvoices();
  const { data: complianceTasks = [] } = useComplianceTasks("overdue");

  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "overdue"
  ).length;
  const overdueCompliance = complianceTasks.length;
  const runwayMonths = runway?.runway_months ? Number(runway.runway_months) : 0;

  return (
    <Card className="border-accent/20 hover:border-accent/40 transition-all">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            Finance Hub
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/finance">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Runway */}
        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Runway</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {runwayMonths > 0 ? `${Math.floor(runwayMonths)}` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">months</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          {overdueInvoices > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                <span className="text-sm">Overdue Invoices</span>
              </div>
              <Badge variant="destructive">{overdueInvoices}</Badge>
            </div>
          )}

          {overdueCompliance > 0 && (
            <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Overdue Compliance</span>
              </div>
              <Badge variant="destructive">{overdueCompliance}</Badge>
            </div>
          )}

          {runwayMonths > 0 && runwayMonths < 6 && (
            <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Low Runway Warning</span>
              </div>
              <Badge variant="secondary">
                {Math.floor(runwayMonths)} months
              </Badge>
            </div>
          )}
        </div>

        {/* Upcoming Compliance */}
        {complianceTasks.filter((t) => t.status === "upcoming").length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Upcoming Compliance Tasks
            </p>
            <div className="space-y-1">
              {complianceTasks
                .filter((t) => t.status === "upcoming")
                .slice(0, 3)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-xs p-2 hover:bg-accent/10 rounded"
                  >
                    <span className="truncate">{task.title}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(task.due_date), "MMM dd")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
