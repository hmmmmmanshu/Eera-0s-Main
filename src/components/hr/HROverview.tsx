import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHRRoles, useHRCandidates } from "@/hooks/useHRData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function HROverview() {
  const navigate = useNavigate();
  const { data: roles = [] } = useHRRoles();
  const { data: candidates = [] } = useHRCandidates();

  // Calculate real stats
  const openPositions = roles.filter(r => r.status === 'open').length;
  const totalCandidates = candidates.length;

  const stats = [
    { label: "Total Employees", value: "0", icon: Users, color: "text-blue-500" },
    { label: "Open Positions", value: openPositions.toString(), icon: Briefcase, color: "text-amber-500" },
    { label: "Total Candidates", value: totalCandidates.toString(), icon: Users, color: "text-green-500" },
    { label: "Active Roles", value: roles.length.toString(), icon: TrendingUp, color: "text-purple-500" },
  ];

  // Group candidates by role
  const hiringPipeline = roles.slice(0, 4).map(role => {
    const roleCandidates = candidates.filter(c => c.role_id === role.id);
    const totalCandidates = roleCandidates.length;
    const qualifiedCandidates = roleCandidates.filter(c => (c.score || 0) >= 70).length;
    const progress = totalCandidates > 0 ? (qualifiedCandidates / totalCandidates) * 100 : 0;
    
    return {
      role: role.title,
      stage: role.status,
      progress: Math.round(progress),
      candidates: totalCandidates
    };
  });

  const aiActivity = [
    { action: "AI features ready for use", time: "Now" },
    { action: "Job Description Generator available", time: "Now" },
    { action: "Resume Screener active", time: "Now" },
    { action: "Offer Letter Generator ready", time: "Now" },
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
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                navigate('/hr');
                setTimeout(() => {
                  const hiringTab = document.querySelector('[value="hiring"]');
                  if (hiringTab instanceof HTMLElement) {
                    hiringTab.click();
                  }
                }, 100);
                toast.success("Opening Hiring & Screening");
              }}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Create Job Role
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                navigate('/hr');
                setTimeout(() => {
                  const teamTab = document.querySelector('[value="team"]');
                  if (teamTab instanceof HTMLElement) {
                    teamTab.click();
                  }
                }, 100);
                toast.success("Opening Team & Payroll");
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              View Team
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                navigate('/hr');
                setTimeout(() => {
                  const perfTab = document.querySelector('[value="performance"]');
                  if (perfTab instanceof HTMLElement) {
                    perfTab.click();
                  }
                }, 100);
                toast.success("Opening Performance");
              }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Review Appraisals
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                navigate('/hr');
                setTimeout(() => {
                  const aiTab = document.querySelector('[value="ai"]');
                  if (aiTab instanceof HTMLElement) {
                    aiTab.click();
                  }
                }, 100);
                toast.success("Opening HR AI Assistant");
              }}
            >
              <Activity className="h-4 w-4 mr-2" />
              HR AI Assistant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
