import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  botType: BotType;
}

export function ChatTabsBar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onCloseConversation,
  botType,
}: ChatTabsBarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const canClose = conversations.length > 1;

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-background overflow-x-auto scrollbar-hide">
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
              "flex items-center gap-1 px-4 py-2 rounded-t-lg transition-all duration-200",
              "border-b-2 border-transparent",
              "group relative",
              isActive
                ? "bg-background border-b-2 border-border text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
            onMouseEnter={() => setHoveredTab(conversation.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <button
              onClick={() => onConversationSelect(conversation.id)}
              className={cn(
                "text-sm truncate max-w-[200px] text-left",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded"
              )}
            >
              {conversation.title || "New Chat"}
            </button>

            {canClose && (isActive || isHovered) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseConversation(conversation.id);
                }}
                className={cn(
                  "ml-1 p-0.5 rounded hover:bg-muted transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                )}
                aria-label="Close conversation"
              >
                <X className="h-3.5 w-3.5" />
              </button>
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
          "ml-auto shrink-0 h-8 px-3",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "transition-all duration-200"
        )}
        aria-label="New conversation"
      >
        <Plus className="h-4 w-4 mr-1" />
        <span className="text-sm">New Chat</span>
      </Button>
    </div>
  );
}

