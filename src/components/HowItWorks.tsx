import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Set your brand & goals",
    description: "Logo, colors, tone, ICP, KPIs.",
  },
  {
    number: "2",
    title: "Do the work in minutes",
    description: "Posts, reels, projections, hiring flows, ops tasks.",
  },
  {
    number: "3",
    title: "See what's working",
    description: "Unified analytics and next best action suggestions.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-fade-up">
            <h2>How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative animate-fade-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex flex-col items-center text-center space-y-4 group">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                      <span className="text-3xl font-bold text-primary">{step.number}</span>
                    </div>
                    <CheckCircle2 className="absolute -top-2 -right-2 h-8 w-8 text-primary bg-background rounded-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Connecting arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
