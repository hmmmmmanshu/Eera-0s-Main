import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calculator, TrendingUp, LayoutGrid } from "lucide-react";

type FinanceRole = "all" | "accountant" | "cfo";

interface RoleToggleProps {
  value: FinanceRole;
  onChange: (value: FinanceRole) => void;
}

export const RoleToggle = ({ value, onChange }: RoleToggleProps) => {
  const options: { value: FinanceRole; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "All", icon: LayoutGrid },
    { value: "accountant", label: "Virtual Accountant", icon: Calculator },
    { value: "cfo", label: "Virtual CFO", icon: TrendingUp },
  ];

  return (
    <div className="relative inline-flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2",
              value === option.value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {value === option.value && (
              <motion.div
                layoutId="role-toggle"
                className="absolute inset-0 rounded-md bg-accent/50 border border-accent"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="h-4 w-4 relative z-10" />
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
