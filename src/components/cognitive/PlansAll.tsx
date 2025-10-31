import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const HUBS = ["marketing","sales","finance","ops","hr","legal","cognitive"] as const;

export function PlansAll() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [hubFilter, setHubFilter] = useState<string | "all">("all");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("hub_plans")
        .select("id, hub, title, status, next_step, last_discussed_at")
        .eq("user_id", user.id)
        .order("last_discussed_at", { ascending: false });
      setPlans(data || []);
    })();
  }, [user?.id]);

  const filtered = useMemo(() => hubFilter === "all" ? plans : plans.filter(p => p.hub === hubFilter), [plans, hubFilter]);

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Plans</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={hubFilter === "all" ? "default" : "outline"} onClick={() => setHubFilter("all")}>All</Button>
            {HUBS.map(h => (
              <Button key={h} size="sm" variant={hubFilter === h ? "default" : "outline"} onClick={() => setHubFilter(h)}>{h}</Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No plans</div>
        ) : filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-2 rounded border">
            <div>
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge variant="outline">{p.hub}</Badge>
                {p.next_step && <span>Next: {p.next_step}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(`/cognitive?continuePlan=${p.id}`)}>Continue</Button>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/${p.hub}?planId=${p.id}`)}>Start implementing</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


