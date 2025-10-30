import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Link2, Mic, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { toast } from "sonner";

export function ReflectionStream() {
  const [newEntry, setNewEntry] = useState("");
  const { user } = useAuth();
  const { addReflection } = useCognitiveActions(user?.id);
  const [lastRun, setLastRun] = useState<{ ok: boolean; details: string } | null>(null);

  const entries = [
    {
      id: 1,
      date: "Today, 2:30 PM",
      text: "Feeling anxious about investor updates. Need to finalize pitch deck.",
      tags: ["finance", "anxiety", "communication"],
      sentiment: "concerned",
      linkedHub: "Finance Hub",
    },
    {
      id: 2,
      date: "Yesterday, 4:15 PM",
      text: "Team morale seems low. Should schedule 1-on-1s with each member this week.",
      tags: ["team", "hr", "action"],
      sentiment: "proactive",
      linkedHub: "HR Hub",
    },
    {
      id: 3,
      date: "2 days ago",
      text: "Marketing campaign getting great engagement! Conversion rate up 15%.",
      tags: ["marketing", "success", "metrics"],
      sentiment: "excited",
      linkedHub: "Marketing Hub",
    },
  ];

  const sentimentColors = {
    concerned: "border-orange-500/20 bg-orange-500/5",
    proactive: "border-blue-500/20 bg-blue-500/5",
    excited: "border-green-500/20 bg-green-500/5",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" />
          Reflection Stream
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Entry Input */}
        <div className="space-y-3">
          <Textarea
            placeholder="What's on your mind? Share thoughts, ideas, or concerns..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={async () => {
              if (!newEntry.trim()) { toast.error("Write a reflection first"); return; }
              try {
                const res = await addReflection({ type: "journal", content: newEntry.trim() });
                toast.success("Reflection added with AI tags & summary");
                setNewEntry("");
                console.log("[cognitive] reflection result", res);
                setLastRun({ ok: true, details: `tags=${(res as any).tags?.join(', ') || '—'}, sentiment=${(res as any).sentiment_score ?? '—'}` });
              } catch (e: any) {
                toast.error(e?.message || "Failed to add reflection");
                setLastRun({ ok: false, details: "Local skills unavailable; used LLM-only summarization." });
              }
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Reflection
            </Button>
            <Button variant="outline" size="icon">
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Skills status */}
        {lastRun && (
          <div className={`text-xs ${lastRun.ok ? 'text-muted-foreground' : 'text-amber-600'}`}>
            Local skills {lastRun.ok ? 'ran' : 'fallback'} • {lastRun.details}
          </div>
        )}

        {/* Entries */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border transition-all hover:border-accent/50 ${
                sentimentColors[entry.sentiment as keyof typeof sentimentColors]
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground">{entry.date}</p>
                {entry.linkedHub && (
                  <Badge variant="outline" className="text-xs">
                    <Link2 className="h-3 w-3 mr-1" />
                    {entry.linkedHub}
                  </Badge>
                )}
              </div>
              <p className="text-sm mb-3">{entry.text}</p>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
