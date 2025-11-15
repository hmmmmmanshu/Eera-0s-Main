import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BotType } from "@/lib/bots/types";

interface BotNavigationBarProps {
  activeBot: BotType;
  onBotChange: (bot: BotType) => void;
}

const BOT_CONFIG: Record<BotType, { label: string; subtitle: string }> = {
  friend: {
    label: "Friend",
    subtitle: "Supportive companion",
  },
  mentor: {
    label: "Mentor",
    subtitle: "Strategic advisor",
  },
  ea: {
    label: "Executive Assistant",
    subtitle: "Efficient assistant",
  },
};

const BOT_ORDER: BotType[] = ["friend", "mentor", "ea"];

export function BotNavigationBar({ activeBot, onBotChange }: BotNavigationBarProps) {
  const currentIndex = BOT_ORDER.indexOf(activeBot);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < BOT_ORDER.length - 1;

  const handlePrevious = () => {
    if (canGoLeft) {
      onBotChange(BOT_ORDER[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (canGoRight) {
      onBotChange(BOT_ORDER[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, bot: BotType) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBotChange(bot);
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-6 px-4">
      <div className="flex items-center gap-4 max-w-4xl w-full">
        {/* Left Arrow */}
        <button
          onClick={handlePrevious}
          disabled={!canGoLeft}
          aria-label="Previous bot"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            canGoLeft ? "text-foreground cursor-pointer" : "text-muted-foreground/30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Bot Pills */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {BOT_ORDER.map((bot) => {
            const isActive = bot === activeBot;
            const config = BOT_CONFIG[bot];

            return (
              <div key={bot} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => onBotChange(bot)}
                  onKeyDown={(e) => handleKeyDown(e, bot)}
                  aria-label={`Switch to ${config.label} bot`}
                  aria-pressed={isActive}
                  className={cn(
                    "px-8 py-5 rounded-xl transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isActive
                      ? "bg-background border-2 border-border text-foreground font-semibold shadow-sm"
                      : "bg-transparent border border-border/50 text-muted-foreground hover:opacity-80 hover:border-border"
                  )}
                >
                  {config.label}
                </button>
                <span
                  className={cn(
                    "text-[13px] transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {config.subtitle}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          disabled={!canGoRight}
          aria-label="Next bot"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            canGoRight ? "text-foreground cursor-pointer" : "text-muted-foreground/30 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

