import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          <h2 className="text-balance">
            Be part of the new era of entrepreneurship.
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get early access to EERA before our public launch. Experience what it feels like to build faster, smarter, and lighter.
          </p>
          
          <div className="pt-4">
            <Button size="lg" className="text-lg px-12 h-16 transition-smooth hover:scale-105">
              🔆 Join the Beta Waitlist
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              Limited to the first 200 early users
              <br />
              Beta users get preferred pricing for life
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
