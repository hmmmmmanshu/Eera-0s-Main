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
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Plus, 
  TrendingUp, 
  DollarSign,
  FileText,
  Users,
  ShoppingCart,
  Calculator,
  TrendingDown,
  Shield,
  LineChart,
  PresentationIcon,
  Award,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FinanceRole = "all" | "accountant" | "cfo";

const FinanceHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<FinanceRole>(() => {
    return (localStorage.getItem("financeRole") as FinanceRole) || "all";
  });

  useEffect(() => {
    localStorage.setItem("financeRole", role);
  }, [role]);

  const handleAction = (action: string) => {
    toast.info(`Opening ${action}...`);
  };

  const accountantActions = [
    { label: "Invoices", icon: FileText, action: "invoices" },
    { label: "Payroll", icon: Users, action: "payroll" },
    { label: "Purchases Tracking", icon: ShoppingCart, action: "purchases" },
    { label: "Tax Computation", icon: Calculator, action: "tax" },
    { label: "Cash Flow Management", icon: TrendingDown, action: "cashflow" },
    { label: "Compliances", icon: Shield, action: "compliances" },
  ];

  const cfoActions = [
    { label: "Financial Models", icon: LineChart, action: "models" },
    { label: "Investor Updates", icon: PresentationIcon, action: "investors" },
    { label: "Grants Application", icon: Award, action: "grants" },
    { label: "Pitch Decks", icon: Briefcase, action: "pitch" },
  ];

  const allActions = [...accountantActions, ...cfoActions];

  const getActionsForRole = () => {
    if (role === "accountant") return accountantActions;
    if (role === "cfo") return cfoActions;
    return allActions;
  };

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
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="lg" variant="outline" className="gap-2">
                        <Plus className="h-5 w-5" />
                        {role === "accountant" ? "Accountant Actions" : role === "cfo" ? "CFO Actions" : "Finance Actions"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        {role === "accountant" ? "Operations" : role === "cfo" ? "Strategy" : "All Actions"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {getActionsForRole().map((action) => {
                        const Icon = action.icon;
                        return (
                          <DropdownMenuItem
                            key={action.action}
                            onClick={() => handleAction(action.label)}
                            className="gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            {action.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button size="lg" className="gap-2" onClick={() => handleAction(role === "cfo" ? "Virtual CFO" : "Virtual Accountant")}>
                    <Zap className="h-5 w-5" />
                    {role === "cfo" ? "Virtual CFO" : role === "accountant" ? "Virtual Accountant" : "Quick Action"}
                  </Button>
                </div>
              </div>
              
              {/* Role Toggle */}
              <div className="flex justify-center">
                <RoleToggle value={role} onChange={setRole} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* AI Insight Box */}
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
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinanceHub;
