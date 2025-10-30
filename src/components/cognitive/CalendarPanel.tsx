import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function CalendarPanel() {
  const { user } = useAuth();
  const { suggestSlots, createEvent } = useCognitiveActions(user?.id);
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const s = await suggestSlots();
        setSlots(s || []);
      } catch (e: any) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Today's Schedule
          </CardTitle>
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggested slots */}
        <div className="space-y-2">
          {slots.length === 0 ? (
            <div className="text-sm text-muted-foreground">{loading ? "Analyzing mood patterns…" : "No suggestions yet."}</div>
          ) : (
            slots.map((s, idx) => {
              const start = new Date(s.start);
              const label = start.toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex flex-col items-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">{label}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Deep Work / Important Task</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">1h</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    try {
                      await createEvent({ title: "Deep Work", start_time: s.start, end_time: s.end });
                      toast.success("Event created");
                    } catch (e: any) { toast.error(e?.message || "Failed"); }
                  }}>Add</Button>
                </div>
              );
            })
          )}
        </div>

        {/* Notes */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          Energy-aware suggestions are based on recent mood intensity patterns and default focus windows.
        </div>
      </CardContent>
    </Card>
  );
}
