import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BotChatInterfaceHeader } from "./BotChatInterfaceHeader";
import { ChatTabsBar, type Conversation } from "./ChatTabsBar";
import { ConversationSidebar } from "./ConversationSidebar";
import { MessageList, type ChatMessage } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { BotType } from "@/lib/bots/types";
import { cn } from "@/lib/utils";

interface BotChatInterfaceProps {
  botType: BotType;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  loading?: boolean;
  onSendMessage: (message: string) => void;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onCloseConversation: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onMessageCopy?: (messageId: string) => void;
  onMessageRegenerate?: (messageId: string) => void;
  onMessageEdit?: (messageId: string, newContent: string) => void;
  onMessageDelete?: (messageId: string) => void;
}

const BOT_CONFIG: Record<BotType, { name: string; subtitle: string }> = {
  friend: {
    name: "Friend",
    subtitle: "Your supportive companion",
  },
  mentor: {
    name: "Mentor",
    subtitle: "Your strategic advisor",
  },
  ea: {
    name: "Executive Assistant",
    subtitle: "Your efficient assistant",
  },
};

export function BotChatInterface({
  botType,
  conversations,
  activeConversationId,
  messages,
  loading = false,
  onSendMessage,
  onConversationSelect,
  onNewConversation,
  onCloseConversation,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
  onRenameConversation,
  onMessageCopy,
  onMessageRegenerate,
  onMessageEdit,
  onMessageDelete,
}: BotChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const config = BOT_CONFIG[botType];
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const hasMessages = messages.length > 0;

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleSubmit = (message: string) => {
    onSendMessage(message);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              {config.name}
            </h2>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      {conversations.length > 0 && (
          <ChatTabsBar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onConversationSelect={onConversationSelect}
            onNewConversation={onNewConversation}
            onCloseConversation={onCloseConversation}
            onRenameConversation={onRenameConversation}
            botType={botType}
          />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Conversation Sidebar */}
        <ConversationSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          botType={botType}
          onConversationSelect={(id) => {
            onConversationSelect(id);
            setSidebarOpen(false);
          }}
          onPinConversation={onPinConversation}
          onArchiveConversation={onArchiveConversation}
          onDeleteConversation={onDeleteConversation}
          onRenameConversation={onRenameConversation}
        />

        {/* Chat Content */}
        <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", sidebarOpen && "lg:ml-[320px]")}>
          <div className="flex-1 min-h-0 overflow-hidden">
            <MessageList
              messages={messages}
              botType={botType}
              loading={loading}
              onPromptSelect={handlePromptSelect}
              onMessageCopy={onMessageCopy}
              onMessageRegenerate={onMessageRegenerate}
              onMessageEdit={onMessageEdit}
              onMessageDelete={onMessageDelete}
            />
          </div>

          {/* Fixed Input at Bottom */}
          <div className="flex-shrink-0 relative z-10 bg-background border-t border-border">
            <ChatInput
              botType={botType}
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate header component for cleaner structure
function BotChatInterfaceHeader({ botType }: { botType: BotType }) {
  const config = BOT_CONFIG[botType];
  return (
    <div className="px-5 py-4 border-b border-border">
      <h2 className="text-2xl font-semibold text-foreground tracking-tight">
        {config.name}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">{config.subtitle}</p>
    </div>
  );
}

export { BotChatInterfaceHeader };

