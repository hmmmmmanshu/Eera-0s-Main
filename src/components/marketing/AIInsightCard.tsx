import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useBrandProfile } from "@/hooks/useMarketingData";
import { useMemo } from "react";

interface AIInsightCardProps {
  platform: "all" | "linkedin" | "instagram";
}

export const AIInsightCard = ({ platform }: AIInsightCardProps) => {
  const { data: profile } = useBrandProfile();

  // Generate personalized insights based on brand profile
  const insight = useMemo(() => {
    if (!profile) {
      return "Complete your brand profile to get personalized AI insights tailored to your business.";
    }

    const brandName = profile.startup_name || "Your brand";
    const industry = profile.industry || "your industry";
    const tone = profile.tone_personality?.[0] || "professional";

    // Platform-specific insights with brand context
    if (platform === "linkedin") {
      return `For ${brandName} in ${industry}, LinkedIn content with a ${tone} tone performs best. Consider sharing thought leadership posts about industry trends during weekday mornings (9-11 AM) when your professional audience is most active.`;
    } else if (platform === "instagram") {
      return `${brandName}'s visual content on Instagram should emphasize your brand values: ${profile.brand_values?.join(", ") || "authenticity"}. Carousel posts and Reels showing behind-the-scenes content typically drive 3x higher engagement for ${industry} brands.`;
    } else {
      return `${brandName}'s cross-platform strategy is on track. Your ${tone} voice resonates well with ${profile.target_audience || "your audience"}. Focus on consistent posting during your optimal times (${profile.posting_hours || "business hours"}) to maximize reach across LinkedIn and Instagram.`;
    }
  }, [profile, platform]);

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
                {profile && (
                  <span className="text-xs font-normal text-muted-foreground">
                    • Personalized for {profile.startup_name}
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
