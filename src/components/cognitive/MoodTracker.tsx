import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const moods = [
    { icon: Frown, label: "Drained", value: 1, color: "text-red-500" },
    { icon: CloudRain, label: "Anxious", value: 2, color: "text-orange-500" },
    { icon: Meh, label: "Neutral", value: 3, color: "text-yellow-500" },
    { icon: Smile, label: "Motivated", value: 4, color: "text-green-500" },
    { icon: Heart, label: "Energized", value: 5, color: "text-pink-500" },
    { icon: Zap, label: "Peak Flow", value: 6, color: "text-purple-500" },
  ];

  const weekTrend = [6.2, 6.5, 5.8, 7.1, 7.4, 7.8, 8.0];

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DynamicIcon name="Heart" className="h-5 w-5 text-purple-500"  />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              className="flex flex-col h-auto py-4 gap-2"
              onClick={() => setSelectedMood(mood.value)}
            >
              <mood.icon className={`h-6 w-6 ${mood.color}`} />
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>

        {/* Weekly Trend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">7-Day Trend</p>
            <p className="text-sm text-muted-foreground">+0.6 vs last week</p>
          </div>
          <div className="flex items-end gap-1 h-20">
            {weekTrend.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end">
                <div
                  className="bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(value / 10) * 100}%` }}
                />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {["M", "T", "W", "T", "F", "S", "S"][idx]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Mood Insight */}
        {selectedMood && (
          <div className="p-4 rounded-lg bg-muted/50 animate-fade-in">
            <p className="text-sm">
              <span className="font-medium">AI Insight:</span> Based on your recent activity,
              this feeling aligns with your {selectedMood > 4 ? "productivity surge" : "need for recovery"}.
              {selectedMood > 4 ? " Keep the momentum!" : " Consider a break or delegation."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
