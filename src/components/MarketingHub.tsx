import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image, Video, Calendar, BarChart3 } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Text",
    description: "Platform + intent-specific (storytelling, promotion, thought leadership)",
  },
  {
    icon: Image,
    title: "Static & Carousels",
    description: "Canva-quality or direct image generation",
  },
  {
    icon: Video,
    title: "Reels/Shorts",
    description: "Script → TTS → render → publish",
  },
  {
    icon: Calendar,
    title: "Publishing",
    description: "Schedule everywhere from one calendar",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Unified dashboard across personal & company brands",
  },
];

const MarketingHub = () => {
  return (
    <section id="marketing" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-up">
            <div className="inline-block px-4 py-2 rounded-full bg-foreground text-background font-semibold text-sm mb-2">
              Marketing Hub - Live
            </div>
            <h2 className="text-balance">
              From idea to on-brand content across LinkedIn, Instagram, and YouTube in minutes.
            </h2>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title}
                  className="group hover:shadow-lg transition-smooth animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center group-hover:bg-foreground/80 transition-smooth">
                      <Icon className="h-6 w-6 text-background" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Supporting line */}
          <div className="text-center animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <p className="text-xl text-muted-foreground italic">
              One tab for your entire marketing stack without hiring a single marketer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketingHub;
