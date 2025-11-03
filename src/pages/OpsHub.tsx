import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid } from "lucide-react";
import { KanbanBoard } from "@/components/ops/KanbanBoard";
import { TodoList } from "@/components/ops/TodoList";
import { SOPLibrary } from "@/components/ops/SOPLibrary";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogger } from "@/hooks/useActivityLogger";

const OpsHub = () => {
  const location = useLocation();
  const { logActivity } = useActivityLogger();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    logActivity(location.pathname, "visit");
  }, [location.pathname, logActivity]);

  return (
    <div className="flex min-h-screen w-full">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <AppTopBar title="Ops Hub" />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-accent/5 to-background">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                <LayoutGrid className="h-10 w-10 text-accent" />
                Ops Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your operations: Kanban, To-Do lists, and SOPs
              </p>
            </div>

            {/* Main Content - Only 3 Tabs */}
            <Tabs defaultValue="kanban" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
                <TabsTrigger value="todos">To-Do List</TabsTrigger>
                <TabsTrigger value="sops">SOP Library</TabsTrigger>
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
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OpsHub;