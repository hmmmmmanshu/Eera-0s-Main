import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, isPast, isFuture } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import AddTaskDialog from "./AddTaskDialog";
import AddMeetingDialog from "./AddMeetingDialog";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
}

type GoogleEvent = {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  location?: string;
};

const UpcomingCalendar = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [view, setView] = useState<'all' | 'tasks' | 'meetings'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchMeetings();
    checkGoogleConnection();
  }, []);

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(10);

    if (data && !error) {
      setTasks(data as Task[]);
    }
  };

  const checkGoogleConnection = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.provider_token;
    if (token) {
      setGoogleConnected(true);
      fetchGoogleEvents(token);
    } else {
      setGoogleConnected(false);
    }
  };

  const connectGoogle = async () => {
    try {
      setGoogleLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks.readonly openid email profile',
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const fetchGoogleEvents = async (accessToken: string) => {
    try {
      const nowIso = new Date().toISOString();
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowIso)}&singleEvents=true&orderBy=startTime&maxResults=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      setGoogleEvents((json.items || []) as GoogleEvent[]);
    } catch (e) {
      // Silent fail; show connect state
    }
  };

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(10);

    if (data && !error) {
      setMeetings(data);
    }
  };

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId);

    if (!error) {
      fetchTasks();
      toast({
        title: completed ? "Task marked incomplete" : "Task completed!",
        description: "Task status updated successfully.",
      });
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-foreground';
      case 'medium': return 'text-muted-foreground';
      case 'low': return 'text-muted-foreground/60';
      default: return 'text-muted-foreground';
    }
  };

  const combinedItems = [
    ...tasks.map(t => ({ ...t, type: 'task' as const, dateTime: t.due_date })),
    ...meetings.map(m => ({ ...m, type: 'meeting' as const, dateTime: m.start_time }))
  ].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const filteredItems = combinedItems.filter(item => {
    if (view === 'tasks') return item.type === 'task';
    if (view === 'meetings') return item.type === 'meeting';
    return true;
  });

  return (
    <>
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Upcoming</h3>
              <p className="text-sm text-muted-foreground">Tasks & Meetings</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddTask(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddMeeting(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Meeting
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {(['all', 'tasks', 'meetings'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                  view === v
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming {view === 'all' ? 'items' : view}</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  {item.type === 'task' ? (
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskComplete(item.id, item.completed)}
                        className="mt-0.5"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-foreground" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-medium text-sm",
                          item.completed && "line-through opacity-60",
                          getPriorityColor(item.priority)
                        )}>
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{getDateLabel(item.due_date)}</span>
                          <span className="capitalize px-2 py-0.5 rounded bg-muted text-foreground">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{getDateLabel(item.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(item.start_time), "h:mm a")} - {format(new Date(item.end_time), "h:mm a")}
                          </span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Google Calendar Section */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Google Calendar</p>
              {!googleConnected && (
                <Button size="sm" onClick={connectGoogle} disabled={googleLoading}>
                  {googleLoading ? 'Connecting…' : 'Connect Google'}
                </Button>
              )}
            </div>
            {googleConnected && googleEvents.length === 0 && (
              <p className="text-xs text-muted-foreground">No upcoming Google events.</p>
            )}
            {googleConnected && googleEvents.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {googleEvents.map(ev => {
                  const start = ev.start?.dateTime || ev.start?.date || '';
                  const end = ev.end?.dateTime || ev.end?.date || '';
                  const startDate = start ? new Date(start) : null;
                  const endDate = end ? new Date(end) : null;
                  return (
                    <div key={ev.id} className="p-3 rounded-lg bg-secondary/50">
                      <div className="font-medium text-sm">{ev.summary || 'Untitled event'}</div>
                      {startDate && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{getDateLabel(startDate.toISOString())}</span>
                          {endDate && (
                            <span>
                              {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                            </span>
                          )}
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        onSuccess={fetchTasks}
      />
      <AddMeetingDialog
        open={showAddMeeting}
        onOpenChange={setShowAddMeeting}
        onSuccess={fetchMeetings}
      />
    </>
  );
};

export default UpcomingCalendar;
