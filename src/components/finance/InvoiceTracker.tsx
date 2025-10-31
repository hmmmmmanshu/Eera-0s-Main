import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInvoices } from "@/hooks/useFinanceData";
import { format, isPast, isToday } from "date-fns";
import { useEffect } from "react";
import { useUpdateInvoice } from "@/hooks/useFinanceData";

export function InvoiceTracker() {
  const { data: invoices = [], isLoading } = useInvoices();
  const updateInvoiceMutation = useUpdateInvoice();

  // Auto-update overdue invoices
  useEffect(() => {
    invoices.forEach((invoice) => {
      if (
        invoice.status !== "paid" &&
        invoice.status !== "overdue" &&
        isPast(new Date(invoice.due_date)) &&
        !isToday(new Date(invoice.due_date))
      ) {
        updateInvoiceMutation.mutate({
          id: invoice.id,
          updates: { status: "overdue" },
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices]);

  const stats = {
    paid: invoices.filter((inv) => inv.status === "paid").length,
    pending: invoices.filter((inv) => inv.status === "pending" || inv.status === "sent").length,
    overdue: invoices.filter((inv) => inv.status === "overdue").length,
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
  };

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "overdue") return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

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

  // Get recent invoices (last 5)
  const recentInvoices = invoices.slice(0, 5);

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Invoices
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-green-500/10 rounded-lg">
            <p className="text-2xl font-bold text-green-500">{stats.paid}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
          <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-2 bg-red-500/10 rounded-lg">
            <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border max-h-48 overflow-y-auto">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No invoices yet
            </div>
          ) : (
            recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(invoice.status)}
                  <div>
                    <p className="font-medium text-sm">{invoice.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">₹{invoice.amount.toLocaleString()}</p>
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
