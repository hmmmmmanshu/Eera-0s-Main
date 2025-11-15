import { useState, useMemo } from "react";
import { Search, Pin, Archive, Trash2, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { BotType } from "@/lib/bots/types";
import { Conversation } from "./ChatTabsBar";

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  botType: BotType;
  onConversationSelect: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
}

type FilterType = "all" | "recent" | "pinned" | "archived";

export function ConversationSidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  botType,
  onConversationSelect,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filter) {
      case "pinned":
        filtered = filtered.filter((conv) => conv.isPinned);
        break;
      case "archived":
        filtered = filtered.filter((conv) => conv.isArchived);
        break;
      case "recent":
        filtered = filtered
          .filter((conv) => !conv.isArchived)
          .sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bTime - aTime;
          })
          .slice(0, 10);
        break;
      default:
        filtered = filtered.filter((conv) => !conv.isArchived);
    }

    // Sort: pinned first, then by last message time
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [conversations, searchQuery, filter]);

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const handleRenameSubmit = (id: string) => {
    if (editValue.trim() && onRenameConversation) {
      onRenameConversation(id, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[320px] lg:w-[320px] bg-background border-r border-border z-50",
          "flex flex-col shadow-lg",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto scrollbar-hide">
          {(["all", "recent", "pinned", "archived"] as FilterType[]).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className={cn(
                "text-xs capitalize",
                filter === filterType
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filterType}
            </Button>
          ))}
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                      isActive ? "bg-muted" : "hover:bg-muted/50"
                    )}
                    onClick={() => onConversationSelect(conversation.id)}
                  >
                    {editingId === conversation.id ? (
                      <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameSubmit(conversation.id);
                            } else if (e.key === "Escape") {
                              handleRenameCancel();
                            }
                          }}
                          onBlur={() => handleRenameSubmit(conversation.id)}
                          autoFocus
                          className="h-8 text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {conversation.isPinned && (
                              <Pin className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            <p
                              className={cn(
                                "text-sm truncate",
                                isActive ? "font-semibold text-foreground" : "text-foreground"
                              )}
                            >
                              {conversation.title || "New Chat"}
                            </p>
                          </div>
                          {conversation.lastMessageAt && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                            </p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onRenameConversation && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(conversation.id, conversation.title);
                                }}
                              >
                                Rename
                              </DropdownMenuItem>
                            )}
                            {onPinConversation && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPinConversation(conversation.id);
                                }}
                              >
                                <Pin className="mr-2 h-4 w-4" />
                                {conversation.isPinned ? "Unpin" : "Pin"}
                              </DropdownMenuItem>
                            )}
                            {onArchiveConversation && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchiveConversation(conversation.id);
                                }}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                {conversation.isArchived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                            )}
                            {onDeleteConversation && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation?.(conversation.id);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

