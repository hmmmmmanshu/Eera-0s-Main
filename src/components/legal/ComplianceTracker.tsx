import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ComplianceTracker() {
  const compliances = [
    {
      id: 1,
      category: "GST Filing",
      type: "Tax",
      dueDate: "Jan 20, 2025",
      status: "pending",
      progress: 60,
      jurisdiction: "India",
      priority: "high"
    },
    {
      id: 2,
      category: "ROC Annual Return",
      type: "Corporate",
      dueDate: "Jan 10, 2025",
      status: "in-progress",
      progress: 80,
      jurisdiction: "India",
      priority: "urgent"
    },
    {
      id: 3,
      category: "DPDP Compliance Audit",
      type: "Privacy",
      dueDate: "Mar 15, 2025",
      status: "compliant",
      progress: 100,
      jurisdiction: "India",
      priority: "medium"
    },
    {
      id: 4,
      category: "TDS Returns",
      type: "Tax",
      dueDate: "Feb 7, 2025",
      status: "pending",
      progress: 40,
      jurisdiction: "India",
      priority: "high"
    },
  ];

  const upcomingReminders = [
    { title: "GST Filing Reminder", date: "In 5 days", priority: "high" },
    { title: "Quarterly Board Meeting", date: "In 15 days", priority: "medium" },
    { title: "Annual Compliance Review", date: "In 30 days", priority: "low" },
  ];

  const getStatusColor = (status: string) => {
    if (status === "compliant") return "default";
    if (status === "in-progress") return "secondary";
    return "destructive";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "urgent") return "text-red-500";
    if (priority === "high") return "text-yellow-500";
    if (priority === "medium") return "text-blue-500";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Compliance Calendar */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-accent" />
            Compliance Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {compliances.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-lg border border-border bg-card hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{item.category}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      <span className={`text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {item.dueDate}
                      </span>
                      <span>{item.jurisdiction}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(item.status)} className="capitalize">
                    {item.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="gap-2">
                    <FileText className="h-3 w-3" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    Generate Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filing Reminders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-accent" />
              Upcoming Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReminders.map((reminder, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                >
                  <div>
                    <p className="font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">{reminder.date}</p>
                  </div>
                  {reminder.priority === "high" ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration with Finance Hub */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="text-lg">Finance Hub Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compliance deadlines are synced with your Finance Hub for seamless tax and financial management.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div>
                  <p className="font-medium">Tax Filings Synced</p>
                  <p className="text-xs text-muted-foreground">Last sync: 2 hours ago</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div>
                  <p className="font-medium">Payment Schedules Linked</p>
                  <p className="text-xs text-muted-foreground">4 upcoming payments tracked</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
