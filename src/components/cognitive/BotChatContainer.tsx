import { useEffect, useRef } from "react";
import { BotChatInterface } from "./BotChatInterface";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BotChatContainerProps {
  activeBot: 'friend' | 'mentor' | 'ea';
  onBotChange: (bot: 'friend' | 'mentor' | 'ea') => void;
  userId?: string | null;
}

const BOTS: Array<{ id: 'friend' | 'mentor' | 'ea'; name: string; subtitle: string; accentColor?: string; borderColor?: string }> = [
  { id: 'friend', name: 'Friend', subtitle: 'Supportive companion', accentColor: 'blue', borderColor: 'border-blue-300' },
  { id: 'mentor', name: 'Mentor', subtitle: 'Strategic advisor', accentColor: 'purple', borderColor: 'border-purple-300' },
  { id: 'ea', name: 'Executive Assistant', subtitle: 'Efficient assistant', accentColor: 'green', borderColor: 'border-green-300' },
];

export function BotChatContainer({ activeBot, onBotChange, userId }: BotChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Scroll to active bot when it changes externally (from navigation bar)
  useEffect(() => {
    if (!containerRef.current || isScrollingRef.current) return;

    const currentIndex = BOTS.findIndex(bot => bot.id === activeBot);
    if (currentIndex === -1) return;

    const cardWidth = window.innerWidth - 48; // Account for margins (1.5rem = 24px each side)
    const scrollPosition = currentIndex * (cardWidth + 48); // Add margin spacing

    containerRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  }, [activeBot]);

  // Detect scroll position to update active bot
  const handleScroll = () => {
    if (!containerRef.current || isScrollingRef.current) return;

    const scrollLeft = containerRef.current.scrollLeft;
    const cardWidth = window.innerWidth - 48; // Account for margins (1.5rem = 24px each side)
    const cardWithSpacing = cardWidth + 48; // Card width + margin spacing
    const currentIndex = Math.round(scrollLeft / cardWithSpacing);

    if (currentIndex >= 0 && currentIndex < BOTS.length) {
      const newBot = BOTS[currentIndex].id;
      if (newBot !== activeBot) {
        isScrollingRef.current = true;
        onBotChange(newBot);
        // Reset flag after a short delay
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300);
      }
    }
  };

  // Handle scroll end to snap to nearest bot (using timeout for better compatibility)
  useEffect(() => {
    if (!containerRef.current) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!containerRef.current || isScrollingRef.current) return;

        const scrollLeft = containerRef.current.scrollLeft;
        const cardWidth = window.innerWidth - 32; // Account for margins
        const cardWithSpacing = cardWidth + 32; // Card width + margin spacing
        const currentIndex = Math.round(scrollLeft / cardWithSpacing);
        const targetIndex = Math.max(0, Math.min(currentIndex, BOTS.length - 1));
        const targetScroll = targetIndex * cardWithSpacing;

        // Only snap if we're not already at the target
        if (Math.abs(scrollLeft - targetScroll) > 10) {
          containerRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth',
          });
        }

        const newBot = BOTS[targetIndex].id;
        if (newBot !== activeBot) {
          onBotChange(newBot);
        }
      }, 150);
    };

    const container = containerRef.current;
    container.addEventListener('scroll', handleScrollEnd);

    return () => {
      clearTimeout(scrollTimeout);
      container.removeEventListener('scroll', handleScrollEnd);
    };
  }, [activeBot, onBotChange]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "flex h-full overflow-x-scroll snap-x snap-mandatory",
          "scrollbar-hide", // Hide scrollbar visually
          "scroll-smooth" // Smooth scrolling
        )}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch', // Momentum scrolling on iOS
        }}
      >
        {BOTS.map((bot) => {
          const isActive = activeBot === bot.id;
          return (
            <motion.div
              key={bot.id}
              initial={false}
              animate={{
                opacity: 1,
              }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex-shrink-0 h-full snap-start",
                "bg-background overflow-hidden",
                "transition-all duration-300"
              )}
              style={{
                width: 'calc(100vw - 3rem)',
                scrollSnapAlign: 'start',
                minWidth: 'calc(100vw - 3rem)',
                maxWidth: 'calc(100vw - 3rem)',
                marginLeft: '1.5rem',
                marginRight: '1.5rem',
              }}
            >
              <div
                className={cn(
                  "h-full w-full overflow-hidden",
                  "border-2 rounded-xl",
                  isActive 
                    ? cn(
                        bot.borderColor,
                        bot.id === 'friend' ? "ring-2 ring-blue-200 ring-offset-2" 
                          : bot.id === 'mentor' ? "ring-2 ring-purple-200 ring-offset-2"
                          : "ring-2 ring-green-200 ring-offset-2",
                        "shadow-lg"
                      )
                    : "border-border/40 shadow-sm",
                  "transition-all duration-300",
                  "bg-background"
                )}
                style={{
                  width: '100%',
                  minWidth: '100%',
                  maxWidth: '100%',
                }}
              >
                <BotChatInterface
                  botId={bot.id}
                  botName={bot.name}
                  botSubtitle={bot.subtitle}
                  accentColor={bot.accentColor}
                  userId={userId}
                  isActive={isActive}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

