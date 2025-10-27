import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Settings, Users, Target, Activity } from "lucide-react";

const metrics = [
  { icon: TrendingUp, label: "Marketing", value: "12.5K", trend: "+23%", color: "hub-marketing" },
  { icon: DollarSign, label: "Runway", value: "18 mo", trend: "Healthy", color: "hub-finance" },
  { icon: Settings, label: "Ops Tasks", value: "8/12", trend: "On track", color: "hub-ops" },
  { icon: Users, label: "Hiring", value: "5 leads", trend: "+2 new", color: "hub-hiring" },
  { icon: Target, label: "Sales", value: "$45K", trend: "+15%", color: "hub-sales" },
];

const UnifiedDashboard = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-up">
            <h2 className="text-balance">Unified Founder Dashboard</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              See Marketing analytics, Ops updates, Hiring status, Financial runway and Sales performance in one dashboard.
              <br />
              <span className="text-foreground font-medium">At the top: this week&apos;s wins, runway, next best actions.</span>
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="space-y-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            {/* Top summary card */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-6 w-6 text-foreground" />
                  <h3 className="text-xl font-semibold">This Week&apos;s Overview</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Top Win</p>
                    <p className="font-semibold">3 new customers acquired</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Runway Status</p>
                    <p className="font-semibold">18 months remaining</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Best Action</p>
                    <p className="font-semibold">Schedule investor updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hub metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card 
                    key={metric.label}
                    className="group hover:shadow-lg transition-smooth animate-fade-up"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                        <Icon className="h-4 w-4 text-background" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-xs text-muted-foreground">{metric.trend}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnifiedDashboard;
