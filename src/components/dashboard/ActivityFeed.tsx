import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  hub_name: string;
  activity_type: string;
  created_at: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data && !error) {
      setActivities(data);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No activities yet. Start working on your hubs!</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-hub-${activity.hub_name}`} />
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {activity.hub_name}: {activity.activity_type}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ActivityFeed;
