import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AIInsightCardProps {
  platform: "all" | "linkedin" | "instagram";
}

const insights = {
  all: "Your overall content strategy is performing well with 18% growth across platforms. LinkedIn engagement is leading.",
  linkedin: "Your LinkedIn content performed 15% better in thought-leadership posts. Consider posting more industry insights during weekdays.",
  instagram: "Instagram reels grew reach 12% week-over-week. Visual storytelling content has 3x higher engagement than static posts.",
};

export const AIInsightCard = ({ platform }: AIInsightCardProps) => {
  return (
    <motion.div
      key={platform}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-accent/50 bg-gradient-to-br from-accent/5 to-accent/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                AI Marketing Insight
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights[platform]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
