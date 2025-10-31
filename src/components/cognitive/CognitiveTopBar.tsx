import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function CognitiveTopBar() {
  const { user } = useAuth();
  const { weeklyOverview } = useCognitiveActions(user?.id);
  const [moodAvg, setMoodAvg] = useState<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  const [mood, setMood] = useState<string | undefined>(undefined);

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
        <div className="flex items-center gap-3">
          <div className="text-sm">How are you feeling today?</div>
          <Select onValueChange={(v) => setMood(v)}>
            <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Select mood" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="drained">Drained</SelectItem>
              <SelectItem value="anxious">Anxious</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="motivated">Motivated</SelectItem>
              <SelectItem value="energized">Energized</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={async () => {
            if (!user?.id || !mood) { toast.error("Select a mood"); return; }
            const intensityMap: Record<string, number> = { drained: 2, anxious: 3, neutral: 5, motivated: 7, energized: 9 };
            try {
              await supabase.from("cognitive_moods").insert({ user_id: user.id, mood, intensity: intensityMap[mood] || 5, tags: [] });
              toast.success("Mood saved");
              const snap = await weeklyOverview();
              const payload = (snap as any)?.payload || snap;
              setMoodAvg(payload?.moodAverage ?? null);
            } catch (e: any) { toast.error(e?.message || "Failed"); }
          }}>Save</Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Mood: {moodAvg ?? "–"}</Badge>
          <Badge variant="outline">Δ {delta ?? 0}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}


