import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface BotNavigationBarProps {
  activeBot: 'friend' | 'mentor' | 'ea';
  onBotChange: (bot: 'friend' | 'mentor' | 'ea') => void;
}

const BOTS: Array<{ id: 'friend' | 'mentor' | 'ea'; name: string; subtitle: string }> = [
  { id: 'friend', name: 'Friend', subtitle: 'Supportive companion' },
  { id: 'mentor', name: 'Mentor', subtitle: 'Strategic advisor' },
  { id: 'ea', name: 'Executive Assistant', subtitle: 'Efficient assistant' },
];

export function BotNavigationBar({ activeBot, onBotChange }: BotNavigationBarProps) {
  const currentIndex = BOTS.findIndex(bot => bot.id === activeBot);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < BOTS.length - 1;

  const handlePrevious = () => {
    if (canGoLeft) {
      onBotChange(BOTS[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoRight) {
      onBotChange(BOTS[currentIndex + 1].id);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canGoLeft) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight" && canGoRight) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [canGoLeft, canGoRight]);

  return (
    <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-2 md:gap-3 px-2 md:px-3 py-2">
      {/* Left Arrow */}
      <motion.button
        onClick={handlePrevious}
        disabled={!canGoLeft}
        whileHover={canGoLeft ? { scale: 1.1 } : {}}
        whileTap={canGoLeft ? { scale: 0.95 } : {}}
        className={cn(
          "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-200",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label="Previous bot"
      >
        <DynamicIcon name="ChevronLeft" className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>

      {/* Pill Buttons */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 justify-center">
        {BOTS.map((bot) => {
          const isActive = activeBot === bot.id;
          return (
            <motion.button
              key={bot.id}
              onClick={() => onBotChange(bot.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg transition-all duration-300",
                "border min-w-[90px] md:min-w-[120px]",
                "px-3 py-1.5 md:px-4 md:py-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-gradient-to-br from-background to-muted/30 text-foreground border-border shadow-md ring-1 ring-border/50"
                  : "bg-transparent text-muted-foreground border-border/50 opacity-60 hover:opacity-80 hover:border-border/70"
              )}
              aria-label={`Switch to ${bot.name}`}
              aria-pressed={isActive}
            >
              <motion.span
                className={cn(
                  "text-[14px] md:text-[15px] leading-[1.3] tracking-[-0.01em] transition-colors duration-300",
                  isActive ? "font-semibold" : "font-normal"
                )}
                animate={{ opacity: isActive ? 1 : 0.6 }}
              >
                {bot.name}
              </motion.span>
              <motion.span
                className={cn(
                  "text-[11px] md:text-[12px] mt-0 leading-[1.3] font-normal transition-colors duration-300",
                  isActive ? "text-foreground/70" : "text-muted-foreground/70"
                )}
                animate={{ opacity: isActive ? 0.7 : 0.5 }}
              >
                {bot.subtitle}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Right Arrow */}
      <motion.button
        onClick={handleNext}
        disabled={!canGoRight}
        whileHover={canGoRight ? { scale: 1.1 } : {}}
        whileTap={canGoRight ? { scale: 0.95 } : {}}
        className={cn(
          "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-200",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label="Next bot"
      >
        <DynamicIcon name="ChevronRight" className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>
    </div>
  );
}

