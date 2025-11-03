import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppTopBar } from "@/components/AppTopBar";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HROverview } from "@/components/hr/HROverview";
import { HiringScreening } from "@/components/hr/HiringScreening";
import { Workforce } from "@/components/hr/Workforce";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { supabase } from "@/integrations/supabase/client";

const HRHub = () => {
  const location = useLocation();
  const { logActivity } = useActivityLogger();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    logActivity(location.pathname, "visit");
  }, [location.pathname, logActivity]);

  // Auto-sync employee count to Finance on HR changes
  useEffect(() => {
    let channels: ReturnType<typeof supabase.channel>[] = [];

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const handleChange = async () => {
        try {
          // Dynamic import to avoid any potential circular dependencies at module init time
          const { syncEmployeeCount, regenerateTasksAfterEmployeeSync } = await import("@/lib/virtualCFO");
          await syncEmployeeCount(user.id);
          await regenerateTasksAfterEmployeeSync(user.id);
        } catch (err) {
          console.error("Auto employee sync failed:", err);
        }
      };

      channels = [
        supabase
          .channel("hr-employees-auto-sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "hr_employees", filter: `user_id=eq.${user.id}` },
            handleChange
          )
          .subscribe(),
        // Also react to candidates moved to hired (some flows add hired candidates before employees)
        supabase
          .channel("hr-candidates-auto-sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "hr_candidates", filter: `user_id=eq.${user.id}` },
            handleChange
          )
          .subscribe(),
      ];
    };

    setup();

    return () => {
      channels.forEach((ch) => ch.unsubscribe());
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppTopBar title="HR Hub" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Human Resources Hub
              </h1>
              <p className="text-muted-foreground">
                Your virtual HR department: from hiring to performance tracking
              </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                <TabsTrigger value="overview">Dashboard</TabsTrigger>
                <TabsTrigger value="hiring">Hiring & Screening</TabsTrigger>
                <TabsTrigger value="workforce">Workforce</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <HROverview />
              </TabsContent>

              <TabsContent value="hiring" className="space-y-6">
                <HiringScreening />
              </TabsContent>

              <TabsContent value="workforce" className="space-y-6">
                <Workforce />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRHub;
