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
      <CardHeader><CardTitle>Recent Plans</CardTitle></CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent plans yet.</div>
        ) : (
          <div className="relative">
            {/* Horizontal slider */}
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 -mb-2 scrollbar-thin">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="shrink-0 w-64 h-36 rounded-lg border bg-muted/40 hover:bg-muted transition-colors cursor-pointer p-3 flex flex-col justify-between"
                  title={p.title}
                  onClick={() => navigate(`/cognitive?continuePlan=${p.id}`)}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium line-clamp-2 leading-snug">{p.title}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">
                      {p.next_step ? `Next: ${p.next_step}` : "Open to continue"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{p.hub}</Badge>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); goHub(p.hub, p.id); }}>Open</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/cognitive?view=plans')}>View All</Button>
        </div>
      </CardContent>
    </Card>
  );
}


