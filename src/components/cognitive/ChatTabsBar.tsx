import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export interface Conversation {
  id: string;
  botType: 'friend' | 'mentor' | 'ea';
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

interface ChatTabsBarProps {
  botType: 'friend' | 'mentor' | 'ea';
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSwitch: (conversationId: string) => void;
  onNewConversation: () => void;
  onCloseConversation: (conversationId: string) => void;
  onRenameConversation?: (conversationId: string, newTitle: string) => void;
}

export function ChatTabsBar({
  botType,
  conversations,
  activeConversationId,
  onConversationSwitch,
  onNewConversation,
  onCloseConversation,
  onRenameConversation,
}: ChatTabsBarProps) {
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const canClose = conversations.length > 1;

  const handleDoubleClick = (conversation: Conversation) => {
    if (onRenameConversation) {
      setEditingTabId(conversation.id);
      setEditValue(conversation.title);
    }
  };

  const handleRenameSubmit = (conversationId: string) => {
    if (onRenameConversation && editValue.trim()) {
      onRenameConversation(conversationId, editValue.trim());
    }
    setEditingTabId(null);
    setEditValue("");
  };

  const handleRenameCancel = () => {
    setEditingTabId(null);
    setEditValue("");
  };

  if (conversations.length === 0) {
    return (
      <div className="px-3 sm:px-4 py-2 border-b border-border/50 bg-background/50">
        <button
          onClick={onNewConversation}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span>
          <span>New Chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 py-2 border-b border-border/50 bg-background/50 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1.5 min-w-max">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId;
          const isHovered = hoveredTabId === conversation.id;
          const isEditing = editingTabId === conversation.id;
          const showClose = canClose && (isActive ? isHovered : true);

          return (
            <motion.div
              key={conversation.id}
              onMouseEnter={() => setHoveredTabId(conversation.id)}
              onMouseLeave={() => setHoveredTabId(null)}
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.98,
              }}
              transition={{ duration: 0.15 }}
            >
              <button
                onClick={() => !isEditing && onConversationSwitch(conversation.id)}
                onDoubleClick={() => handleDoubleClick(conversation)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200",
                  "max-w-[200px] min-w-[120px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isActive
                    ? "bg-background text-foreground font-semibold border-t border-l border-r border-border shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(conversation.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameSubmit(conversation.id);
                      } else if (e.key === "Escape") {
                        handleRenameCancel();
                      }
                    }}
                    className="flex-1 bg-transparent text-[13px] font-semibold outline-none border-b border-foreground/30"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="flex-1 text-[13px] truncate text-left">
                      {conversation.title}
                    </span>
                    {showClose && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseConversation(conversation.id);
                        }}
                        className="flex-shrink-0 w-4 h-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                        aria-label="Close conversation"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    )}
                  </>
                )}
              </button>
            </motion.div>
          );
        })}

        {/* New Chat Button */}
        <motion.button
          onClick={onNewConversation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg",
            "text-[13px] text-muted-foreground hover:text-foreground",
            "hover:bg-muted/30 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )}
          aria-label="New Chat"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">New Chat</span>
        </motion.button>
      </div>
    </div>
  );
}

