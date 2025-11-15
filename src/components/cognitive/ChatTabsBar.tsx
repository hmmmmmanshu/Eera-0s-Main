import { useState } from "react";
import { X, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BotType } from "@/lib/bots/types";

export interface Conversation {
  id: string;
  title: string;
  lastMessageAt?: Date | string;
  isPinned?: boolean;
  isArchived?: boolean;
}

interface ChatTabsBarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onCloseConversation: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  botType: BotType;
}

export function ChatTabsBar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onCloseConversation,
  onRenameConversation,
  botType,
}: ChatTabsBarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const canClose = conversations.length > 1;

  return (
    <div className="flex items-center gap-1 px-4 py-1 border-b border-border bg-background overflow-x-auto scrollbar-hide">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const isHovered = hoveredTab === conversation.id;

        return (
          <div
            key={conversation.id}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-t-lg transition-all duration-200",
              "border-b-2 border-transparent",
              "group relative",
              isActive
                ? "bg-background border-b-2 border-border text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
            onMouseEnter={() => setHoveredTab(conversation.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            {editingId === conversation.id ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  if (editValue.trim() && editValue !== conversation.title && onRenameConversation) {
                    onRenameConversation(conversation.id, editValue.trim());
                  }
                  setEditingId(null);
                  setEditValue("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (editValue.trim() && editValue !== conversation.title && onRenameConversation) {
                      onRenameConversation(conversation.id, editValue.trim());
                    }
                    setEditingId(null);
                    setEditValue("");
                  } else if (e.key === "Escape") {
                    setEditingId(null);
                    setEditValue("");
                  }
                }}
                className="h-6 text-sm px-2 py-1 max-w-[200px]"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
            <button
              onClick={() => onConversationSelect(conversation.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onRenameConversation) {
                  setEditingId(conversation.id);
                  setEditValue(conversation.title || "New Chat");
                }
              }}
              className={cn(
                "text-xs truncate max-w-[200px] text-left",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded"
              )}
            >
                {conversation.title || "New Chat"}
              </button>
            )}

            {canClose && (isActive || isHovered) && !editingId && (
              <div className="flex items-center gap-0.5 ml-1">
                {onRenameConversation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(conversation.id);
                      setEditValue(conversation.title || "New Chat");
                    }}
                    className={cn(
                      "p-0.5 rounded hover:bg-muted transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    )}
                    aria-label="Rename conversation"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseConversation(conversation.id);
                  }}
                  className={cn(
                    "p-0.5 rounded hover:bg-muted transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  )}
                  aria-label="Close conversation"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* New Chat Button */}
      <Button
        onClick={onNewConversation}
        variant="ghost"
        size="sm"
        className={cn(
          "ml-auto shrink-0 h-7 px-2",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "transition-all duration-200"
        )}
        aria-label="New conversation"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        <span className="text-xs">New Chat</span>
      </Button>
    </div>
  );
}

