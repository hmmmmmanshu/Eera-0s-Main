import { useState, useEffect, useRef } from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBotChat } from "@/hooks/useBotChat";
import { motion } from "framer-motion";
import { ChatTabsBar } from "./ChatTabsBar";
import { ConversationSidebar } from "./ConversationSidebar";
import { EmptyState } from "./EmptyState";
import { MessageActions } from "./MessageActions";
import { ChatInput } from "./ChatInput";
import { SkeletonLoader } from "./SkeletonLoader";

interface BotChatInterfaceProps {
  botId: 'friend' | 'mentor' | 'ea';
  botName: string;
  botSubtitle: string;
  accentColor?: string;
  userId?: string | null;
  isActive?: boolean;
}

export function BotChatInterface({ botId, botName, botSubtitle, accentColor, userId, isActive = false }: BotChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    pinConversation,
    unpinConversation,
    archiveConversation,
    unarchiveConversation,
    editMessage,
    deleteMessage,
    regenerateMessage,
    inputHistory,
    getInputHistoryItem,
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
    setHistoryIndex(-1); // Reset history index after sending

    try {
      await sendMessage(msg);
    } catch (e: any) {
      toast.error(e?.message || "Failed to send message");
    }
  };

  const handleHistoryUp = () => {
    if (inputHistory.length === 0) return;
    
    const newIndex = historyIndex === -1 
      ? inputHistory.length - 1 
      : Math.max(historyIndex - 1, 0);
    
    const historyItem = getInputHistoryItem(newIndex);
    if (historyItem) {
      setHistoryIndex(newIndex);
      setInput(historyItem);
    }
  };

  const handleHistoryDown = () => {
    if (historyIndex === -1) return;
    
    const newIndex = historyIndex + 1;
    if (newIndex >= inputHistory.length) {
      setHistoryIndex(-1);
      setInput("");
    } else {
      const historyItem = getInputHistoryItem(newIndex);
      if (historyItem) {
        setHistoryIndex(newIndex);
        setInput(historyItem);
      }
    }
  };

  // Auto-focus input when switching bots or when active
  useEffect(() => {
    if (isActive && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isActive, botId]);

  const hasMessages = messages.length > 0;

  const handleNewConversation = async () => {
    try {
      await createNewConversation();
      setIsFirstTime(false); // Not first time if user manually creates conversation
    } catch (error) {
      toast.error("Failed to create new conversation");
    }
  };

  // Check if this is first time user (no conversations exist)
  useEffect(() => {
    if (conversations.length === 0 && !isLoading) {
      setIsFirstTime(true);
    } else if (conversations.length > 0) {
      setIsFirstTime(false);
    }
  }, [conversations.length, isLoading]);

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    // Focus the input field
    setTimeout(() => {
      const inputElement = document.querySelector('input[aria-label="Message input"]') as HTMLInputElement;
      inputElement?.focus();
      // Move cursor to end
      if (inputElement) {
        inputElement.setSelectionRange(prompt.length, prompt.length);
      }
    }, 0);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden relative">
      {/* Conversation Sidebar */}
      <ConversationSidebar
        botType={botId}
        conversations={conversations}
        activeConversationId={activeConversationId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onConversationSelect={switchConversation}
        onNewConversation={handleNewConversation}
        onPinConversation={pinConversation}
        onUnpinConversation={unpinConversation}
        onArchiveConversation={archiveConversation}
        onUnarchiveConversation={unarchiveConversation}
        onDeleteConversation={closeConversation}
        onRenameConversation={renameConversation}
      />

      {/* Slimmer Header */}
      <div className="px-3 sm:px-4 py-1.5 border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className={cn(
              "p-1 rounded-lg hover:bg-muted transition-colors shrink-0",
              sidebarOpen && "bg-muted"
            )}
            aria-label="Toggle conversations sidebar"
          >
            <DynamicIcon name="List" className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-semibold text-foreground tracking-tight truncate">{botName}</h2>
            <p className="text-[12px] text-muted-foreground truncate">{botSubtitle}</p>
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

      {/* Messages Area - No scrolling, fits on screen */}
      <div className={cn(
        "overflow-y-auto overflow-x-hidden px-3 sm:px-4 scroll-smooth custom-scrollbar",
        "flex-1 min-h-0",
        hasMessages ? "py-3 space-y-2" : ""
      )}>
        {isLoading ? (
          <div className="py-3 space-y-2" aria-label="Loading conversation...">
            <SkeletonLoader variant="message" align="left" count={2} />
            <SkeletonLoader variant="message" align="right" count={1} />
            <SkeletonLoader variant="message" align="left" count={1} />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            botType={botId}
            isFirstTime={isFirstTime}
            onQuickAction={handleQuickAction}
          />
        ) : (
          <>
            {messages.map((message, index) => {
              const isEditing = editingMessageId === message.id;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "group flex items-start gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {!isEditing ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-lg text-[14px] leading-relaxed",
                          "break-words overflow-wrap-anywhere relative",
                          message.role === "user"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted/80 border border-border/50 text-foreground"
                        )}
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {message.content || (message.streaming && (
                          <TypingIndicator />
                        ))}
                        {message.isEdited && (
                          <span className="text-[10px] text-muted-foreground/60 ml-1 italic">(edited)</span>
                        )}
                      </motion.div>
                      {!message.streaming && (
                        <MessageActions
                          message={message}
                          messageIndex={index}
                          onCopy={() => {}}
                          onRegenerate={message.role === 'assistant' ? () => regenerateMessage(message.id) : undefined}
                          onEdit={message.role === 'user' ? (newContent) => {
                            editMessage(message.id, newContent);
                            setEditingMessageId(null);
                          } : undefined}
                          onDelete={() => deleteMessage(message.id)}
                          position={message.role === "user" ? "right" : "left"}
                          isStreaming={message.streaming}
                          onEditStart={() => setEditingMessageId(message.id)}
                          onEditCancel={() => setEditingMessageId(null)}
                        />
                      )}
                    </>
                  ) : (
                    <MessageActions
                      message={message}
                      messageIndex={index}
                      onCopy={() => {}}
                      onEdit={(newContent) => {
                        editMessage(message.id, newContent);
                        setEditingMessageId(null);
                      }}
                      onDelete={() => deleteMessage(message.id)}
                      position={message.role === "user" ? "right" : "left"}
                      isStreaming={false}
                      onEditStart={() => setEditingMessageId(message.id)}
                      onEditCancel={() => setEditingMessageId(null)}
                    />
                  )}
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Enhanced */}
      <div className="px-3 sm:px-4 py-2 border-t border-border/50 bg-gradient-to-t from-background via-background to-muted/10 shrink-0">
        <ChatInput
          botType={botId}
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          disabled={isSending || isLoading}
          loading={isSending}
          showCharacterCount={true}
          showSuggestedPrompts={true}
          hasMessages={messages.length > 0}
          lastMessage={messages.length > 0 ? messages[messages.length - 1]?.content : undefined}
          inputRef={inputRef}
          onHistoryUp={handleHistoryUp}
          onHistoryDown={handleHistoryDown}
        />
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

