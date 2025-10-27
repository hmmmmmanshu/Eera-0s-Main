import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Video } from "lucide-react";

export function CalendarPanel() {
  const events = [
    { time: "10:00 AM", title: "Team Standup", type: "meeting", duration: "30m" },
    { time: "2:00 PM", title: "Investor Call", type: "important", duration: "1h" },
    { time: "4:30 PM", title: "Review Pitch Deck", type: "task", duration: "45m" },
  ];

  const reminders = [
    { text: "Finalize Q4 financial report", urgent: true },
    { text: "Review HR appraisals", urgent: false },
    { text: "Schedule marketing campaign review", urgent: false },
  ];

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Today's Schedule
          </CardTitle>
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Events */}
        <div className="space-y-2">
          {events.map((event, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex flex-col items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">{event.time}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{event.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={event.type === "important" ? "default" : "outline"} className="text-xs">
                    {event.duration}
                  </Badge>
                  {event.type === "meeting" && <Video className="h-3 w-3 text-muted-foreground" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reminders */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm font-medium mb-3">Reminders</p>
          <div className="space-y-2">
            {reminders.map((reminder, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${reminder.urgent ? "bg-red-500 animate-pulse" : "bg-accent"}`} />
                <p className="text-sm text-muted-foreground">{reminder.text}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
