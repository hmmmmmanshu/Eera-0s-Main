import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useState } from "react";
import { toast } from "sonner";

export function IdeasPanel() {
  const { user } = useAuth();
  const { generateIdeas, saveIdea, preflightLLM } = useCognitiveActions(user?.id);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [llmOk, setLlmOk] = useState<boolean | null>(null);

  // preflight once
  useState(() => {
    (async () => {
      try { const pf = await preflightLLM(); setLlmOk(!!pf.model); } catch { setLlmOk(false); }
    })();
  });

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-cyan-500" />
          AI-Generated Ideas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ideas.map((idea, idx) => (
          <div key={idx} className="p-3 rounded-lg border border-border hover:border-cyan-500/50 transition-all">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium">{idea.title}</p>
              {idea.category && (
                <Badge variant="outline" className="text-xs">{idea.category}</Badge>
              )}
            </div>
            {idea.rationale && <p className="text-xs text-muted-foreground mb-2">{idea.rationale}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-cyan-500" />
                <span className="text-xs text-muted-foreground">{idea.nextStep || "Suggestion"}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={async () => {
                try {
                  const id = await saveIdea(idea);
                  toast.success("Saved to Ideas");
                } catch (e: any) {
                  toast.error(e?.message || "Failed to save idea");
                }
              }}>
                Save
              </Button>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-3" disabled={loading || llmOk === false} onClick={async () => {
          try {
            setLoading(true);
            const res = await generateIdeas("guide");
            setIdeas(res || []);
          } catch (e: any) {
            toast.error(e?.message || "Failed to generate ideas");
          } finally {
            setLoading(false);
          }
        }}>
          <TrendingUp className="h-4 w-4 mr-2" />
          {llmOk === false ? "Model unavailable" : (loading ? "Generating…" : "Generate 5 Ideas")}
        </Button>
      </CardContent>
    </Card>
  );
}
