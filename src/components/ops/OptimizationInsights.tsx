import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOpsSkills } from "@/hooks/useOpsSkills";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function OptimizationInsights() {
  const { user } = useAuth();
  const { getOpsInsights } = useOpsSkills(user?.id);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try { setLoading(true); const list = await getOpsInsights(); setInsights(list); }
      catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [user?.id]);

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-accent" />
          Optimization Insights
          <Button size="sm" variant="outline" className="ml-auto" onClick={async () => {
            try { setLoading(true); const list = await getOpsInsights(); setInsights(list); }
            catch (e: any) { toast.error(e?.message || "Failed to refresh insights"); }
            finally { setLoading(false); }
          }}>{loading ? "Refreshing…" : "Refresh"}</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length === 0 ? (
            <div className="text-sm text-muted-foreground">No insights yet.</div>
          ) : insights.map((text, idx) => (
            <div key={idx} className={`p-4 rounded-lg border text-muted-foreground border-accent/20 bg-accent/5 transition-all`}>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
