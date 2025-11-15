import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { toast } from "sonner";

export function WeeklyOverview() {
  const { user } = useAuth();
  const { weeklyOverview } = useCognitiveActions(user?.id);
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const weekKey = getMondayISO(new Date());
        const cached = localStorage.getItem(`cog_week_snap_${weekKey}`);
        if (cached) {
          try { setSnapshot(JSON.parse(cached)); } catch {}
        }
        const snap = await weeklyOverview();
        const payload = snap?.payload || snap;
        setSnapshot(payload);
        localStorage.setItem(`cog_week_snap_${weekKey}`, JSON.stringify(payload));
      } catch (e: any) {
        toast.error(e?.message || "Failed to load weekly overview");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DynamicIcon name="Activity" className="h-5 w-5 text-accent"  />
            Weekly Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">This Week</Badge>
            <button onClick={async () => {
              try {
                setLoading(true);
                const snap = await weeklyOverview();
                const payload = snap?.payload || snap;
                setSnapshot(payload);
                localStorage.setItem(`cog_week_snap_${getMondayISO(new Date())}`, JSON.stringify(payload));
              } catch (e: any) { toast.error(e?.message || "Refresh failed"); } finally { setLoading(false); }
            }}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid (derived from snapshot when available) */}
        {snapshot ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <DynamicIcon name="Target" className="h-4 w-4 text-green-500"  />
                <span className="text-2xl font-bold">{snapshot.moodAverage ?? "–"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Mood Average</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <DynamicIcon name="Activity" className="h-4 w-4 text-purple-500"  />
                <span className="text-2xl font-bold">{(snapshot.topMoods?.length || 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Top Moods</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <DynamicIcon name="TrendingUp" className="h-4 w-4 text-blue-500"  />
                <span className="text-2xl font-bold">{(snapshot.themes?.length || 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Themes</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <DynamicIcon name="Award" className="h-4 w-4 text-amber-500"  />
                <span className="text-2xl font-bold">3</span>
              </div>
              <p className="text-xs text-muted-foreground">Actions</p>
            </div>
        </div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading weekly snapshot…</div>
        )}

        {/* Highlights */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Key Highlights</p>
          <div className="space-y-2">
            {(snapshot?.insights || []).slice(0, 3).map((s: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                <p className="text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Week Focus */}
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Suggested Focus Areas</p>
          <div className="space-y-2">
            {(snapshot?.actions || []).slice(0, 3).map((a: string, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm">{a}</span>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getMondayISO(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
