import { useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { MoodTracker } from "@/components/cognitive/MoodTracker";
import { ReflectionStream } from "@/components/cognitive/ReflectionStream";
import { CalendarPanel } from "@/components/cognitive/CalendarPanel";
import { IdeasPanel } from "@/components/cognitive/IdeasPanel";
import { CognitiveChat } from "@/components/cognitive/CognitiveChat";
import { WeeklyOverview } from "@/components/cognitive/WeeklyOverview";

const CognitiveHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatMode, setChatMode] = useState<"friend" | "guide" | "mentor" | "ea">("friend");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppTopBar title="Cognitive Hub" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Your Mindspace
              </h1>
              <p className="text-muted-foreground">
                Your AI co-founder: tracking emotions, insights, and strategic growth
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <MoodTracker />
                <WeeklyOverview />
                <ReflectionStream />
              </div>

              {/* Right Column - Panels */}
              <div className="space-y-6">
                <CognitiveChat mode={chatMode} onModeChange={setChatMode} />
                <CalendarPanel />
                <IdeasPanel />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CognitiveHub;
