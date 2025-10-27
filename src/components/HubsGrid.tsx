import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, DollarSign, Settings, Users, Target } from "lucide-react";

const hubs = [
  {
    icon: TrendingUp,
    title: "Marketing Hub",
    description: "Create posts, ads, and campaigns that sound like you across LinkedIn, Instagram, YouTube, and more.",
    color: "hub-marketing",
    status: "Live",
    href: "#marketing",
  },
  {
    icon: Target,
    title: "Sales Hub",
    description: "Prospect, follow up, and close deals automatically. From cold email to signed proposal.",
    color: "hub-sales",
    status: "Live",
    href: "#sales",
  },
  {
    icon: DollarSign,
    title: "Finance Hub",
    description: "Build financial models, track cash flow, and generate investor updates in seconds.",
    color: "hub-finance",
    status: "Live",
    href: "#finance",
  },
  {
    icon: Settings,
    title: "Tech Hub",
    description: "Plan, scope, and document your MVP without needing a product manager.",
    color: "hub-ops",
    status: "Live",
    href: "#tech",
  },
  {
    icon: Settings,
    title: "Ops Hub",
    description: "Auto-generate SOPs, task lists, and progress summaries for your entire workflow.",
    color: "hub-ops",
    status: "Live",
    href: "#ops",
  },
  {
    icon: Users,
    title: "Legal Hub",
    description: "Generate contracts, NDAs, and compliance docs customized for your business.",
    color: "hub-hiring",
    status: "Live",
    href: "#legal",
  },
];

const HubsGrid = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section header */}
          <div className="text-center space-y-4 animate-fade-up">
            <h2 className="text-balance">
              Your all-in-one Founder's Office.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              EERA replaces the need to hire, manage, and train an early team while giving you superhuman capabilities across every function.
            </p>
            <p className="text-sm text-muted-foreground pt-2 italic">
              And with every use, EERA gets smarter, learning your business, goals, and habits to help you move faster with clarity.
            </p>
          </div>

          {/* Hubs grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubs.map((hub, index) => {
              const Icon = hub.icon;
              return (
                <Card 
                  key={hub.title}
                  className="group hover:shadow-lg transition-smooth cursor-pointer animate-scale-in border-2 hover:border-primary/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-foreground">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <Badge 
                        variant={hub.status === "Live" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {hub.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold">{hub.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {hub.description}
                      </p>
                    </div>

                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group-hover:bg-secondary"
                      onClick={() => document.querySelector(hub.href)?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Preview flow
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubsGrid;
