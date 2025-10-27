import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface AICFOInsightBoxProps {
  role: "all" | "accountant" | "cfo";
}

const insights = {
  all: "Your financial health is stable. Cash runway: 14 months. Consider diversifying revenue streams for sustained growth.",
  accountant: "8 pending invoices worth $24,500 need attention. Payment collection rate is 15% slower than industry average.",
  cfo: "Reduce marketing spend by 8% to extend runway by 2 months. Current burn rate suggests pivot to profitability focus in Q3.",
};

const icons = {
  all: TrendingUp,
  accountant: Lightbulb,
  cfo: TrendingDown,
};

export const AICFOInsightBox = ({ role }: AICFOInsightBoxProps) => {
  const Icon = icons[role];
  
  return (
    <motion.div
      key={role}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-accent/50 bg-gradient-to-br from-accent/5 to-accent/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                {role === "cfo" ? "AI CFO Strategic Insight" : role === "accountant" ? "AI Accountant Alert" : "AI Financial Insight"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights[role]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
