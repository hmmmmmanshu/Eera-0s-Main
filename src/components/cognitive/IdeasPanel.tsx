import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function IdeasPanel() {
  const { user } = useAuth();
  const { generateIdeas, saveIdea, preflightLLM } = useCognitiveActions(user?.id);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [llmOk, setLlmOk] = useState<boolean | null>(null);

  // Load saved ideas from database
  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from("cognitive_ideas")
          .select("id, title, category, description, status, priority")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        setSavedIdeas(data || []);
      } catch (error) {
        console.error("Error loading saved ideas:", error);
      }
    })();
  }, [user?.id]);

  // preflight once
  useEffect(() => {
    (async () => {
      try { const pf = await preflightLLM(); setLlmOk(!!pf.model); } catch { setLlmOk(false); }
    })();
  }, [preflightLLM]);

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-cyan-500" />
          AI-Generated Ideas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Show saved ideas */}
        {savedIdeas.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Saved Ideas ({savedIdeas.length})</p>
            {savedIdeas.map((idea) => (
              <div key={idea.id} className="p-2 rounded border text-xs bg-muted/30">
                <div className="font-medium mb-1">{idea.title}</div>
                {idea.category && (
                  <Badge variant="outline" className="text-xs mt-1">{idea.category}</Badge>
                )}
                {idea.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                )}
                {idea.status && (
                  <Badge variant="secondary" className="text-xs mt-1 ml-1">{idea.status}</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Show generated ideas */}
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
                  // Refresh saved ideas
                  const { data } = await supabase
                    .from("cognitive_ideas")
                    .select("id, title, category, description, status, priority")
                    .eq("user_id", user?.id)
                    .order("created_at", { ascending: false })
                    .limit(10);
                  setSavedIdeas(data || []);
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
