import { useState, useEffect } from "react";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { BotNavigationBar } from "@/components/cognitive/BotNavigationBar";
import { BotChatContainer, BotCard } from "@/components/cognitive/BotChatContainer";
import { BotChatInterface } from "@/components/cognitive/BotChatInterface";
import { useBotChat } from "@/hooks/useBotChat";
import type { BotType } from "@/lib/bots/types";
import { cn } from "@/lib/utils";

const CognitiveHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeBot, setActiveBot] = useState<BotType>("mentor");
  const [showNavigationBar, setShowNavigationBar] = useState(true);

  // Initialize hooks for each bot
  const friendChat = useBotChat({
    botType: "friend",
    onError: (error) => console.error("Friend bot error:", error),
  });

  const mentorChat = useBotChat({
    botType: "mentor",
    onError: (error) => console.error("Mentor bot error:", error),
  });

  const eaChat = useBotChat({
    botType: "ea",
    onError: (error) => console.error("EA bot error:", error),
  });

  // Get the active bot's chat state
  const getActiveChat = () => {
    switch (activeBot) {
      case "friend":
        return friendChat;
      case "mentor":
        return mentorChat;
      case "ea":
        return eaChat;
    }
  };

  const activeChat = getActiveChat();

  // Hide navigation bar after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavigationBar(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Show navigation bar when bot changes
  useEffect(() => {
    setShowNavigationBar(true);
    const timer = setTimeout(() => {
      setShowNavigationBar(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeBot]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with input fields
      }

      if (e.key === "ArrowLeft" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const bots: BotType[] = ["friend", "mentor", "ea"];
        const currentIndex = bots.indexOf(activeBot);
        if (currentIndex > 0) {
          setActiveBot(bots[currentIndex - 1]);
        }
      } else if (e.key === "ArrowRight" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const bots: BotType[] = ["friend", "mentor", "ea"];
        const currentIndex = bots.indexOf(activeBot);
        if (currentIndex < bots.length - 1) {
          setActiveBot(bots[currentIndex + 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBot]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navigation Bar - Hidden after 5 seconds */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out overflow-hidden",
            showNavigationBar ? "max-h-32 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <BotNavigationBar activeBot={activeBot} onBotChange={setActiveBot} />
        </div>

        {/* Show Navigation Button - Appears when navigation is hidden */}
        {!showNavigationBar && (
          <button
            onClick={() => {
              setShowNavigationBar(true);
              // Hide again after 5 seconds
              setTimeout(() => setShowNavigationBar(false), 5000);
            }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-background border border-border rounded-lg shadow-sm hover:bg-muted transition-colors text-sm font-medium"
            aria-label="Show bot navigation"
          >
            Switch Bot
          </button>
        )}

        {/* Chat Container - Full height when navigation is hidden */}
        <BotChatContainer
          activeBot={activeBot}
          onScrollChange={setActiveBot}
          fullHeight={!showNavigationBar}
        >
          {/* Friend Bot */}
          <BotCard botType="friend" isActive={activeBot === "friend"}>
            <BotChatInterface
              botType="friend"
              conversations={friendChat.conversations}
              activeConversationId={friendChat.activeConversationId}
              messages={friendChat.messages}
              loading={friendChat.loading}
              onSendMessage={friendChat.sendMessage}
              onConversationSelect={friendChat.setActiveConversation}
              onNewConversation={friendChat.createNewConversation}
              onCloseConversation={friendChat.closeConversation}
              onPinConversation={friendChat.pinConversation}
              onArchiveConversation={friendChat.archiveConversation}
              onDeleteConversation={friendChat.deleteConversation}
              onRenameConversation={friendChat.renameConversation}
              onMessageCopy={friendChat.copyMessage}
              onMessageRegenerate={friendChat.regenerateMessage}
              onMessageEdit={friendChat.editMessage}
              onMessageDelete={friendChat.deleteMessage}
            />
          </BotCard>

          {/* Mentor Bot */}
          <BotCard botType="mentor" isActive={activeBot === "mentor"}>
            <BotChatInterface
              botType="mentor"
              conversations={mentorChat.conversations}
              activeConversationId={mentorChat.activeConversationId}
              messages={mentorChat.messages}
              loading={mentorChat.loading}
              onSendMessage={mentorChat.sendMessage}
              onConversationSelect={mentorChat.setActiveConversation}
              onNewConversation={mentorChat.createNewConversation}
              onCloseConversation={mentorChat.closeConversation}
              onPinConversation={mentorChat.pinConversation}
              onArchiveConversation={mentorChat.archiveConversation}
              onDeleteConversation={mentorChat.deleteConversation}
              onRenameConversation={mentorChat.renameConversation}
              onMessageCopy={mentorChat.copyMessage}
              onMessageRegenerate={mentorChat.regenerateMessage}
              onMessageEdit={mentorChat.editMessage}
              onMessageDelete={mentorChat.deleteMessage}
            />
          </BotCard>

          {/* EA Bot */}
          <BotCard botType="ea" isActive={activeBot === "ea"}>
            <BotChatInterface
              botType="ea"
              conversations={eaChat.conversations}
              activeConversationId={eaChat.activeConversationId}
              messages={eaChat.messages}
              loading={eaChat.loading}
              onSendMessage={eaChat.sendMessage}
              onConversationSelect={eaChat.setActiveConversation}
              onNewConversation={eaChat.createNewConversation}
              onCloseConversation={eaChat.closeConversation}
              onPinConversation={eaChat.pinConversation}
              onArchiveConversation={eaChat.archiveConversation}
              onDeleteConversation={eaChat.deleteConversation}
              onRenameConversation={eaChat.renameConversation}
              onMessageCopy={eaChat.copyMessage}
              onMessageRegenerate={eaChat.regenerateMessage}
              onMessageEdit={eaChat.editMessage}
              onMessageDelete={eaChat.deleteMessage}
            />
          </BotCard>
        </BotChatContainer>
      </div>
    </div>
  );
};

export default CognitiveHub;
