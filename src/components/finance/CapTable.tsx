import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CapTable() {
  const { data: stakeholders = [], isLoading } = useQuery({
    queryKey: ["cap-table"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("finance_cap_table")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const totalShares = stakeholders.reduce((sum, s) => sum + Number(s.shares || 0), 0);
  const totalInvestment = stakeholders.reduce((sum, s) => sum + Number(s.investment_amount || 0), 0);
  
  // Estimate valuation based on last investment or default
  const postMoneyValuation = totalShares > 0 && totalInvestment > 0
    ? (totalInvestment / (totalShares / 10000000)) * 10000000 // Estimate based on last round
    : totalInvestment * 2; // 2x if no shares defined
  
  const pricePerShare = totalShares > 0 ? postMoneyValuation / totalShares : 0;

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
          <Users className="h-5 w-5 text-accent" />
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
