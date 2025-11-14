import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EMPTY_STATE_CONTENT } from "@/lib/bots/emptyStateContent";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  botType: 'friend' | 'mentor' | 'ea';
  isFirstTime?: boolean;
  onQuickAction: (prompt: string) => void;
}

export function EmptyState({ botType, isFirstTime = false, onQuickAction }: EmptyStateProps) {
  const content = EMPTY_STATE_CONTENT[botType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center w-full h-full px-4 py-6 sm:py-8 text-center"
    >
      <div className="max-w-lg w-full space-y-4">
        {/* Welcome Message */}
        <div className="space-y-1.5">
          <motion.h2
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight"
          >
            {content.welcome}
          </motion.h2>
          {content.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-sm sm:text-base text-muted-foreground"
            >
              {content.subtitle}
            </motion.p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground mb-2.5"
          >
            Try asking:
          </motion.p>
          <div className="flex flex-col gap-2">
            {content.quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.25 + index * 0.05 }}
              >
                <Button
                  variant="outline"
                  onClick={() => onQuickAction(action.prompt)}
                  className={cn(
                    "w-full justify-start h-auto py-2.5 px-3.5",
                    "text-left text-[14px] font-normal",
                    "hover:bg-muted/50 hover:border-border",
                    "transition-all duration-200",
                    "group",
                    "border-border/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 w-full">
                    {action.icon && (
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                        <action.icon className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="flex-1 text-left leading-snug">{action.label}</span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips (for first-time users) */}
        {isFirstTime && content.tips && content.tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="pt-4 border-t border-border/40 mt-4"
          >
            <div className="space-y-1.5">
              {content.tips.map((tip, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.55 + index * 0.05 }}
                  className="text-[11px] sm:text-xs text-muted-foreground/70 leading-relaxed"
                >
                  {tip}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

