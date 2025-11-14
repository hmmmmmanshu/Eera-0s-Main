import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBotChat } from "@/hooks/useBotChat";
import { motion } from "framer-motion";

interface BotChatInterfaceProps {
  botId: 'friend' | 'mentor' | 'ea';
  botName: string;
  botSubtitle: string;
  accentColor?: string;
  userId?: string | null;
  isActive?: boolean;
}

const BOT_WELCOME_MESSAGES: Record<'friend' | 'mentor' | 'ea', string> = {
  friend: "Hey! I'm here to listen and support you. What's on your mind?",
  mentor: "Let's work through this strategically. What challenge are you facing?",
  ea: "How can I help you be more efficient today?",
};

export function BotChatInterface({ botId, botName, botSubtitle, accentColor, userId, isActive = false }: BotChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
  } = useBotChat({ userId, botType: botId });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const msg = input.trim();
    setInput("");

    try {
      await sendMessage(msg);
    } catch (e: any) {
      toast.error(e?.message || "Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Compact Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-background sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight truncate">{botName}</h2>
            <p className="text-xs text-muted-foreground truncate">{botSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3 scroll-smooth custom-scrollbar min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading conversation...</p>
            </motion.div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div className="text-muted-foreground max-w-sm">
              <p className="text-sm font-medium mb-1 text-foreground">Start a conversation</p>
              <p className="text-xs leading-relaxed">{BOT_WELCOME_MESSAGES[botId]}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-lg text-sm leading-relaxed",
                    "break-words overflow-wrap-anywhere",
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted border border-border text-foreground"
                  )}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                >
                  {message.content || (message.streaming && (
                    <TypingIndicator />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || isLoading}
            className="flex-1 border-border focus:border-foreground/20 transition-all duration-200 focus:ring-1 focus:ring-ring/20 text-sm"
            aria-label="Message input"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending || isLoading}
            size="icon"
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-all duration-200"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Typing indicator component with animated dots
function TypingIndicator() {
  return (
    <span className="text-muted-foreground flex items-center gap-1">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
            animate={{
              y: [0, -4, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </span>
      <span className="ml-1">Thinking...</span>
    </span>
  );
}

