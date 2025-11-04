import { Brain, Zap, Layout, Bot } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Cognitive Hub",
    description: "EERA builds a long-term memory of your startup: your vision, tone, strategy, and data. It uses this to give contextually accurate outputs every time.",
  },
  {
    icon: Zap,
    title: "Always Up-to-Date",
    description: "You never have to chase new tools or models again. EERA automatically connects to the best-performing LLMs in each category and updates itself.",
  },
  {
    icon: Layout,
    title: "Unified Intelligence",
    description: "EERA connects your marketing, finance, and operations so one decision updates everywhere. Your workspace grows as you do.",
  },
  {
    icon: Bot,
    title: "Human by Design",
    description: "Conversational, intuitive, and deeply human. You don't 'use' EERA, you talk to it.",
  },
];

const WhySection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-16 animate-fade-up">
            <h2 className="text-balance">
              Stop juggling tools. Start building momentum.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
              You don't need ten subscriptions, five dashboards, and three assistants to run your startup. You just need EERA.
            </p>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold mb-8">Smarter inside. Simpler outside.</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features list */}
            <div className="space-y-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={feature.title}
                    className="flex gap-4 group"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center group-hover:bg-foreground/80 transition-smooth">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visualization */}
            <div className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border">
                  <img 
                  src="/Image 1.jpg" 
                  alt="Multiple AI tools unified into EERA OS" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent flex items-end justify-center pb-8">
                  <p className="text-lg font-semibold">The best of every AI tool, unified and personalized for you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
