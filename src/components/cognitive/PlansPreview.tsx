import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCognitiveActions } from "@/hooks/useCognitive";

export function PlansPreview() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const navigate = useNavigate();
  const { preflightLLM } = useCognitiveActions(user?.id);
  const { } = useCognitiveActions(user?.id) as any;

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("hub_plans")
        .select("id, hub, title, status, next_step, last_discussed_at")
        .eq("user_id", user.id)
        .order("last_discussed_at", { ascending: false })
        .limit(8);
      setPlans(data || []);
    })();
  }, [user?.id]);

  function goHub(hub: string, id: string) {
    const path = `/${hub === 'cognitive' ? 'cognitive' : hub}`;
    navigate(`${path}?planId=${id}`);
  }

  return (
    <Card className="border-accent/30">
      <CardHeader><CardTitle>Recent Plans & Follow-ups</CardTitle></CardHeader>
      <CardContent className="space-y-2 min-h-[400px]">
        {plans.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent plans yet.</div>
        ) : plans.map((p) => (
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
              <Button size="sm" variant="ghost" onClick={() => goHub(p.hub, p.id)}>Start implementing</Button>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => navigate('/cognitive?view=plans')}>View All</Button>
        </div>
      </CardContent>
    </Card>
  );
}


