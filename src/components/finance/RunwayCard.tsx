import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle, Loader2, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRunway, useUpdateRunway } from "@/hooks/useFinanceData";
import { format, addMonths } from "date-fns";
import { toast } from "sonner";

export function RunwayCard() {
  const { data: runway, isLoading } = useRunway();
  const updateRunwayMutation = useUpdateRunway();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cash_balance: runway?.cash_balance?.toString() || "",
    monthly_burn_rate: runway?.monthly_burn_rate?.toString() || "",
  });

  const handleUpdateRunway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cash_balance || !formData.monthly_burn_rate) {
      toast.error("Both cash balance and monthly burn rate are required");
      return;
    }

    try {
      await updateRunwayMutation.mutateAsync({
        cash_balance: parseFloat(formData.cash_balance),
        monthly_burn_rate: parseFloat(formData.monthly_burn_rate),
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(`Failed to update runway: ${error.message}`);
    }
  };

  const runwayMonths = runway?.runway_months ? Number(runway.runway_months) : 0;
  const burnRate = runway?.monthly_burn_rate ? Number(runway.monthly_burn_rate) : 0;
  const cashBalance = runway?.cash_balance ? Number(runway.cash_balance) : 0;
  const runwayPercentage = (runwayMonths / 24) * 100; // Assuming 24 months is healthy

  // Calculate projected depletion date
  const projectedDate = runwayMonths > 0 ? addMonths(new Date(), Math.floor(runwayMonths)) : null;

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
          <span className="text-lg">Runway</span>
          <div className="flex items-center gap-2">
            {runway && runwayMonths < 12 && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setFormData({
                  cash_balance: runway?.cash_balance?.toString() || "",
                  monthly_burn_rate: runway?.monthly_burn_rate?.toString() || "",
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  {runway ? "Update" : "Setup"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{runway ? "Update Runway" : "Setup Runway"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateRunway} className="space-y-4">
                  <div>
                    <Label htmlFor="cash_balance">Cash Balance (₹) *</Label>
                    <Input
                      id="cash_balance"
                      type="number"
                      step="0.01"
                      value={formData.cash_balance}
                      onChange={(e) => setFormData({ ...formData, cash_balance: e.target.value })}
                      placeholder="e.g., 500000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly_burn_rate">Monthly Burn Rate (₹) *</Label>
                    <Input
                      id="monthly_burn_rate"
                      type="number"
                      step="0.01"
                      value={formData.monthly_burn_rate}
                      onChange={(e) => setFormData({ ...formData, monthly_burn_rate: e.target.value })}
                      placeholder="e.g., 45000"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={updateRunwayMutation.isPending}>
                      {updateRunwayMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        runway ? "Update" : "Create"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
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
        {!runway ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No runway data available</p>
            <p className="text-xs mt-2">Click Setup to configure your runway</p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">{runwayMonths}</span>
                <span className="text-xl text-muted-foreground">months</span>
              </div>
              <Progress value={runwayPercentage} className="h-2" />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cash Balance</span>
                <span className="font-semibold">₹{cashBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Burn</span>
                <span className="font-semibold flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  ₹{burnRate.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projected Depletion</span>
                <span className="font-semibold">
                  {projectedDate ? format(projectedDate, "MMM yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
