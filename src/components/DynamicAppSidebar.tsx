import { useState } from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Users, 
  Scale,
  Brain,
  Settings,
  LogOut,
  Plus,
  Zap,
  FileText,
  Calculator,
  ClipboardList,
  Handshake
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const quickActions: Record<string, { label: string; icon: React.ElementType; action: string }[]> = {
  "/marketing": [
    { label: "Create Post", icon: Plus, action: "create-post" },
    { label: "Run Action", icon: Zap, action: "run-action" },
  ],
  "/finance": [
    { label: "Invoices", icon: FileText, action: "invoices" },
    { label: "Payroll", icon: Users, action: "payroll" },
    { label: "Financial Models", icon: ClipboardList, action: "models" },
    { label: "Virtual CFO", icon: Brain, action: "virtual-cfo" },
  ],
  "/sales": [
    { label: "New Lead", icon: Plus, action: "new-lead" },
    { label: "Pipeline View", icon: TrendingUp, action: "pipeline" },
    { label: "Generate Quote", icon: FileText, action: "quote" },
    { label: "Sales AI", icon: Zap, action: "sales-ai" },
  ],
  "/operations": [
    { label: "New Task", icon: Plus, action: "new-task" },
    { label: "Run Workflow", icon: Zap, action: "run-workflow" },
  ],
  "/legal": [
    { label: "New Contract", icon: FileText, action: "new-contract" },
    { label: "Compliance Check", icon: ClipboardList, action: "compliance" },
  ],
  "/hr": [
    { label: "Add Candidate", icon: Plus, action: "add-candidate" },
    { label: "Schedule Review", icon: ClipboardList, action: "schedule" },
  ],
  "/cognitive": [
    { label: "New Reflection", icon: Plus, action: "new-reflection" },
    { label: "Track Mood", icon: Brain, action: "track-mood" },
  ],
};

export function DynamicAppSidebar({ open, setOpen }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScrollPosition();
  const [expandedHub, setExpandedHub] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleQuickAction = (action: string) => {
    toast.info(`Quick action: ${action}`);
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-foreground" />,
    },
    {
      label: "Cognitive Hub",
      href: "/cognitive",
      icon: <Brain className="h-5 w-5 shrink-0 text-foreground" />,
    },
    {
      label: "Marketing",
      href: "/marketing",
      icon: <TrendingUp className="h-5 w-5 shrink-0 text-foreground" />,
    },
    {
      label: "Sales",
      href: "/sales",
      icon: <Handshake className="h-5 w-5 shrink-0 text-foreground" />,
    },
    {
      label: "Finance",
      href: "/finance",
      icon: <DollarSign className="h-5 w-5 shrink-0 text-foreground" />,
    },
    {
      label: "Operations",
      href: "/operations",
      icon: <Briefcase className="h-5 w-5 shrink-0 text-foreground" />,
    },
    {
      label: "Legal",
      href: "/legal",
      icon: <Scale className="h-5 w-5 shrink-0 text-foreground" />,
    },
    {
      label: "HR",
      href: "/hr",
      icon: <Users className="h-5 w-5 shrink-0 text-foreground" />,
    },
  ];

  const showMiniHeader = scrollY > 200;
  const currentActions = quickActions[location.pathname] || [];

  return (
    <>
      {/* Mini Sticky Header */}
      <AnimatePresence>
        {showMiniHeader && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
          >
            <div className="container mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <img src="/logo.webp" alt="EERA OS Logo" className="h-6 w-6 shrink-0 object-contain" />
                <div className="flex items-center gap-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-accent",
                        location.pathname === link.href
                          ? "text-accent"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label === "Cognitive Hub" ? "Cognitive" : link.label}
                    </Link>
                  ))}
                </div>
              </div>
              {currentActions.length > 0 && (
                <div className="flex items-center gap-2">
                  {currentActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.action)}
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <motion.div
        className="h-full px-4 py-4 hidden md:flex md:flex-col bg-background border-r border-border shrink-0 sticky top-0 overflow-y-auto"
        style={{ maxHeight: "100vh" }}
        animate={{
          width: open ? "300px" : "60px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => {
          setOpen(false);
          setExpandedHub(null);
        }}
      >
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => {
                const isActive = location.pathname === link.href;
                const actions = quickActions[link.href];
                const isExpanded = expandedHub === link.href;

                return (
                  <div key={idx}>
                    <Link
                      to={link.href}
                      onMouseEnter={() => open && setExpandedHub(link.href)}
                      className={cn(
                        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md hover:bg-accent transition-all",
                        isActive && "bg-accent ring-2 ring-accent/50"
                      )}
                    >
                      {link.icon}
                      <motion.span
                        animate={{
                          display: open ? "inline-block" : "none",
                          opacity: open ? 1 : 0,
                        }}
                        className="text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                      >
                        {link.label}
                      </motion.span>
                    </Link>

                    {/* Contextual Quick Actions */}
                    <AnimatePresence>
                      {open && isExpanded && actions && actions.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-7 mt-1 space-y-1 overflow-hidden"
                        >
                          {actions.map((action, actionIdx) => {
                            const ActionIcon = action.icon;
                            return (
                              <button
                                key={actionIdx}
                                onClick={() => handleQuickAction(action.action)}
                                className="flex items-center gap-2 py-1.5 px-2 text-xs text-muted-foreground hover:text-accent transition-colors w-full rounded"
                              >
                                <ActionIcon className="h-3.5 w-3.5" />
                                {action.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              to="/profile-settings"
              className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md hover:bg-accent transition-colors"
            >
              <Settings className="h-5 w-5 shrink-0 text-foreground" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Settings
              </motion.span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md hover:bg-accent transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5 shrink-0 text-foreground" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export const Logo = () => {
  return (
    <Link
      to="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground"
    >
      <img src="/logo.webp" alt="EERA OS Logo" className="h-6 w-6 shrink-0 object-contain" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-foreground"
      >
        Acharya Ventures OS
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground"
    >
      <img src="/logo.webp" alt="EERA OS Logo" className="h-6 w-6 shrink-0 object-contain" />
    </Link>
  );
};
