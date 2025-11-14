import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppTopBar } from "@/components/AppTopBar";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { BotNavigationBar } from "@/components/cognitive/BotNavigationBar";
import { BotChatContainer } from "@/components/cognitive/BotChatContainer";
import { useAuth } from "@/contexts/AuthContext";

const CognitiveHub = () => {
  const location = useLocation();
  const { logActivity } = useActivityLogger();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeBot, setActiveBot] = useState<'friend' | 'mentor' | 'ea'>('friend');

  useEffect(() => {
    logActivity(location.pathname, "visit");
  }, [location.pathname, logActivity]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppTopBar title="Cognitive Hub" />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="shrink-0 pt-4 pb-3">
              <BotNavigationBar activeBot={activeBot} onBotChange={setActiveBot} />
            </div>
            <div className="flex-1 min-h-0">
              <BotChatContainer activeBot={activeBot} onBotChange={setActiveBot} userId={user?.id} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CognitiveHub;
