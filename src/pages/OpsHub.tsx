import { useState } from "react";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, User, Bot, LayoutGrid } from "lucide-react";
import { KanbanBoard } from "@/components/ops/KanbanBoard";
import { TodoList } from "@/components/ops/TodoList";
import { SOPLibrary } from "@/components/ops/SOPLibrary";
import { WorkflowBuilder } from "@/components/ops/WorkflowBuilder";
import { ExperimentTracker } from "@/components/ops/ExperimentTracker";
import { AgenticFeed } from "@/components/ops/AgenticFeed";
import { AITeamPanel } from "@/components/ops/AITeamPanel";
import { WorkflowGraph } from "@/components/ops/WorkflowGraph";
import { OptimizationInsights } from "@/components/ops/OptimizationInsights";
import { OpsAnalytics } from "@/components/ops/OpsAnalytics";

type ViewMode = "manual" | "ai" | "hybrid";

const OpsHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("hybrid");

  return (
    <div className="flex min-h-screen w-full">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <AppTopBar title="Ops Hub" />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-accent/5 to-background">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                  <LayoutGrid className="h-10 w-10 text-accent" />
                  Ops Hub
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your operations team in one screen
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2"
                >
                  <Zap className="h-5 w-5" />
                  Run Workflow
                </Button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg w-fit mx-auto">
              <Button
                variant={viewMode === "manual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("manual")}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Manual Mode
              </Button>
              <Button
                variant={viewMode === "hybrid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("hybrid")}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Hybrid View
              </Button>
              <Button
                variant={viewMode === "ai" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("ai")}
                className="gap-2"
              >
                <Bot className="h-4 w-4" />
                AI Mode
              </Button>
            </div>

            {/* Main Content Area */}
            <div className={`grid gap-6 ${viewMode === "hybrid" ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
              {/* Manual Ops Panel */}
              {(viewMode === "manual" || viewMode === "hybrid") && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-accent/20">
                    <User className="h-5 w-5 text-accent" />
                    <h2 className="text-2xl font-bold">Manual Operations</h2>
                  </div>

                  <Tabs defaultValue="kanban" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="kanban">Kanban</TabsTrigger>
                      <TabsTrigger value="todos">To-Do</TabsTrigger>
                      <TabsTrigger value="sops">SOPs</TabsTrigger>
                      <TabsTrigger value="workflows">Workflows</TabsTrigger>
                      <TabsTrigger value="experiments">Experiments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="kanban" className="mt-6">
                      <KanbanBoard />
                    </TabsContent>

                    <TabsContent value="todos" className="mt-6">
                      <TodoList />
                    </TabsContent>

                    <TabsContent value="sops" className="mt-6">
                      <SOPLibrary />
                    </TabsContent>

                    <TabsContent value="workflows" className="mt-6">
                      <WorkflowBuilder />
                    </TabsContent>

                    <TabsContent value="experiments" className="mt-6">
                      <ExperimentTracker />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Agentic Ops Panel */}
              {(viewMode === "ai" || viewMode === "hybrid") && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-accent/20">
                    <Bot className="h-5 w-5 text-accent" />
                    <h2 className="text-2xl font-bold">Agentic Operations</h2>
                    <div className="ml-auto">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <AgenticFeed />
                    <AITeamPanel />
                    <WorkflowGraph />
                    <OptimizationInsights />
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Section */}
            <OpsAnalytics />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OpsHub;
