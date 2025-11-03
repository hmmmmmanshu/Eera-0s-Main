import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Frown, CloudRain, Meh, Smile, Zap } from "lucide-react";

export function CognitiveTopBar() {
  const { user } = useAuth();
  const { weeklyOverview } = useCognitiveActions(user?.id);
  const [moodAvg, setMoodAvg] = useState<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [weekTrend, setWeekTrend] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [monthMatrix, setMonthMatrix] = useState<{ date: Date; avg: number | null; count: number }[][]>([]);

  const moods = [
    { id: "drained", label: "Drained", icon: Frown, color: "text-red-500", bgColor: "bg-red-50 hover:bg-red-100 border-red-200", intensity: 2 },
    { id: "anxious", label: "Anxious", icon: CloudRain, color: "text-orange-500", bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200", intensity: 3 },
    { id: "neutral", label: "Neutral", icon: Meh, color: "text-yellow-500", bgColor: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200", intensity: 5 },
    { id: "motivated", label: "Motivated", icon: Smile, color: "text-green-500", bgColor: "bg-green-50 hover:bg-green-100 border-green-200", intensity: 7 },
    { id: "energized", label: "Energized", icon: Heart, color: "text-pink-500", bgColor: "bg-pink-50 hover:bg-pink-100 border-pink-200", intensity: 9 },
    { id: "peak", label: "Peak Flow", icon: Zap, color: "text-purple-500", bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200", intensity: 10 },
  ];

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        const now = new Date();
        // Get last 7 days of moods for trend
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const { data: recentMoods } = await supabase
          .from("cognitive_moods")
          .select("intensity, created_at")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        // Calculate daily averages for the week
        const dailyData: Record<string, number[]> = {};
        if (recentMoods) {
          recentMoods.forEach((m) => {
            const date = new Date(m.created_at).toDateString();
            if (!dailyData[date]) dailyData[date] = [];
            dailyData[date].push(m.intensity || 5);
          });
        }

        // Get last 7 days with their averages
        const trend: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
          const dayMoods = dailyData[date] || [];
          const avg = dayMoods.length > 0 
            ? dayMoods.reduce((sum, v) => sum + v, 0) / dayMoods.length 
            : 5; // Default to neutral if no data
          trend.push(avg);
        }
        setWeekTrend(trend);

        // Build calendar combining moods + reflections
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysInMonth = end.getDate();
        const { data: moodsMonth } = await supabase
          .from("cognitive_moods")
          .select("created_at, intensity, mood")
          .eq("user_id", user.id)
          .gte("created_at", start.toISOString())
          .lte("created_at", new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).toISOString());
        const { data: reflMonth } = await supabase
          .from("cognitive_reflections")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", start.toISOString())
          .lte("created_at", new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).toISOString());
        const avgByDay: Record<number, number[]> = {};
        const lastMoodByDay: Record<number, string> = {};
        (moodsMonth || []).forEach((m: any) => {
          const d = new Date(m.created_at).getDate();
          (avgByDay[d] ||= []).push(m.intensity || 5);
          lastMoodByDay[d] = m.mood || lastMoodByDay[d];
        });
        const countByDay: Record<number, number> = {};
        (reflMonth || []).forEach((r: any) => {
          const d = new Date(r.created_at).getDate();
          countByDay[d] = (countByDay[d] || 0) + 1;
        });
        const matrix: { date: Date; avg: number | null; count: number }[][] = [];
        let weekRow: { date: Date; avg: number | null; count: number }[] = [];
        const firstDay = new Date(start).getDay();
        const pad = (firstDay === 0 ? 6 : firstDay - 1);
        for (let i = 0; i < pad; i++) weekRow.push({ date: new Date(NaN), avg: null, count: 0 });
        for (let d = 1; d <= daysInMonth; d++) {
          const arr = avgByDay[d] || [];
          const avg = arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
          const today = new Date();
          weekRow.push({ date: new Date(today.getFullYear(), today.getMonth(), d), avg, count: countByDay[d] || 0 });
          if (weekRow.length === 7) { matrix.push(weekRow); weekRow = []; }
        }
        if (weekRow.length) { while (weekRow.length < 7) weekRow.push({ date: new Date(NaN), avg: null, count: 0 }); matrix.push(weekRow); }
        setMonthMatrix(matrix);

        const snap = await weeklyOverview();
        const payload = (snap as any)?.payload || snap;
        const currentAvg = payload?.moodAverage ?? null;
        setMoodAvg(currentAvg);

        // Calculate delta: compare current week avg to previous week avg
        if (currentAvg !== null) {
          const now = Date.now();
          const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
          const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

          const { data: prevWeek } = await supabase
            .from("cognitive_moods")
            .select("intensity")
            .eq("user_id", user.id)
            .gte("created_at", fourteenDaysAgo.toISOString())
            .lt("created_at", sevenDaysAgo.toISOString());

          const prevAvg = prevWeek?.length 
            ? prevWeek.reduce((sum, m) => sum + (m.intensity || 0), 0) / prevWeek.length 
            : null;

          const calculatedDelta = prevAvg !== null 
            ? Math.round((currentAvg - prevAvg) * 10) / 10 
            : 0;
          setDelta(calculatedDelta);
        } else {
          setDelta(0);
        }
      } catch (error) {
        console.error("Error calculating mood delta:", error);
        setDelta(0);
      }
    })();
  }, [user?.id, weeklyOverview, refreshKey]);

  const handleMoodSave = async () => {
    if (!user?.id || !selectedMood) { 
      toast.error("Select a mood first"); 
      return; 
    }
    
    const moodData = moods.find(m => m.id === selectedMood);
    if (!moodData) return;

    try {
      await supabase.from("cognitive_moods").insert({ 
        user_id: user.id, 
        mood: selectedMood, 
        intensity: moodData.intensity, 
        tags: [] 
      });
      
      toast.success("Mood saved");
      setSelectedMood(null);
      
      // Refresh mood average and delta
      const snap = await weeklyOverview();
      const payload = (snap as any)?.payload || snap;
      const currentAvg = payload?.moodAverage ?? null;
      setMoodAvg(currentAvg);

      // Recalculate delta and trend
      if (currentAvg !== null) {
        const now = Date.now();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

        const { data: prevWeek } = await supabase
          .from("cognitive_moods")
          .select("intensity")
          .eq("user_id", user.id)
          .gte("created_at", fourteenDaysAgo.toISOString())
          .lt("created_at", sevenDaysAgo.toISOString());

        const prevAvg = prevWeek?.length 
          ? prevWeek.reduce((sum, m) => sum + (m.intensity || 0), 0) / prevWeek.length 
          : null;

        const calculatedDelta = prevAvg !== null 
          ? Math.round((currentAvg - prevAvg) * 10) / 10 
          : 0;
        setDelta(calculatedDelta);
      }

      // Refresh week trend
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data: recentMoods } = await supabase
        .from("cognitive_moods")
        .select("intensity, created_at")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      const dailyData: Record<string, number[]> = {};
      if (recentMoods) {
        recentMoods.forEach((m) => {
          const date = new Date(m.created_at).toDateString();
          if (!dailyData[date]) dailyData[date] = [];
          dailyData[date].push(m.intensity || 5);
        });
      }

      const trend: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
        const dayMoods = dailyData[date] || [];
        const avg = dayMoods.length > 0 
          ? dayMoods.reduce((sum, v) => sum + v, 0) / dayMoods.length 
          : 5;
        trend.push(avg);
      }
      setWeekTrend(trend);
      setRefreshKey((k) => k + 1);
    } catch (e: any) { 
      toast.error(e?.message || "Failed to save mood"); 
    }
  };

  const maxTrendValue = Math.max(...weekTrend, 10);
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-pink-50/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-purple-500" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection Buttons */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {moods.map((mood) => (
            <Button
              key={mood.id}
              variant={selectedMood === mood.id ? "default" : "outline"}
              className={`flex flex-col h-auto py-4 gap-2 transition-all ${
                selectedMood === mood.id 
                  ? `${mood.bgColor} border-2` 
                  : "hover:bg-muted"
              }`}
              onClick={() => setSelectedMood(mood.id)}
            >
              <mood.icon className={`h-6 w-6 ${mood.color}`} />
              <span className="text-xs font-medium">{mood.label}</span>
            </Button>
          ))}
        </div>

        {/* 7-Day Trend */}
        <div className="space-y-3 pt-2 border-t border-purple-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-purple-700">7-Day Trend</p>
            <p className="text-sm text-purple-600">
              {delta !== null && delta !== 0 ? (delta > 0 ? "+" : "") : ""}
              {delta ?? 0} vs last week
            </p>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weekTrend.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-1">
                <div
                  className={`bg-gradient-to-t from-purple-500 to-pink-400 rounded-t transition-all hover:opacity-80 ${
                    selectedMood && idx === 6 ? "ring-2 ring-purple-400" : ""
                  }`}
                  style={{ 
                    height: `${(value / maxTrendValue) * 100}%`,
                    minHeight: "8px"
                  }}
                  title={`Day ${idx + 1}: ${value.toFixed(1)}`}
                />
                <p className="text-xs text-center text-purple-600 font-medium">
                  {days[idx]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Month Calendar Heatmap */}
        <div className="space-y-2 pt-2 border-t border-purple-100">
          <p className="text-sm font-semibold text-purple-700">This Month</p>
          <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (<div key={d} className="text-center">{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthMatrix.flat().map((cell, idx) => {
              const tone = cell.avg == null ? 0 : Math.min(10, Math.max(0, cell.avg));
              const bg = tone === 0 ? 'bg-transparent border-transparent' : tone < 4 ? 'bg-purple-100' : tone < 7 ? 'bg-purple-300' : 'bg-purple-500';
              return (
                <div key={idx} className={`h-14 rounded border relative flex items-start justify-start p-1 ${isNaN(cell.date as any) ? 'bg-transparent border-transparent' : bg}`} title={isNaN(cell.date as any)? '' : `Avg mood: ${cell.avg?.toFixed(1) || '–'} | Journals: ${cell.count}`}>
                  {!isNaN(cell.date as any) && (
                    <div className="text-[10px] text-white/90">
                      {cell.date.getDate()}
                      {cell.count > 0 && (
                        <div className="mt-1 text-[10px] px-1 rounded bg-white/80 text-purple-700 inline-block">
                          {cell.count}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Mood emoji overlay */}
                  {!isNaN(cell.date as any) && tone > 0 && (
                    <div className="absolute right-1 top-1 text-[12px]">
                      {tone < 3 ? "😞" : tone < 5 ? "😟" : tone < 7 ? "😐" : tone < 9 ? "🙂" : "⚡"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mood Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-100">
          <Button 
            size="sm" 
            onClick={handleMoodSave}
            disabled={!selectedMood}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Save Mood
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/80">
              Mood: {moodAvg ? moodAvg.toFixed(1) : "–"}
            </Badge>
            <Badge variant="outline" className="bg-white/80">
              Δ {delta !== null ? (delta > 0 ? "+" : "") + delta.toFixed(1) : "0"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function moodToEmoji(mood?: string) {
  switch (mood) {
    case "drained": return "😞";
    case "anxious": return "😟";
    case "neutral": return "😐";
    case "motivated": return "🙂";
    case "energized": return "💖";
    case "peak": return "⚡";
    default: return "";
  }
}
