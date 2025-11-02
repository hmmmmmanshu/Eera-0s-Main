import { useState } from "react";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Upload, FileText, Clock } from "lucide-react";
import { LegalOverview } from "@/components/legal/LegalOverview";
import { ContractsManager } from "@/components/legal/ContractsManager";
import { ComplianceTracker } from "@/components/legal/ComplianceTracker";
import { PoliciesManager } from "@/components/legal/PoliciesManager";
import { UserCases } from "@/components/legal/UserCases";
import { LegalAIAssistant } from "@/components/legal/LegalAIAssistant";
import { motion } from "framer-motion";

const LegalHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen w-full">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col relative">
        <AppTopBar title="Legal Hub" />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/5 via-background to-background relative">
          <div className="container mx-auto p-6 space-y-6 blur-sm pointer-events-none select-none">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-foreground">
                  <Scale className="h-10 w-10 text-accent" />
                  Legal Hub
                </h1>
                <p className="text-muted-foreground mt-1">
                  Virtual Legal & Compliance Department
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 border-accent/30 hover:border-accent"
                >
                  <Upload className="h-5 w-5" />
                  Upload Contract
                </Button>
                <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <FileText className="h-5 w-5" />
                  Generate Policy
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-muted border border-border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="compliances">Compliances</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="cases">User Cases</TabsTrigger>
                <TabsTrigger value="ai-assistant">Legal AI</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <LegalOverview />
              </TabsContent>

              <TabsContent value="contracts" className="mt-6">
                <ContractsManager />
              </TabsContent>

              <TabsContent value="compliances" className="mt-6">
                <ComplianceTracker />
              </TabsContent>

              <TabsContent value="policies" className="mt-6">
                <PoliciesManager />
              </TabsContent>

              <TabsContent value="cases" className="mt-6">
                <UserCases />
              </TabsContent>

              <TabsContent value="ai-assistant" className="mt-6">
                <LegalAIAssistant />
              </TabsContent>
            </Tabs>
          </div>

          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-background/95 backdrop-blur-md border border-border rounded-2xl p-12 shadow-2xl max-w-md mx-4 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10 mb-2">
                  <Clock className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Coming Soon</h2>
                <p className="text-muted-foreground text-lg mt-2">
                  Legal Hub is currently under development. We're building something amazing for you!
                </p>
                <div className="mt-6 w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Development in progress...</p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LegalHub;
