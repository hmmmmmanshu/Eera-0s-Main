import { Clock, Palette, TrendingUp, BarChart } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save 20+ hours per week",
    description: "Eliminate context switching between multiple tools and platforms.",
  },
  {
    icon: Palette,
    title: "Maintain brand consistency",
    description: "Your tone, visuals, and strategy remembered across every hub.",
  },
  {
    icon: TrendingUp,
    title: "Scale without bloat",
    description: "Grow your capabilities without adding subscriptions or team members.",
  },
  {
    icon: BarChart,
    title: "Data-driven from day one",
    description: "Get insights and recommendations that actually move the needle.",
  },
];

const WhyFoundersLove = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-up">
            <h2>Why Founders Choose EERA</h2>
          </div>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={benefit.title}
                  className="text-center space-y-4 group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex w-16 h-16 rounded-2xl bg-foreground items-center justify-center group-hover:bg-foreground/80 transition-smooth">
                    <Icon className="h-8 w-8 text-background" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyFoundersLove;
