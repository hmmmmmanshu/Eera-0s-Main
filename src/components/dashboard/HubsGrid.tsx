import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Brain, TrendingUp, DollarSign, Briefcase, Scale, Users, Handshake, ArrowRight } from "lucide-react";

const hubs = [
  {
    id: "cognitive",
    name: "Cognitive Hub",
    description: "AI co-founder tracking emotions, insights, and strategic growth",
    icon: Brain,
    color: "purple",
    route: "/cognitive",
    stats: [
      { label: "Mood Score", value: "7.4/10" },
      { label: "AI Ideas", value: "5 new" },
      { label: "Reflections", value: "12 this week" }
    ]
  },
  {
    id: "marketing",
    name: "Marketing Hub",
    description: "Content creation, scheduling, and analytics in one place",
    icon: TrendingUp,
    color: "blue",
    route: "/marketing",
    stats: [
      { label: "Posts Scheduled", value: "8" },
      { label: "Engagement", value: "+23%" },
      { label: "Reach", value: "12.5K" }
    ]
  },
  {
    id: "sales",
    name: "Sales Hub",
    description: "Pipeline tracking, deals, and revenue growth",
    icon: Handshake,
    color: "emerald",
    route: "/sales",
    stats: [
      { label: "Active Deals", value: "23" },
      { label: "Conversion", value: "24%" },
      { label: "Revenue", value: "$847K" }
    ]
  },
  {
    id: "finance",
    name: "Finance Hub",
    description: "Runway tracking, forecasts, and financial management",
    icon: DollarSign,
    color: "green",
    route: "/finance",
    stats: [
      { label: "Runway", value: "8.2 months" },
      { label: "Burn Rate", value: "$45K/mo" },
      { label: "Revenue", value: "$28K" }
    ]
  },
  {
    id: "operations",
    name: "Operations Hub",
    description: "Tasks, workflows, and process automation",
    icon: Briefcase,
    color: "amber",
    route: "/operations",
    stats: [
      { label: "Active Tasks", value: "24" },
      { label: "Completion", value: "87%" },
      { label: "Workflows", value: "5 running" }
    ]
  },
  {
    id: "legal",
    name: "Legal Hub",
    description: "Contracts, compliance, and legal documentation",
    icon: Scale,
    color: "orange",
    route: "/legal",
    stats: [
      { label: "Contracts", value: "12 active" },
      { label: "Compliance", value: "88%" },
      { label: "Pending", value: "1 review" }
    ]
  },
  {
    id: "hr",
    name: "HR Hub",
    description: "Hiring, team management, and performance tracking",
    icon: Users,
    color: "pink",
    route: "/hr",
    stats: [
      { label: "Team Size", value: "24" },
      { label: "Open Roles", value: "5" },
      { label: "Avg Performance", value: "4.2/5" }
    ]
  }
];

const colorMap = {
  purple: "border-purple-500/20 hover:border-purple-500/40 bg-purple-500/5",
  blue: "border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5",
  emerald: "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5",
  green: "border-green-500/20 hover:border-green-500/40 bg-green-500/5",
  amber: "border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5",
  orange: "border-orange-500/20 hover:border-orange-500/40 bg-orange-500/5",
  pink: "border-pink-500/20 hover:border-pink-500/40 bg-pink-500/5"
};

const iconColorMap = {
  purple: "text-purple-500",
  blue: "text-blue-500",
  emerald: "text-emerald-500",
  green: "text-green-500",
  amber: "text-amber-500",
  orange: "text-orange-500",
  pink: "text-pink-500"
};

export default function HubsGrid() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Hubs</h2>
        <p className="text-muted-foreground">
          Quick overview of all your operational hubs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub) => {
          const Icon = hub.icon;
          return (
            <Card 
              key={hub.id}
              className={`transition-all cursor-pointer ${colorMap[hub.color as keyof typeof colorMap]}`}
              onClick={() => navigate(hub.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/50 ${iconColorMap[hub.color as keyof typeof iconColorMap]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{hub.name}</CardTitle>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {hub.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hub.stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className="text-sm font-semibold">{stat.value}</span>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between mt-4 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(hub.route);
                    }}
                  >
                    Open Hub
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
