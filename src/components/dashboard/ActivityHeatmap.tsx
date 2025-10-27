import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ActivityData {
  hub_name: string;
  activity_date: string;
  activity_count: number;
}

const hubs = ['marketing', 'finance', 'ops', 'hiring', 'sales'];

const ActivityHeatmap = () => {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: true });

    if (data && !error) {
      setActivityData(data);
      calculateStreak(data);
    }
  };

  const calculateStreak = (data: ActivityData[]) => {
    // Simple streak calculation - count consecutive days with activity
    const uniqueDates = [...new Set(data.map(d => d.activity_date))].sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (const date of uniqueDates) {
      if (date <= today) {
        currentStreak++;
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        if (nextDay.toISOString().split('T')[0] !== uniqueDates[uniqueDates.indexOf(date) - 1]) {
          break;
        }
      }
    }
    setStreak(currentStreak);
  };

  const getDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getActivityCount = (hub: string, date: string) => {
    const activity = activityData.find(
      (a) => a.hub_name === hub && a.activity_date === date
    );
    return activity?.activity_count || 0;
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count <= 2) return 'bg-primary/20';
    if (count <= 5) return 'bg-primary/50';
    if (count <= 10) return 'bg-primary/75';
    return 'bg-primary';
  };

  const days = getDays();

  return (
    <Card className="p-6 bg-card/50 backdrop-blur">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Activity Heatmap</h3>
          {streak > 0 && (
            <div className="text-sm text-hub-marketing font-semibold">
              🔥 {streak} day streak!
            </div>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="space-y-1">
              {hubs.map((hub) => (
                <div key={hub} className="flex items-center gap-2">
                  <div className="w-20 text-xs font-medium capitalize text-muted-foreground">
                    {hub}
                  </div>
                  <div className="flex gap-1">
                    {days.map((date) => {
                      const count = getActivityCount(hub, date);
                      return (
                        <div
                          key={`${hub}-${date}`}
                          className={`w-3 h-3 rounded-sm transition-all hover:scale-125 ${getIntensityClass(count)}`}
                          title={`${hub} - ${date}: ${count} activities`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline labels */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-20" />
              <div className="flex justify-between flex-1 text-xs text-muted-foreground">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ActivityHeatmap;
