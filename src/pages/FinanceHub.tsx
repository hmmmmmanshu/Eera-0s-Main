import { useState, useEffect } from "react";
import { DynamicAppSidebar } from "@/components/DynamicAppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { RunwayCard } from "@/components/finance/RunwayCard";
import { FundingPipeline } from "@/components/finance/FundingPipeline";
import { CapTable } from "@/components/finance/CapTable";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { FinancialMetricsGrid } from "@/components/finance/FinancialMetricsGrid";
import { InvoiceTracker } from "@/components/finance/InvoiceTracker";
import { PayrollOverview } from "@/components/finance/PayrollOverview";
import { ExpenseTracking } from "@/components/finance/ExpenseTracking";
import { VirtualCFOInsights } from "@/components/finance/VirtualCFOInsights";
import { RoleToggle } from "@/components/finance/RoleToggle";
import { AICFOInsightBox } from "@/components/finance/AICFOInsightBox";
import { InvoiceGenerator } from "@/components/finance/InvoiceGenerator";
import { PayrollDashboard } from "@/components/finance/PayrollDashboard";
import { ComplianceManager } from "@/components/finance/ComplianceManager";
import { PitchDeckAnalyzer } from "@/components/finance/PitchDeckAnalyzer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign,
  FileText,
  Users,
  Shield,
  PresentationIcon,
  LineChart,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

type FinanceRole = "all" | "accountant" | "cfo";

const FinanceHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<FinanceRole>(() => {
    return (localStorage.getItem("financeRole") as FinanceRole) || "all";
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("financeTab") || "overview";
  });

  useEffect(() => {
    localStorage.setItem("financeRole", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("financeTab", activeTab);
  }, [activeTab]);

  // Define tabs based on role
  const getTabsForRole = () => {
    const allTabs = [
      { value: "overview", label: "Overview", icon: DollarSign, availableFor: ["all", "accountant", "cfo"] },
      { value: "invoices", label: "Invoices", icon: FileText, availableFor: ["all", "accountant"] },
      { value: "payroll", label: "Payroll", icon: Users, availableFor: ["all", "accountant"] },
      { value: "expenses", label: "Expenses", icon: ShoppingCart, availableFor: ["all", "accountant"] },
      { value: "cash-flow", label: "Cash Flow", icon: LineChart, availableFor: ["all", "accountant", "cfo"] },
      { value: "compliance", label: "Compliance", icon: Shield, availableFor: ["all", "cfo"] },
      { value: "pitch-analysis", label: "Pitch Analysis", icon: PresentationIcon, availableFor: ["all", "cfo"] },
    ];

    if (role === "all") return allTabs;
    return allTabs.filter((tab) => tab.availableFor.includes(role));
  };

  const tabs = getTabsForRole();

  return (
    <div className="flex min-h-screen w-full">
      <DynamicAppSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <AppTopBar title="Finance Hub" />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-accent/5 to-background">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                    <DollarSign className="h-10 w-10 text-accent" />
                    Finance Hub
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {role === "all" && "Your startup's financial command center"}
                    {role === "accountant" && "Daily operations and transaction management"}
                    {role === "cfo" && "Strategic financial insights and forecasting"}
                  </p>
                </div>
              </div>
              
              {/* Role Toggle */}
              <div className="flex justify-center">
                <RoleToggle value={role} onChange={setRole} />
              </div>
            </div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <AICFOInsightBox role={role} />

                    {role === "all" && (
                  <>
                    {/* Top Row - Critical Metrics */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      <RunwayCard />
                      <FundingPipeline />
                      <CapTable />
                    </div>

                    {/* Financial Metrics Grid */}
                    <FinancialMetricsGrid />

                    {/* Cash Flow Chart */}
                    <CashFlowChart />

                    {/* Operations Row */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      <InvoiceTracker />
                      <PayrollOverview />
                      <ExpenseTracking />
                    </div>

                    {/* Virtual CFO Insights */}
                    <VirtualCFOInsights />
                  </>
                )}

                {role === "accountant" && (
                  <>
                    {/* Accountant Focus: Operations First */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      <InvoiceTracker />
                      <PayrollOverview />
                      <ExpenseTracking />
                    </div>

                    {/* Financial Metrics Grid */}
                    <FinancialMetricsGrid />

                    {/* Cash Flow Chart */}
                    <CashFlowChart />
                  </>
                )}

                {role === "cfo" && (
                  <>
                    {/* CFO Focus: Strategy First */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      <RunwayCard />
                      <FundingPipeline />
                      <CapTable />
                    </div>

                    {/* Cash Flow Chart */}
                    <CashFlowChart />

                    {/* Financial Metrics Grid */}
                    <FinancialMetricsGrid />

                    {/* Virtual CFO Insights */}
                    <VirtualCFOInsights />
                    </>
                    )}

                    {/* Show empty state if no role matches */}
                    {role !== "all" && role !== "accountant" && role !== "cfo" && (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Please select a role to view the overview</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Invoices Tab */}
                  <TabsContent value="invoices" className="mt-6 space-y-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <InvoiceGenerator />
                      </div>
                      <div>
                        <InvoiceTracker />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Payroll Tab */}
                  <TabsContent value="payroll" className="mt-6">
                    <PayrollDashboard />
                  </TabsContent>

                  {/* Expenses Tab */}
                  <TabsContent value="expenses" className="mt-6">
                    <ExpenseTracking />
                  </TabsContent>

                  {/* Cash Flow Tab */}
                  <TabsContent value="cash-flow" className="mt-6 space-y-6">
                    <CashFlowChart />
                    <div className="grid lg:grid-cols-3 gap-6">
                      <RunwayCard />
                      <FundingPipeline />
                      <CapTable />
                    </div>
                  </TabsContent>

                  {/* Compliance Tab */}
                  <TabsContent value="compliance" className="mt-6">
                    <ComplianceManager />
                  </TabsContent>

                  {/* Pitch Analysis Tab */}
                  <TabsContent value="pitch-analysis" className="mt-6">
                    <PitchDeckAnalyzer />
                  </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinanceHub;