import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Circle, Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFundingRounds, useCreateFundingRound, useUpdateFundingRound, useDeleteFundingRound } from "@/hooks/useFinanceData";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function FundingPipeline() {
  const { data: rounds = [], isLoading } = useFundingRounds();
  const createMutation = useCreateFundingRound();
  const updateMutation = useUpdateFundingRound();
  const deleteMutation = useDeleteFundingRound();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    stage: "prospecting" as "prospecting" | "pitch" | "due_diligence" | "term_sheet" | "closed",
    target_amount: "",
    committed_amount: "",
    expected_close: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.target_amount) {
      toast.error("Name and target amount are required");
      return;
    }

    try {
      if (editingRound) {
        await updateMutation.mutateAsync({
          id: editingRound.id,
          updates: {
            name: formData.name,
            stage: formData.stage,
            target_amount: parseFloat(formData.target_amount),
            committed_amount: formData.committed_amount ? parseFloat(formData.committed_amount) : 0,
            expected_close: formData.expected_close || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          stage: formData.stage,
          target_amount: parseFloat(formData.target_amount),
          committed_amount: formData.committed_amount ? parseFloat(formData.committed_amount) : 0,
          investors: [],
          expected_close: formData.expected_close || undefined,
        });
      }
      setIsDialogOpen(false);
      setEditingRound(null);
      setFormData({
        name: "",
        stage: "prospecting",
        target_amount: "",
        committed_amount: "",
        expected_close: "",
      });
    } catch (error: any) {
      toast.error(`Failed to ${editingRound ? "update" : "create"} funding round: ${error.message}`);
    }
  };

  const handleEdit = (round: any) => {
    setEditingRound(round);
    setFormData({
      name: round.name,
      stage: round.stage || "prospecting",
      target_amount: round.target_amount?.toString() || "",
      committed_amount: round.committed_amount?.toString() || "",
      expected_close: round.expected_close || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this funding round?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error: any) {
      toast.error(`Failed to delete funding round: ${error.message}`);
    }
  };

  const getStageColor = (stage: string) => {
    if (stage === "closed") return "bg-green-500";
    if (stage === "term_sheet") return "bg-accent";
    return "bg-yellow-500";
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      prospecting: "Prospecting",
      pitch: "Pitch",
      due_diligence: "Due Diligence",
      term_sheet: "Term Sheet",
      closed: "Closed",
    };
    return labels[stage] || stage;
  };

  const totalPipeline = rounds.reduce((sum, round) => sum + Number(round.target_amount || 0), 0);
  const weightedValue = rounds.reduce((sum, round) => {
    const committed = Number(round.committed_amount || 0);
    const target = Number(round.target_amount || 0);
    // Use committed amount if available, otherwise estimate probability
    if (round.stage === "closed") return sum + target;
    if (round.stage === "term_sheet") return sum + target * 0.8;
    if (round.stage === "due_diligence") return sum + target * 0.6;
    if (round.stage === "pitch") return sum + target * 0.4;
    return sum + target * 0.2;
  }, 0);

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
          <span className="text-lg">Funding Pipeline</span>
          <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingRound(null);
                setFormData({
                  name: "",
                  stage: "prospecting",
                  target_amount: "",
                  committed_amount: "",
                  expected_close: "",
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Round
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRound ? "Edit Funding Round" : "Add Funding Round"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Round Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Seed Round, Series A"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stage">Stage</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) => setFormData({ ...formData, stage: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospecting">Prospecting</SelectItem>
                        <SelectItem value="pitch">Pitch</SelectItem>
                        <SelectItem value="due_diligence">Due Diligence</SelectItem>
                        <SelectItem value="term_sheet">Term Sheet</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target_amount">Target Amount (₹) *</Label>
                    <Input
                      id="target_amount"
                      type="number"
                      step="0.01"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                      placeholder="e.g., 10000000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="committed_amount">Committed Amount (₹)</Label>
                    <Input
                      id="committed_amount"
                      type="number"
                      step="0.01"
                      value={formData.committed_amount}
                      onChange={(e) => setFormData({ ...formData, committed_amount: e.target.value })}
                      placeholder="e.g., 5000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expected_close">Expected Close Date</Label>
                    <Input
                      id="expected_close"
                      type="date"
                      value={formData.expected_close}
                      onChange={(e) => setFormData({ ...formData, expected_close: e.target.value })}
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
                        editingRound ? "Update" : "Add"
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
        {rounds.length > 0 ? (
          <>
        <div>
          <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">₹{(totalPipeline / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-sm text-muted-foreground">
                Weighted: ₹{(weightedValue / 1000000).toFixed(1)}M
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
              {rounds.map((round) => (
                <div key={round.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                      <Circle className={`h-2 w-2 fill-current ${getStageColor(round.stage || "prospecting")}`} />
                      <span className="text-sm font-medium">{round.name}</span>
                </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">₹{(Number(round.target_amount || 0) / 1000).toLocaleString()}K</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEdit(round)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(round.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
              </div>
              <div className="flex items-center justify-between ml-4">
                    <span className="text-xs text-muted-foreground">{getStageLabel(round.stage || "prospecting")}</span>
                    {Number(round.committed_amount || 0) > 0 && (
                <Badge variant="secondary" className="text-xs">
                        ₹{(Number(round.committed_amount || 0) / 1000).toLocaleString()}K committed
                </Badge>
                    )}
              </div>
            </div>
          ))}
        </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>No funding rounds yet</p>
            <p className="text-xs mt-2">Add funding rounds to track your pipeline</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
