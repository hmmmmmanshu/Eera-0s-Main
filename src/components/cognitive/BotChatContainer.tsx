import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BotType } from "@/lib/bots/types";

interface BotChatContainerProps {
  activeBot: BotType;
  children: ReactNode;
  onScrollChange?: (bot: BotType) => void;
  fullHeight?: boolean;
}

const BOT_ORDER: BotType[] = ["friend", "mentor", "ea"];

export function BotChatContainer({ activeBot, children, onScrollChange, fullHeight = false }: BotChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isScrollingRef.current) return;

    const container = containerRef.current;
    const currentIndex = BOT_ORDER.indexOf(activeBot);
    const cardWidth = container.clientWidth;
    const scrollPosition = currentIndex * cardWidth;

    isScrollingRef.current = true;
    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    const timeout = setTimeout(() => {
      isScrollingRef.current = false;
    }, 300);

    return () => clearTimeout(timeout);
  }, [activeBot]);

  const handleScroll = () => {
    if (!containerRef.current || isScrollingRef.current) return;

    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.clientWidth;
    const currentIndex = Math.round(scrollLeft / cardWidth);

    if (currentIndex >= 0 && currentIndex < BOT_ORDER.length) {
      const newBot = BOT_ORDER[currentIndex];
      if (newBot !== activeBot && onScrollChange) {
        onScrollChange(newBot);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        "flex overflow-x-auto overflow-y-hidden",
        "scroll-smooth scrollbar-hide",
        "snap-x snap-mandatory",
        "w-full transition-all duration-500",
        fullHeight ? "h-[calc(100vh-80px)]" : "h-[calc(100vh-200px)]"
      )}
      style={{
        scrollSnapType: "x mandatory",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {children}
    </div>
  );
}

interface BotCardProps {
  botType: BotType;
  isActive: boolean;
  children: ReactNode;
}

export function BotCard({ botType, isActive, children }: BotCardProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 w-full h-full",
        "snap-start snap-always",
        "px-6 py-4",
        "transition-all duration-300",
        isActive ? "border-l-2 border-r-2 border-border" : "border-l border-r border-border/50"
      )}
      style={{ width: "calc(100vw - 3rem)" }}
    >
      {children}
    </div>
  );
}

