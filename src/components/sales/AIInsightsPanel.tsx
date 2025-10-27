import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const insights = [
  {
    icon: TrendingUp,
    title: "Response Rate Increased",
    description: "Your response rate increased 11% this week.",
    tag: "Opportunity",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/50",
  },
  {
    icon: AlertCircle,
    title: "Follow-ups Needed",
    description: "Focus on follow-ups for 8 cold leads.",
    tag: "Risk",
    tagColor: "bg-red-500/20 text-red-400 border-red-500/50",
  },
  {
    icon: Brain,
    title: "Revenue Forecast",
    description: "Revenue forecast: +9% this month based on current pipeline.",
    tag: "Suggestion",
    tagColor: "bg-[#007AFF]/20 text-[#007AFF] border-[#007AFF]/50",
  },
  {
    icon: Zap,
    title: "Best Time to Contact",
    description: "Optimal contact time: Tuesdays 2-4 PM for B2B leads.",
    tag: "Suggestion",
    tagColor: "bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/50",
  },
  {
    icon: TrendingUp,
    title: "Deal Velocity Up",
    description: "Average deal closure time reduced by 3 days.",
    tag: "Opportunity",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/50",
  },
];

export const AIInsightsPanel = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="hover:border-accent/50 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold">{insight.title}</h4>
                          <Badge className={`text-xs ${insight.tagColor}`}>
                            {insight.tag}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
