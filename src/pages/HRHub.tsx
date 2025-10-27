import { useState } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HROverview } from "@/components/hr/HROverview";
import { HiringScreening } from "@/components/hr/HiringScreening";
import { TeamPayroll } from "@/components/hr/TeamPayroll";
import { PerformanceAppraisals } from "@/components/hr/PerformanceAppraisals";
import { ContractsDocuments } from "@/components/hr/ContractsDocuments";
import { HRAIAssistant } from "@/components/hr/HRAIAssistant";

const HRHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
              <TabsList className="grid w-full grid-cols-6 lg:w-auto">
                <TabsTrigger value="overview">Dashboard</TabsTrigger>
                <TabsTrigger value="hiring">Hiring & Screening</TabsTrigger>
                <TabsTrigger value="team">Team & Payroll</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="ai">HR AI</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <HROverview />
              </TabsContent>

              <TabsContent value="hiring" className="space-y-6">
                <HiringScreening />
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <TeamPayroll />
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <PerformanceAppraisals />
              </TabsContent>

              <TabsContent value="contracts" className="space-y-6">
                <ContractsDocuments />
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <HRAIAssistant />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRHub;
