import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppTopBar } from "@/components/AppTopBar";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { BotNavigationBar } from "@/components/cognitive/BotNavigationBar";

const CognitiveHub = () => {
  const location = useLocation();
  const { logActivity } = useActivityLogger();
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
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <BotNavigationBar activeBot={activeBot} onBotChange={setActiveBot} />
            {/* Bot chat interfaces will go here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CognitiveHub;
