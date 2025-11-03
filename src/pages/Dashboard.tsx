import { useState } from "react";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import DashboardHero from "@/components/dashboard/DashboardHero";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import UpcomingCalendar from "@/components/dashboard/UpcomingCalendar";
import HubsGrid from "@/components/dashboard/HubsGrid";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { FinanceWidget } from "@/components/dashboard/FinanceWidget";
import { IncompleteProfileBanner } from "@/components/IncompleteProfileBanner";
import { DataPromptBanner } from "@/components/dashboard/DataPromptBanner";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <AppTopBar title="Dashboard" />
        <main className="flex-1 bg-gradient-to-br from-background via-secondary/10 to-background">
          <DashboardHero />
          <div className="space-y-8 pb-12">
            <div className="container mx-auto px-6">
              <IncompleteProfileBanner />
              <DataPromptBanner />
              <div className="grid lg:grid-cols-3 gap-6">
                <ActivityHeatmap />
                <UpcomingCalendar />
                <FinanceWidget />
              </div>
            </div>
            <HubsGrid />
            <ActivityFeed />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
