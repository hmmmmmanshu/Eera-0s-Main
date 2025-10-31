import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useCognitiveActions } from "@/hooks/useCognitive";

export function CognitiveTopBar() {
  const { user } = useAuth();
  const { weeklyOverview } = useCognitiveActions(user?.id);
  const [moodAvg, setMoodAvg] = useState<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        const snap = await weeklyOverview();
        const payload = (snap as any)?.payload || snap;
        setMoodAvg(payload?.moodAverage ?? null);
        setDelta(0);
      } catch {}
    })();
  }, [user?.id]);

  return (
    <Card className="border-accent/30">
      <CardContent className="flex items-center justify-between py-3">
        <div className="text-sm">How are you feeling today?</div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Mood: {moodAvg ?? "–"}</Badge>
          <Badge variant="outline">Δ {delta ?? 0}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}


