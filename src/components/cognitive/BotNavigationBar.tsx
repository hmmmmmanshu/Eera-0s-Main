import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-2 md:gap-4 px-2 md:px-4 py-4 md:py-6">
      {/* Left Arrow */}
      <button
        onClick={handlePrevious}
        disabled={!canGoLeft}
        className={cn(
          "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-200",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label="Previous bot"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Pill Buttons */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 justify-center">
        {BOTS.map((bot) => {
          const isActive = activeBot === bot.id;
          return (
            <button
              key={bot.id}
              onClick={() => onBotChange(bot.id)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl transition-all duration-200",
                "border min-w-[100px] md:min-w-[140px]",
                "px-4 py-3 md:px-8 md:py-5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-background text-foreground border-border shadow-sm"
                  : "bg-transparent text-muted-foreground border-border/50 opacity-60 hover:opacity-80 hover:border-border/70"
              )}
              aria-label={`Switch to ${bot.name}`}
              aria-pressed={isActive}
            >
              <span
                className={cn(
                  "text-[14px] md:text-[15px] leading-[1.4] tracking-[-0.01em] transition-colors",
                  isActive ? "font-semibold" : "font-normal"
                )}
              >
                {bot.name}
              </span>
              <span
                className={cn(
                  "text-[12px] md:text-[13px] mt-0.5 md:mt-1 leading-[1.4] font-normal transition-colors",
                  isActive ? "text-foreground/70" : "text-muted-foreground/70"
                )}
              >
                {bot.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        disabled={!canGoRight}
        className={cn(
          "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-200",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label="Next bot"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
}

