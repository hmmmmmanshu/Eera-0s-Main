import { Card, CardContent } from "@/components/ui/card";
import { Brain, Heart, Lightbulb, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CognitiveHubMockup = () => {
  return (
    <div className="w-full h-[300px] bg-background rounded-lg border border-border p-4 space-y-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <span className="font-semibold text-sm">Cognitive Hub</span>
        </div>
        <Badge variant="outline" className="text-xs">AI Co-founder</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-pink-500/20">
          <CardContent className="p-3">
            <Heart className="h-4 w-4 text-pink-500 mb-1" />
            <p className="text-xs text-muted-foreground">Mood</p>
            <p className="text-lg font-bold">7.4</p>
          </CardContent>
        </Card>
        <Card className="border-cyan-500/20">
          <CardContent className="p-3">
            <Lightbulb className="h-4 w-4 text-cyan-500 mb-1" />
            <p className="text-xs text-muted-foreground">Ideas</p>
            <p className="text-lg font-bold">5</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="p-3">
            <Calendar className="h-4 w-4 text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="text-lg font-bold">3</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="space-y-2">
        <p className="text-xs font-medium">AI Insights</p>
        <div className="space-y-1">
          <div className="flex items-start gap-2 text-xs">
            <div className="h-1 w-1 rounded-full bg-purple-500 mt-1.5" />
            <span className="text-muted-foreground">Focus on team clarity this week</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <div className="h-1 w-1 rounded-full bg-cyan-500 mt-1.5" />
            <span className="text-muted-foreground">Runway forecasting needs attention</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveHubMockup;
