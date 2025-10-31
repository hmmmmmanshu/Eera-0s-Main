import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useHRRoles, useHRCandidates } from "@/hooks/useHRData";

export function HROverview() {
  const { data: roles = [] } = useHRRoles();
  const { data: candidates = [] } = useHRCandidates();

  // Calculate real stats
  const openPositions = roles.filter(r => r.status === 'open').length;
  const totalCandidates = candidates.length;

  const stats = [
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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
