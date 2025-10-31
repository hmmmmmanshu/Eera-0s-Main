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
  const [view, setView] = useState<"weekly" | "monthly" | "none">("none");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (!user?.id || view === "none") { setItems([]); return; }
      const now = new Date();
      let from: Date;
      if (view === "weekly") {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        from = new Date(now); from.setDate(diff); from.setHours(0,0,0,0);
      } else {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const { data } = await supabase
        .from("cognitive_reflections")
        .select("id, created_at, content, ai_summary")
        .eq("user_id", user.id)
        .gte("created_at", from.toISOString())
        .order("created_at", { ascending: false });
      setItems(data || []);
    })();
  }, [user?.id, view]);

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
              if (view !== "none") {
                // refresh list
                setView(view);
              }
            } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setBusy(false); }
          }}>Save</Button>
          <Button variant={view === "monthly" ? "default" : "outline"} onClick={() => setView("monthly")}>View Monthly</Button>
          <Button variant={view === "weekly" ? "default" : "outline"} onClick={() => setView("weekly")}>View Weekly</Button>
        </div>

        {view !== "none" && (
          <div className="space-y-2 pt-2">
            {items.length === 0 ? (
              <div className="text-xs text-muted-foreground">No entries.</div>
            ) : items.map((r) => (
              <div key={r.id} className="p-2 rounded border">
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                <div className="text-sm">{r.content}</div>
                {r.ai_summary && <div className="text-xs text-muted-foreground mt-1">AI: {r.ai_summary}</div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


