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
      className="flex flex-col items-center justify-center h-full px-4 py-8 sm:py-12 text-center"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Welcome Message */}
        <div className="space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight"
          >
            {content.welcome}
          </motion.h2>
          {content.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-base sm:text-lg text-muted-foreground"
            >
              {content.subtitle}
            </motion.p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-sm text-muted-foreground mb-3"
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
                    "w-full justify-start h-auto py-3 px-4",
                    "text-left text-[15px] font-medium",
                    "hover:bg-muted/50 hover:border-border",
                    "transition-all duration-200",
                    "group"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    {action.icon && (
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                        <action.icon className="w-4 h-4" />
                      </span>
                    )}
                    <span className="flex-1 text-left">{action.label}</span>
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
            className="pt-6 border-t border-border/50 mt-6"
          >
            <div className="space-y-2">
              {content.tips.map((tip, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.55 + index * 0.05 }}
                  className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed"
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

