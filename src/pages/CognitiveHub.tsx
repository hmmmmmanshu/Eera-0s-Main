import { useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { CognitiveTopBar } from "@/components/cognitive/CognitiveTopBar";
import { CognitiveChatPanel } from "@/components/cognitive/CognitiveChatPanel";
import { PlansPreview } from "@/components/cognitive/PlansPreview";
import { PlansAll } from "@/components/cognitive/PlansAll";
import { JournalPanel } from "@/components/cognitive/JournalPanel";
import { IdeasPanel } from "@/components/cognitive/IdeasPanel";

const CognitiveHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastPlan, setLastPlan] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppTopBar title="Cognitive Hub" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="space-y-6">
              <CognitiveTopBar />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                  <CognitiveChatPanel onPlanCreated={(id) => setLastPlan(id || null)} />
                  {view === 'plans' ? <PlansAll /> : <PlansPreview />}
                  <JournalPanel />
              </div>
              <div className="space-y-6">
                <IdeasPanel />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CognitiveHub;
