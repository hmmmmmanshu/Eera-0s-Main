import { useState } from "react";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesKPIDashboard } from "@/components/sales/SalesKPIDashboard";
import { PipelineBoard } from "@/components/sales/PipelineBoard";
import { ChannelPerformance } from "@/components/sales/ChannelPerformance";
import { AIInsightsPanel } from "@/components/sales/AIInsightsPanel";
import { SalesReportsTabs } from "@/components/sales/SalesReportsTabs";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { motion } from "framer-motion";

type TimeRange = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
type BusinessMode = "all" | "b2b" | "b2c" | "b2b2b";

const SalesHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [businessMode, setBusinessMode] = useState<BusinessMode>("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex min-h-screen w-full">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <AppTopBar title="Sales Hub" />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-6 space-y-6"
          >
            {/* Header Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Sales Hub</h1>
                  <p className="text-muted-foreground mt-1">AI-powered growth and revenue system</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search deals, leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Lead
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Time Range:</span>
                  <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                    <TabsList>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                      <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Business Mode:</span>
                  <Tabs value={businessMode} onValueChange={(v) => setBusinessMode(v as BusinessMode)}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="b2b">B2B</TabsTrigger>
                      <TabsTrigger value="b2c">B2C</TabsTrigger>
                      <TabsTrigger value="b2b2b">B2B2B</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* KPI Dashboard */}
            <SalesKPIDashboard timeRange={timeRange} />

            {/* Main Grid Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pipeline + Channel Performance */}
              <div className="lg:col-span-2 space-y-6">
                <PipelineBoard />
                <ChannelPerformance />
              </div>

              {/* AI Insights Panel */}
              <div className="lg:col-span-1">
                <AIInsightsPanel />
              </div>
            </div>

            {/* Reports & Summaries */}
            <SalesReportsTabs />
          </motion.div>
        </main>

        {/* Footer Status Bar */}
        <SalesFooter />
      </div>
    </div>
  );
};

export default SalesHub;
