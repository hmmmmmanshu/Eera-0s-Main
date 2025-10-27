import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HROverview() {
  const stats = [
    { label: "Total Employees", value: "24", icon: Users, color: "text-blue-500" },
    { label: "Open Positions", value: "5", icon: Briefcase, color: "text-amber-500" },
    { label: "Monthly Payroll", value: "$48,500", icon: DollarSign, color: "text-green-500" },
    { label: "Avg Performance", value: "4.2/5", icon: TrendingUp, color: "text-purple-500" },
  ];

  const hiringPipeline = [
    { role: "Senior Developer", stage: "Screening", progress: 60, candidates: 8 },
    { role: "Product Designer", stage: "Interview", progress: 75, candidates: 3 },
    { role: "Marketing Manager", stage: "Offer", progress: 90, candidates: 1 },
    { role: "Content Writer", stage: "Sourcing", progress: 30, candidates: 12 },
  ];

  const aiActivity = [
    { action: "Screened 12 candidates for Senior Developer role", time: "2h ago" },
    { action: "Generated 2 performance appraisal summaries", time: "4h ago" },
    { action: "Created onboarding checklist for new hire", time: "6h ago" },
    { action: "Updated salary benchmarks based on market data", time: "1d ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-accent/20 hover:border-accent/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Hiring Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-accent" />
              Active Hiring Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hiringPipeline.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.candidates} candidates • {item.stage}
                    </p>
                  </div>
                  <Badge variant="outline">{item.progress}%</Badge>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
            <Button className="w-full mt-4">View All Roles</Button>
          </CardContent>
        </Card>

        {/* AI Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              AI HR Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start">
              <Briefcase className="h-4 w-4 mr-2" />
              Create Job Role
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Start Onboarding
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Review Appraisals
            </Button>
            <Button variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
