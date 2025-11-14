import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBotChat } from "@/hooks/useBotChat";
import { motion } from "framer-motion";
import { ChatTabsBar } from "./ChatTabsBar";

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
    conversations,
    activeConversationId,
    createNewConversation,
    switchConversation,
    closeConversation,
    renameConversation,
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

  const hasMessages = messages.length > 0;

  const handleNewConversation = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      toast.error("Failed to create new conversation");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      {/* Slimmer Header */}
      <div className="px-3 sm:px-4 py-2 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-foreground tracking-tight truncate">{botName}</h2>
            <p className="text-[13px] text-muted-foreground truncate">{botSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Chat Tabs Bar */}
      <ChatTabsBar
        botType={botId}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationSwitch={switchConversation}
        onNewConversation={handleNewConversation}
        onCloseConversation={closeConversation}
        onRenameConversation={renameConversation}
      />

      {/* Messages Area - Reduced height when empty */}
      <div className={cn(
        "overflow-y-auto overflow-x-hidden px-3 sm:px-4 scroll-smooth custom-scrollbar",
        hasMessages ? "flex-1 py-3 sm:py-4 space-y-2 sm:space-y-3" : "flex-1 py-8 sm:py-12 min-h-0"
      )}>
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
            <div className="text-muted-foreground max-w-xs">
              <p className="text-[13px] font-normal mb-2 text-muted-foreground/80">{BOT_WELCOME_MESSAGES[botId]}</p>
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
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-lg text-[14px] leading-relaxed",
                    "break-words overflow-wrap-anywhere",
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/80 border border-border/50 text-foreground"
                  )}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                >
                  {message.content || (message.streaming && (
                    <TypingIndicator />
                  ))}
                </motion.div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Redesigned with warmth */}
      <div className="px-3 sm:px-4 py-3 border-t border-border/50 bg-gradient-to-t from-background via-background to-muted/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || isLoading}
            className={cn(
              "flex-1 h-10 sm:h-11 rounded-xl border-border/60",
              "bg-background/80 backdrop-blur-sm",
              "text-[14px] placeholder:text-muted-foreground/60",
              "transition-all duration-300 ease-out",
              "focus:border-amber-300/50 focus:ring-2 focus:ring-amber-200/30",
              "focus:bg-background focus:shadow-md",
              "hover:border-border/80",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Message input"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending || isLoading}
              size="icon"
              className={cn(
                "shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl",
                "bg-gradient-to-br from-amber-500 to-orange-500",
                "text-white hover:from-amber-600 hover:to-orange-600",
                "shadow-md hover:shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-300"
              )}
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

