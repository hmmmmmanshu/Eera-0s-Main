import { useState } from "react";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { Brain, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

const CognitiveHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/5">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-center space-y-8"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center gap-4"
            >
              <div className="relative">
                <Brain className="w-20 h-20 text-primary" />
                <Sparkles className="w-8 h-8 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome to Cognitive Hub
              </h1>
              <p className="text-xl text-muted-foreground">
                Your AI co-founder for strategic thinking and emotional intelligence
              </p>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-muted/30 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-pink-500" />
                  <h2 className="text-2xl font-semibold">Coming Soon</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We're building something special here. The Cognitive Hub will be your personal space for:
                </p>
                <ul className="mt-4 space-y-2 text-left text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Tracking your emotional journey as a founder
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Strategic thinking and decision-making support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    AI-powered insights and reflections
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Your personal growth companion
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground/60">
                Stay tuned for updates. We're working hard to bring this to life! ✨
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CognitiveHub;
