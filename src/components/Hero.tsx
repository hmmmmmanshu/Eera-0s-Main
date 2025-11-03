import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import TabsDemo from "@/components/TabsDemo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Hero = () => {
  const [typewriterText, setTypewriterText] = useState("");
  const fullText = "simplify everything, build anything";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypewriterText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-subtle -z-10" />
      
      <div className="container mx-auto px-6 py-20 md:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-up pt-10 md:pt-16">
          {/* Main headline */}
          <motion.h1 
            className="text-balance leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-block min-h-[1.2em] text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {typewriterText}
              <span className="inline-block w-0.5 h-[0.8em] bg-foreground ml-1 animate-pulse" />
            </span>
            <br />
            <motion.span 
              className="text-foreground text-2xl md:text-4xl lg:text-5xl font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              Welcome to EERA — your Founder&apos;s Office in the Cloud.
            </motion.span>
          </motion.h1>

          {/* CTA buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link to="/auth">
              <Button size="lg" className="text-base md:text-lg px-7 md:px-8 h-12 md:h-14 transition-smooth hover:scale-105">
                🔆 Join the Beta Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* ICP Section */}
          <motion.div 
            className="pt-6 md:pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <h3 className="text-base md:text-lg font-semibold">Built for Founders, Creators, and 1–10 person teams</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Whether you're launching a SaaS, a D2C brand, or a content-first business, EERA gives your small team superpowers so you ship faster, sell smarter, and stay focused.
              </p>
            </div>
          </motion.div>

          {/* Dashboard preview with interactive tabs */}
          <div className="pt-10 md:pt-12 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <TabsDemo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
