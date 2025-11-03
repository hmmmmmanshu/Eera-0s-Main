import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { KPIStrip } from "@/components/marketing/KPIStrip";
import { ActivityHeatmap } from "@/components/marketing/ActivityHeatmap";
import { MetricsCards } from "@/components/marketing/MetricsCards";
import { TopPostsCarousel } from "@/components/marketing/TopPostsCarousel";
import { TargetsProgress } from "@/components/marketing/TargetsProgress";
import { CreatePostModal } from "@/components/marketing/CreatePostModal";
import { PlatformToggle } from "@/components/marketing/PlatformToggle";
import { AIInsightCard } from "@/components/marketing/AIInsightCard";
import { DraftsSection } from "@/components/marketing/DraftsSection";
import { BrandIdentitySettings } from "@/components/settings/BrandIdentitySettings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, Plus, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Platform = "all" | "linkedin" | "instagram";

const MarketingHub = () => {
  const location = useLocation();
  const { logActivity } = useActivityLogger();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBrandSettingsOpen, setIsBrandSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>(() => {
    return (localStorage.getItem("marketingPlatform") as Platform) || "all";
  });

  useEffect(() => {
    localStorage.setItem("marketingPlatform", platform);
  }, [platform]);

  useEffect(() => {
    logActivity(location.pathname, "visit");
  }, [location.pathname, logActivity]);

  return (
    <div className="flex min-h-screen w-full">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <AppTopBar title="Marketing Hub" />
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Marketing Hub</h1>
                <p className="text-muted-foreground mt-1">
                  {platform === "all" && "Analytics-first view of your marketing performance"}
                  {platform === "linkedin" && "LinkedIn analytics and insights"}
                  {platform === "instagram" && "Instagram performance metrics"}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <PlatformToggle value={platform} onChange={setPlatform} />
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="gap-2"
                  onClick={() => setIsBrandSettingsOpen(true)}
                >
                  <Palette className="h-5 w-5" />
                  Brand
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-5 w-5" />
                  Create Post
                </Button>
                <Button size="lg" className="gap-2">
                  <Zap className="h-5 w-5" />
                  Run Next Action
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* AI Insight Card */}
                <AIInsightCard platform={platform} />

                {/* KPI Strip */}
                <KPIStrip platform={platform === "all" ? undefined : platform} />

                {/* Activity Heatmap */}
                <ActivityHeatmap />

                {/* Metrics Cards and Top Posts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <MetricsCards platform={platform === "all" ? undefined : platform} />
                  <TopPostsCarousel platform={platform === "all" ? undefined : platform} />
                </div>

                {/* Drafts Section */}
                <DraftsSection />

                {/* Targets Progress */}
                <TargetsProgress />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CreatePostModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Brand Identity Settings Dialog */}
      <Dialog open={isBrandSettingsOpen} onOpenChange={setIsBrandSettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Identity Settings
            </DialogTitle>
          </DialogHeader>
          <BrandIdentitySettings />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingHub;
