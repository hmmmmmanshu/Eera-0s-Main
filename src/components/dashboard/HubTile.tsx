import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HubTileProps {
  title: string;
  icon: LucideIcon;
  color: string;
  metrics: { label: string; value: string; trend?: string }[];
  preview: React.ReactNode;
  onEnter: () => void;
}

const HubTile = ({ title, icon: Icon, color, metrics, preview, onEnter }: HubTileProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative group"
      >
        <Card className={cn(
          "p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 relative overflow-hidden",
          isHovered ? "border-foreground scale-[1.02]" : "border-border hover:border-foreground/50"
        )}>
          {/* Hover indicator */}
          <div className={cn(
            "absolute top-2 right-2 text-xs font-medium transition-all duration-300",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}>
            <span className="px-2 py-1 rounded-full bg-foreground text-background">
              Hover to preview
            </span>
          </div>
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
              >
                <Icon className="h-6 w-6" style={{ color: `hsl(var(--${color}))` }} />
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full transition-all",
                isHovered ? "bg-primary scale-150" : "bg-muted"
              )} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold">{title}</h3>

            {/* Metrics */}
            <div className="space-y-2">
              {metrics.slice(0, 2).map((metric, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{metric.value}</span>
                    {metric.trend && (
                      <span style={{ color: `hsl(var(--${color}))` }} className="text-xs">
                        {metric.trend}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Fullscreen Preview Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl p-6"
            onClick={() => setIsHovered(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl bg-card border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
                    >
                      <Icon className="h-8 w-8" style={{ color: `hsl(var(--${color}))` }} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{title}</h2>
                      <p className="text-muted-foreground">Hub Preview</p>
                    </div>
                  </div>
                  <Button onClick={onEnter} size="lg" className="gap-2">
                    Enter Hub
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Key Insights */}
                <div className="grid grid-cols-3 gap-4">
                  {metrics.map((metric, i) => (
                    <Card key={i} className="p-4 bg-secondary/50">
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                      <div className="text-2xl font-bold mt-1">{metric.value}</div>
                      {metric.trend && (
                        <div
                          style={{ color: `hsl(var(--${color}))` }}
                          className="text-sm font-semibold mt-1"
                        >
                          {metric.trend}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                {/* Preview Content */}
                <div className="rounded-xl bg-secondary/30 p-6 max-h-96 overflow-auto">
                  {preview}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HubTile;
