import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingDown, TrendingUp, Receipt, Loader2, Trash2, Edit2 } from "lucide-react";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useFinanceData";
import { useInvoices } from "@/hooks/useFinanceData";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function ExpenseTracking() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: invoices = [] } = useInvoices();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    vendor: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
    description: "",
  });

  // Filter current month data
  const currentMonthExpenses = expenses.filter((exp) => {
    const expDate = parseISO(exp.expense_date);
    return isWithinInterval(expDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  // Current month paid invoices (Income)
  const currentMonthIncome = invoices
    .filter((inv) => {
      if (inv.status !== "paid") return false;
      const paidDate = inv.paid_date ? parseISO(inv.paid_date) : parseISO(inv.created_at);
      return isWithinInterval(paidDate, { start: currentMonthStart, end: currentMonthEnd });
    })
    .map((inv) => ({
      id: inv.id,
      description: `Invoice: ${inv.client_name}`,
      amount: inv.amount,
      category: "Revenue",
      vendor: inv.client_name,
      expense_date: inv.paid_date || inv.created_at,
      type: "income" as const,
    }));

  const totalIncome = currentMonthIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netIncome = totalIncome - totalExpenses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || !formData.vendor) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpense.id,
          updates: {
            category: formData.category,
            amount: parseFloat(formData.amount),
            vendor: formData.vendor,
            expense_date: formData.expense_date,
          },
        });
        toast.success("Expense updated successfully");
      } else {
        await createExpenseMutation.mutateAsync({
          category: formData.category,
          amount: parseFloat(formData.amount),
          vendor: formData.vendor,
          expense_date: formData.expense_date,
        });
        toast.success("Expense added successfully");
      }
      setIsDialogOpen(false);
      setEditingExpense(null);
      setFormData({
        category: "",
        amount: "",
        vendor: "",
        expense_date: format(new Date(), "yyyy-MM-dd"),
        description: "",
      });
    } catch (error: any) {
      toast.error(`Failed to ${editingExpense ? "update" : "add"} expense: ${error.message}`);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      vendor: expense.vendor,
      expense_date: expense.expense_date,
      description: expense.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpenseMutation.mutateAsync(id);
      toast.success("Expense deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete expense: ${error.message}`);
    }
  };

  // Combine income and expenses for display
  const allTransactions = [
    ...currentMonthIncome,
    ...currentMonthExpenses.map((exp) => ({
      ...exp,
      type: "expense" as const,
    })),
  ].sort((a, b) => {
    const dateA = parseISO(a.expense_date || a.created_at);
    const dateB = parseISO(b.expense_date || b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  if (expensesLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-accent" />
              Balance Sheet (Current Month)
            </CardTitle>
            <CardDescription>
              {format(currentMonthStart, "MMM dd")} - {format(currentMonthEnd, "MMM dd, yyyy")}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingExpense(null);
              setFormData({
                category: "",
                amount: "",
                vendor: "",
                expense_date: format(new Date(), "yyyy-MM-dd"),
                description: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software & Tools">Software & Tools</SelectItem>
                      <SelectItem value="Marketing & Ads">Marketing & Ads</SelectItem>
                      <SelectItem value="Office & Operations">Office & Operations</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                      <SelectItem value="Payroll">Payroll</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expense_date">Date *</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}>
                    {createExpenseMutation.isPending || updateExpenseMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingExpense ? "Update" : "Add"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingExpense(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-500">
              ₹{totalIncome.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthIncome.length} {currentMonthIncome.length === 1 ? "invoice" : "invoices"}
            </p>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-500">
              ₹{totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthExpenses.length} {currentMonthExpenses.length === 1 ? "expense" : "expenses"}
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg border ${
            netIncome >= 0 
              ? "bg-green-500/10 border-green-500/20" 
              : "bg-red-500/10 border-red-500/20"
          }`}>
            <p className="text-xs text-muted-foreground mb-1">Net Income</p>
            <p className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-500" : "text-red-500"}`}>
              ₹{netIncome.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {netIncome >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <p className="text-xs text-muted-foreground">
                {netIncome >= 0 ? "Profit" : "Loss"}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 pt-4 border-t border-border">
          <h3 className="font-semibold text-sm mb-3">All Transactions</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {allTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No transactions this month
              </div>
            ) : (
              allTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    transaction.type === "income"
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                        {transaction.type === "income" ? "Income" : transaction.category}
                      </Badge>
                      <span className="text-sm font-medium">
                        {transaction.type === "income" ? transaction.description : transaction.vendor}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(transaction.expense_date || transaction.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-bold ${
                        transaction.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}₹{Number(transaction.amount).toLocaleString()}
                    </span>
                    {transaction.type === "expense" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
