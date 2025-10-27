import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, TrendingUp } from "lucide-react";

export function IdeasPanel() {
  const ideas = [
    {
      title: "Simplify investor email format",
      relevance: 95,
      source: "Research AI",
      category: "Communication",
      insight: "Top SaaS founders use 3-paragraph structure",
    },
    {
      title: "Double down on LinkedIn content",
      relevance: 88,
      source: "Marketing Hub",
      category: "Growth",
      insight: "Engagement up 20% - capitalize on momentum",
    },
    {
      title: "Implement weekly team check-ins",
      relevance: 82,
      source: "Mood AI",
      category: "Team",
      insight: "Morale correlation with structured communication",
    },
  ];

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
              <Badge variant="outline" className="text-xs">
                {idea.relevance}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{idea.insight}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-cyan-500" />
                <span className="text-xs text-muted-foreground">{idea.source}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                Explore
              </Button>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-3">
          <TrendingUp className="h-4 w-4 mr-2" />
          Generate More Ideas
        </Button>
      </CardContent>
    </Card>
  );
}
