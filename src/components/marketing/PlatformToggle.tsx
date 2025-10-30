import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Platform = "all" | "linkedin" | "instagram";

interface PlatformToggleProps {
  value: Platform;
  onChange: (value: Platform) => void;
}

export const PlatformToggle = ({ value, onChange }: PlatformToggleProps) => {
  const options: { value: Platform; label: string }[] = [
    { value: "all", label: "All" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "instagram", label: "Instagram" },
  ];

  return (
    <div className="relative inline-flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-colors rounded-md",
            value === option.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId="platform-toggle"
              className={cn(
                "absolute inset-0 rounded-md",
                option.value === "linkedin" && "bg-blue-500/10 border border-blue-500/20",
                option.value === "instagram" && "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20",
                option.value === "all" && "bg-accent/50 border border-accent"
              )}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
