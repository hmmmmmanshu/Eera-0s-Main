import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBotChat } from "@/hooks/useBotChat";
import { motion, AnimatePresence } from "framer-motion";

interface BotChatInterfaceProps {
  botId: 'friend' | 'mentor' | 'ea';
  botName: string;
  botSubtitle: string;
  accentColor?: string;
  userId?: string | null;
}

const BOT_WELCOME_MESSAGES: Record<'friend' | 'mentor' | 'ea', string> = {
  friend: "Hey! I'm here to listen and support you. What's on your mind?",
  mentor: "Let's work through this strategically. What challenge are you facing?",
  ea: "How can I help you be more efficient today?",
};

export function BotChatInterface({ botId, botName, botSubtitle, accentColor, userId }: BotChatInterfaceProps) {
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
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-6 py-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10"
      >
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">{botName}</h2>
        <p className="text-sm text-muted-foreground mt-1">{botSubtitle}</p>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth custom-scrollbar">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center h-full text-center px-6"
          >
            <div className="text-muted-foreground max-w-md">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
                </div>
              </motion.div>
              <p className="text-lg font-medium mb-2 text-foreground">Start a conversation</p>
              <p className="text-sm leading-relaxed">{BOT_WELCOME_MESSAGES[botId]}</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index === messages.length - 1 ? 0 : 0 }}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <motion.div
                  className={cn(
                    "max-w-[70%] px-4 py-3 rounded-[18px] text-sm leading-relaxed",
                    "shadow-sm",
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted border border-border text-foreground"
                  )}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {message.content || (message.streaming && (
                    <TypingIndicator />
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-6 py-4 border-t border-border bg-background/95 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || isLoading}
            className="flex-1 border-border focus:border-foreground/20 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
            aria-label="Message input"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending || isLoading}
              size="icon"
              className="shrink-0 h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-all duration-200 shadow-sm"
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
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

