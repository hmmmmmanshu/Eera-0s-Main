import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function FundingPipeline() {
  const { data: rounds = [], isLoading } = useQuery({
    queryKey: ["funding-rounds"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("finance_funding_rounds")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

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
          <TrendingUp className="h-5 w-5 text-accent" />
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
                    <span className="text-sm font-semibold">₹{(Number(round.target_amount || 0) / 1000).toLocaleString()}K</span>
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
