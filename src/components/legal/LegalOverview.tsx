import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function LegalOverview() {
  const legalHealthScore = 88;
  
  const complianceStatus = [
    { category: "GST Filing", status: "compliant", dueDate: "15 days", color: "text-green-500" },
    { category: "ROC Annual Return", status: "pending", dueDate: "5 days", color: "text-yellow-500" },
    { category: "DPDP Compliance", status: "compliant", dueDate: "90 days", color: "text-green-500" },
    { category: "Tax Audit", status: "overdue", dueDate: "Overdue by 2 days", color: "text-red-500" },
  ];

  const recentActivity = [
    { action: "2 contracts vetted", status: "success", time: "2 hours ago" },
    { action: "1 contract flagged high-risk", status: "warning", time: "4 hours ago" },
    { action: "Privacy policy updated", status: "success", time: "1 day ago" },
    { action: "Compliance report generated", status: "success", time: "2 days ago" },
  ];

  const riskAreas = [
    { area: "Vendor Contracts", risk: "medium", count: 3 },
    { area: "Data Privacy", risk: "low", count: 1 },
    { area: "Employment Terms", risk: "high", count: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Legal Health Score */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-accent" />
              Legal Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-accent">{legalHealthScore}</span>
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <Progress value={legalHealthScore} className="h-2" />
            <p className="text-sm text-muted-foreground">1 issue requires attention</p>
          </CardContent>
        </Card>

        {/* Active Contracts */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="text-lg">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">24</div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">18 Vetted</Badge>
              <Badge variant="destructive" className="text-xs">6 Pending</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500 mb-2">75%</div>
            <p className="text-sm text-muted-foreground">3 of 4 up to date</p>
          </CardContent>
        </Card>

        {/* Open Cases */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="text-lg">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">7</div>
            <div className="flex gap-2">
              <Badge className="text-xs bg-green-500">3 Resolved</Badge>
              <Badge variant="secondary" className="text-xs">4 Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compliance Deadlines */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-accent" />
              Compliance Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complianceStatus.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-accent/30 transition-all"
              >
                <div>
                  <p className="font-medium">{item.category}</p>
                  <p className="text-xs text-muted-foreground">Due in {item.dueDate}</p>
                </div>
                <Badge 
                  variant={item.status === "compliant" ? "default" : item.status === "pending" ? "secondary" : "destructive"}
                  className="capitalize"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Heatmap */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Risk Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskAreas.map((area, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border border-border bg-card hover:border-accent/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{area.area}</span>
                  <Badge 
                    variant={area.risk === "high" ? "destructive" : area.risk === "medium" ? "secondary" : "default"}
                    className="capitalize"
                  >
                    {area.risk} risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{area.count} item(s) require review</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Activity Feed */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-accent" />
            AI Activity Feed
            <span className="relative flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-accent/30 transition-all"
              >
                <div className={`p-2 rounded-full ${
                  activity.status === "success" ? "bg-green-500/20" : "bg-yellow-500/20"
                }`}>
                  {activity.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
