import { useState, useEffect, useRef } from "react";
import { X, Search, Pin, PinOff, Archive, ArchiveRestore, Trash2, MoreVertical, Clock } from "./icons";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "./SkeletonLoader";
import type { Conversation } from "./ChatTabsBar";

type FilterType = 'all' | 'recent' | 'pinned' | 'archived';

interface ConversationSidebarProps {
  botType: 'friend' | 'mentor' | 'ea';
  conversations: Conversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onPinConversation: (conversationId: string) => void;
  onUnpinConversation: (conversationId: string) => void;
  onArchiveConversation: (conversationId: string) => void;
  onUnarchiveConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  isLoading?: boolean;
}

export function ConversationSidebar({
  botType,
  conversations,
  activeConversationId,
  isOpen,
  onClose,
  onConversationSelect,
  onNewConversation,
  onPinConversation,
  onUnpinConversation,
  onArchiveConversation,
  onUnarchiveConversation,
  onDeleteConversation,
  onRenameConversation,
  isLoading = false,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Filter by archived status
    if (activeFilter === 'archived' && !conv.isArchived) return false;
    if (activeFilter !== 'archived' && conv.isArchived) return false;

    // Filter by pinned
    if (activeFilter === 'pinned' && !conv.isPinned) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        conv.title.toLowerCase().includes(query) ||
        conv.lastMessagePreview?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort conversations: pinned first, then by lastMessageAt
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
  });

  // Filter counts
  const filterCounts = {
    all: conversations.filter(c => !c.isArchived).length,
    recent: conversations.filter(c => !c.isArchived && !c.isPinned).length,
    pinned: conversations.filter(c => c.isPinned && !c.isArchived).length,
    archived: conversations.filter(c => c.isArchived).length,
  };

  const handleRename = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setEditingId(conversationId);
      setEditValue(conv.title);
    }
  };

  const handleRenameSubmit = (conversationId: string) => {
    if (editValue.trim()) {
      onRenameConversation(conversationId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed left-0 top-0 bottom-0 z-50",
              "w-[280px] sm:w-[320px]",
              "bg-background border-r border-border",
              "shadow-xl",
              "flex flex-col",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-border/50 shrink-0">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {(['all', 'recent', 'pinned', 'archived'] as FilterType[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      activeFilter === filter
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filterCounts[filter] > 0 && (
                      <span className={cn(
                        "ml-1.5 px-1.5 py-0.5 rounded text-[11px]",
                        activeFilter === filter
                          ? "bg-background/20 text-background"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {filterCounts[filter]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="py-2 px-2 space-y-2" aria-label="Loading conversations...">
                  <SkeletonLoader variant="conversation" count={5} />
                </div>
              ) : sortedConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                  <div className="text-muted-foreground">
                    {searchQuery ? (
                      <>
                        <p className="text-sm font-medium mb-1">No matches</p>
                        <p className="text-xs">Try a different search term</p>
                      </>
                    ) : activeFilter === 'archived' ? (
                      <>
                        <p className="text-sm font-medium mb-1">No archived conversations</p>
                        <p className="text-xs">Archived conversations will appear here</p>
                      </>
                    ) : activeFilter === 'pinned' ? (
                      <>
                        <p className="text-sm font-medium mb-1">No pinned conversations</p>
                        <p className="text-xs">Pin important conversations to find them quickly</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium mb-1">No conversations yet</p>
                        <p className="text-xs mb-4">Start a new chat to begin</p>
                        <Button
                          onClick={onNewConversation}
                          size="sm"
                          className="text-xs"
                        >
                          New Chat
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {sortedConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversationId;
                    const isHovered = hoveredConversationId === conversation.id;
                    const isMenuOpen = openMenuId === conversation.id;
                    const isEditing = editingId === conversation.id;

                    return (
                      <motion.div
                        key={conversation.id}
                        onMouseEnter={() => setHoveredConversationId(conversation.id)}
                        onMouseLeave={() => setHoveredConversationId(null)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={cn(
                            "relative px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors",
                            "group",
                            isActive
                              ? "bg-muted/50 border border-border/50"
                              : "hover:bg-muted/30"
                          )}
                          onClick={() => {
                            if (!isEditing && !isMenuOpen) {
                              onConversationSelect(conversation.id);
                              onClose();
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {conversation.isPinned && (
                              <Pin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
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
                                  className="w-full bg-transparent text-sm font-medium outline-none border-b border-foreground/30"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <p className={cn(
                                      "text-sm font-medium truncate",
                                      isActive ? "text-foreground" : "text-foreground/90"
                                    )}>
                                      {conversation.title}
                                    </p>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className="text-[11px] text-muted-foreground">
                                        {formatTime(conversation.lastMessageAt)}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(isMenuOpen ? null : conversation.id);
                                        }}
                                        className={cn(
                                          "p-1 rounded hover:bg-muted transition-opacity",
                                          isMenuOpen || isHovered ? "opacity-100" : "opacity-0"
                                        )}
                                      >
                                        <MoreVertical className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  {conversation.lastMessagePreview && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {conversation.lastMessagePreview}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions Menu */}
                          {isMenuOpen && (
                            <motion.div
                              ref={menuRef}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute right-2 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[180px] py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {conversation.isPinned ? (
                                <button
                                  onClick={() => {
                                    onUnpinConversation(conversation.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                >
                                  <PinOff className="w-4 h-4" />
                                  Unpin
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    onPinConversation(conversation.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                >
                                  <Pin className="w-4 h-4" />
                                  Pin
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleRename(conversation.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                              >
                                <Clock className="w-4 h-4" />
                                Rename
                              </button>
                              {conversation.isArchived ? (
                                <button
                                  onClick={() => {
                                    onUnarchiveConversation(conversation.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                >
                                  <ArchiveRestore className="w-4 h-4" />
                                  Unarchive
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    onArchiveConversation(conversation.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                >
                                  <Archive className="w-4 h-4" />
                                  Archive
                                </button>
                              )}
                              <div className="border-t border-border my-1" />
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this conversation?")) {
                                    onDeleteConversation(conversation.id);
                                    setOpenMenuId(null);
                                  }
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer - New Chat Button */}
            <div className="px-4 py-3 border-t border-border/50 shrink-0">
              <Button
                onClick={() => {
                  onNewConversation();
                  onClose();
                }}
                className="w-full"
                size="sm"
              >
                + New Chat
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

