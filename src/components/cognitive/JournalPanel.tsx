import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function JournalPanel() {
  const { user } = useAuth();
  const { addReflection } = useCognitiveActions(user?.id);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  // Calendar-only view
  const [view, setView] = useState<"calendar">("calendar");
  const [items, setItems] = useState<any[]>([]);
  const [monthMatrix, setMonthMatrix] = useState<{ date: Date; count: number }[][]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      if (!user?.id) { setItems([]); setMonthMatrix([]); return; }
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const { data } = await supabase
        .from("cognitive_reflections")
        .select("id, created_at, content, ai_summary")
        .eq("user_id", user.id)
        .gte("created_at", from.toISOString())
        .order("created_at", { ascending: false });
      const list = data || [];
      setItems(list);

      {
        // Build matrix for current month with counts per day
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysInMonth = end.getDate();
        const counts: Record<number, number> = {};
        list.forEach((r: any) => {
          const d = new Date(r.created_at).getDate();
          counts[d] = (counts[d] || 0) + 1;
        });
        const matrix: { date: Date; count: number }[][] = [];
        let week: { date: Date; count: number }[] = [];
        // Pad leading blanks to start on Monday-like grid
        const firstDay = new Date(start).getDay();
        const pad = (firstDay === 0 ? 6 : firstDay - 1);
        for (let i = 0; i < pad; i++) week.push({ date: new Date(NaN), count: 0 });
        for (let day = 1; day <= daysInMonth; day++) {
          week.push({ date: new Date(now.getFullYear(), now.getMonth(), day), count: counts[day] || 0 });
          if (week.length === 7) { matrix.push(week); week = []; }
        }
        if (week.length) {
          while (week.length < 7) week.push({ date: new Date(NaN), count: 0 });
          matrix.push(week);
        }
        setMonthMatrix(matrix);
      }
    })();
  }, [user?.id, refreshKey]);

  return (
    <Card className="border-accent/30">
      <CardHeader><CardTitle>Journaling & Reflection</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Textarea rows={3} placeholder="Write freely…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button disabled={busy} onClick={async () => {
            if (!text.trim()) { toast.error("Write something first"); return; }
            try {
              setBusy(true);
              const res = await addReflection({ type: "journal", content: text.trim() });
              toast.success("Saved");
              setText("");
              // Refresh calendar immediately
              setRefreshKey((k) => k + 1);
            } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setBusy(false); }
          }}>Save</Button>
        </div>
        {/* Calendar Grid */}
        {
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (<div key={d} className="text-center">{d}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthMatrix.flat().map((cell, idx) => (
                <div key={idx} className={`h-16 rounded border flex items-start justify-start p-1 ${isNaN(cell.date as any) ? 'bg-transparent border-transparent' : 'bg-muted/30'}`}>
                  {!isNaN(cell.date as any) && (
                    <div className="text-[10px] text-muted-foreground">
                      {cell.date.getDate()}
                      {cell.count > 0 && (
                        <div className="mt-1 text-[10px] px-1 rounded bg-accent text-accent-foreground inline-block">
                          {cell.count}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Recent entries list */}
            <div className="space-y-2 pt-2">
              {items.length === 0 ? (
                <div className="text-xs text-muted-foreground">No entries this month.</div>
              ) : items.slice(0, 10).map((r) => (
                <div key={r.id} className="p-2 rounded border">
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                  <div className="text-sm line-clamp-2">{r.content}</div>
                </div>
              ))}
            </div>
          </div>
        }
      </CardContent>
    </Card>
  );
}


