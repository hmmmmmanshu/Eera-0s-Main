import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCapTable, useCreateCapTableEntry, useUpdateCapTableEntry, useDeleteCapTableEntry } from "@/hooks/useFinanceData";
import { format } from "date-fns";
import { toast } from "sonner";

export function CapTable() {
  const { data: stakeholders = [], isLoading } = useCapTable();
  const createMutation = useCreateCapTableEntry();
  const updateMutation = useUpdateCapTableEntry();
  const deleteMutation = useDeleteCapTableEntry();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<any>(null);
  const [formData, setFormData] = useState({
    shareholder_name: "",
    shareholder_type: "founder" as "founder" | "investor" | "employee" | "other",
    shares: "",
    share_class: "common" as "common" | "preferred",
    investment_amount: "",
    investment_date: "",
  });

  const totalShares = stakeholders.reduce((sum, s) => sum + Number(s.shares || 0), 0);
  const totalInvestment = stakeholders.reduce((sum, s) => sum + Number(s.investment_amount || 0), 0);
  
  // Estimate valuation based on last investment or default
  const postMoneyValuation = totalShares > 0 && totalInvestment > 0
    ? (totalInvestment / (totalShares / 10000000)) * 10000000 // Estimate based on last round
    : totalInvestment * 2; // 2x if no shares defined
  
  const pricePerShare = totalShares > 0 ? postMoneyValuation / totalShares : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shareholder_name || !formData.shares) {
      toast.error("Shareholder name and shares are required");
      return;
    }

    try {
      if (editingStakeholder) {
        await updateMutation.mutateAsync({
          id: editingStakeholder.id,
          updates: {
            shareholder_name: formData.shareholder_name,
            shareholder_type: formData.shareholder_type,
            shares: parseFloat(formData.shares),
            share_class: formData.share_class,
            investment_amount: formData.investment_amount ? parseFloat(formData.investment_amount) : undefined,
            investment_date: formData.investment_date || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          shareholder_name: formData.shareholder_name,
          shareholder_type: formData.shareholder_type,
          shares: parseFloat(formData.shares),
          share_class: formData.share_class,
          investment_amount: formData.investment_amount ? parseFloat(formData.investment_amount) : undefined,
          investment_date: formData.investment_date || undefined,
        });
      }
      setIsDialogOpen(false);
      setEditingStakeholder(null);
      setFormData({
        shareholder_name: "",
        shareholder_type: "founder",
        shares: "",
        share_class: "common",
        investment_amount: "",
        investment_date: "",
      });
    } catch (error: any) {
      toast.error(`Failed to ${editingStakeholder ? "update" : "create"} shareholder: ${error.message}`);
    }
  };

  const handleEdit = (stakeholder: any) => {
    setEditingStakeholder(stakeholder);
    setFormData({
      shareholder_name: stakeholder.shareholder_name,
      shareholder_type: stakeholder.shareholder_type || "founder",
      shares: stakeholder.shares?.toString() || "",
      share_class: stakeholder.share_class || "common",
      investment_amount: stakeholder.investment_amount?.toString() || "",
      investment_date: stakeholder.investment_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shareholder?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error: any) {
      toast.error(`Failed to delete shareholder: ${error.message}`);
    }
  };

  // Group by shareholder type
  const grouped = stakeholders.reduce((acc, s) => {
    const type = s.shareholder_type || "other";
    if (!acc[type]) {
      acc[type] = {
        name: type === "founder" ? "Founders" : type === "investor" ? "Investors" : type === "employee" ? "Employees (ESOP)" : "Other",
        shares: 0,
        investment: 0,
      };
    }
    acc[type].shares += Number(s.shares || 0);
    acc[type].investment += Number(s.investment_amount || 0);
    return acc;
  }, {} as Record<string, { name: string; shares: number; investment: number }>);

  const groupedArray = Object.values(grouped);
  const percentages = groupedArray.map((g) => ({
    ...g,
    percentage: totalShares > 0 ? (g.shares / totalShares) * 100 : 0,
  }));

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
          <span className="text-lg">Ownership</span>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingStakeholder(null);
                setFormData({
                  shareholder_name: "",
                  shareholder_type: "founder",
                  shares: "",
                  share_class: "common",
                  investment_amount: "",
                  investment_date: "",
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shareholder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingStakeholder ? "Edit Shareholder" : "Add Shareholder"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="shareholder_name">Shareholder Name *</Label>
                    <Input
                      id="shareholder_name"
                      value={formData.shareholder_name}
                      onChange={(e) => setFormData({ ...formData, shareholder_name: e.target.value })}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shareholder_type">Type</Label>
                    <Select
                      value={formData.shareholder_type}
                      onValueChange={(value) => setFormData({ ...formData, shareholder_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="employee">Employee (ESOP)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shares">Shares *</Label>
                    <Input
                      id="shares"
                      type="number"
                      step="0.01"
                      value={formData.shares}
                      onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                      placeholder="e.g., 1000000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="share_class">Share Class</Label>
                    <Select
                      value={formData.share_class}
                      onValueChange={(value) => setFormData({ ...formData, share_class: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="investment_amount">Investment Amount (₹)</Label>
                    <Input
                      id="investment_amount"
                      type="number"
                      step="0.01"
                      value={formData.investment_amount}
                      onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                      placeholder="e.g., 5000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="investment_date">Investment Date</Label>
                    <Input
                      id="investment_date"
                      type="date"
                      value={formData.investment_date}
                      onChange={(e) => setFormData({ ...formData, investment_date: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingStakeholder ? "Update" : "Add"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stakeholders.length > 0 ? (
          <>
        <div>
          <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">₹{(postMoneyValuation / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-sm text-muted-foreground">
                {totalShares > 0 ? `${totalShares.toLocaleString()} shares • ₹${pricePerShare.toFixed(4)}/share` : "No shares defined"}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
              {percentages.map((holder, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{holder.name}</span>
                    <span className="font-semibold">{holder.percentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={holder.percentage} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                    {holder.shares.toLocaleString()} shares
                    {holder.investment > 0 && ` • ₹${(holder.investment / 1000000).toFixed(2)}M invested`}
              </p>
            </div>
          ))}
          {stakeholders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Individual Shareholders</p>
              {stakeholders.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-accent/10">
                  <div>
                    <p className="font-medium">{s.shareholder_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.shareholder_type} • {Number(s.shares).toLocaleString()} shares
                      {s.investment_amount && ` • ₹${(Number(s.investment_amount) / 1000000).toFixed(2)}M`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEdit(s)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>No cap table data yet</p>
            <p className="text-xs mt-2">Add shareholders to track ownership</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
