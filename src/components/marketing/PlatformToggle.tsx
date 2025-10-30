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
    <div className="relative inline-flex items-center gap-1 p-1 rounded-lg bg-background border border-border shadow-sm">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative px-4 py-2 text-sm font-semibold transition-all rounded-md focus:outline-none",
            value === option.value
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId="platform-toggle"
              className={cn(
                "absolute inset-0 rounded-md ring-2",
                option.value === "linkedin" && "bg-blue-600/10 ring-blue-500/40",
                option.value === "instagram" && "bg-gradient-to-r from-purple-600/10 to-pink-600/10 ring-purple-500/40",
                option.value === "all" && "bg-primary/10 ring-primary/40"
              )}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
