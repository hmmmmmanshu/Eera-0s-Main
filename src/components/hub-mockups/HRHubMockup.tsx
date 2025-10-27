import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Briefcase, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const HRHubMockup = () => {
  return (
    <div className="w-full h-[300px] bg-background rounded-lg border border-border p-4 space-y-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          <span className="font-semibold text-sm">HR & Recruitment</span>
        </div>
        <Badge variant="outline" className="text-xs">24 Employees</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-blue-500/20">
          <CardContent className="p-3">
            <Briefcase className="h-4 w-4 text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Open Roles</p>
            <p className="text-lg font-bold">5</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="p-3">
            <TrendingUp className="h-4 w-4 text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">Avg Perf.</p>
            <p className="text-lg font-bold">4.2</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20">
          <CardContent className="p-3">
            <Award className="h-4 w-4 text-purple-500 mb-1" />
            <p className="text-xs text-muted-foreground">Reviews</p>
            <p className="text-lg font-bold">8</p>
          </CardContent>
        </Card>
      </div>

      {/* Hiring Pipeline */}
      <div className="space-y-2">
        <p className="text-xs font-medium">Active Hiring</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Senior Developer</span>
            <Badge variant="secondary" className="text-xs">8 candidates</Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Product Designer</span>
            <Badge variant="secondary" className="text-xs">3 candidates</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRHubMockup;
