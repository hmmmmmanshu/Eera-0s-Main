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
  LogOut
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AppSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AppSidebar({ open, setOpen }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Cognitive Hub",
      href: "/cognitive",
      icon: (
        <Brain className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Marketing",
      href: "/marketing",
      icon: (
        <TrendingUp className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Finance",
      href: "/finance",
      icon: (
        <DollarSign className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Operations",
      href: "/operations",
      icon: (
        <Briefcase className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Legal",
      href: "/legal",
      icon: (
        <Scale className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "HR",
      href: "/hr",
      icon: (
        <Users className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
  ];

  return (
    <motion.div
      className="h-full px-4 py-4 hidden md:flex md:flex-col bg-background border-r border-border shrink-0"
      animate={{
        width: open ? "300px" : "60px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <Link
                key={idx}
                to={link.href}
                className={cn(
                  "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md hover:bg-accent transition-colors",
                  location.pathname === link.href && "bg-accent"
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
            ))}
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
  );
}

export const Logo = () => {
  return (
    <Link
      to="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground"
    >
      <img src="/Logo.png" alt="EERA OS Logo" className="h-6 w-6 shrink-0 object-contain" />
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
      <img src="/Logo.png" alt="EERA OS Logo" className="h-6 w-6 shrink-0 object-contain" />
    </Link>
  );
};
