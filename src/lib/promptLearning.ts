/**
 * Prompt Learning System
 * Tracks prompt performance and learns from successful patterns
 */

import { supabase } from "@/integrations/supabase/client";

export interface PromptPerformanceRecord {
  id?: string;
  user_id: string;
  post_id?: string | null;
  original_prompt: string;
  amplified_prompt: string;
  prompt_hash?: string;
  account_type?: "personal" | "company";
  image_type?: string | null;
  color_mode?: "brand" | "custom" | "mood";
  color_primary?: string;
  color_accent?: string;
  objective?: string;
  tone?: string;
  platform?: string;
  model_used: string;
  generation_time_ms?: number;
  success: boolean;
  error_message?: string | null;
  image_url?: string | null;
  aspect_ratio?: string;
  user_satisfaction?: number | null;
  was_used?: boolean;
  was_regenerated?: boolean;
  engagement_score?: number | null;
  intent_detected?: string;
  visual_cues?: string[];
}

export interface LearningInsights {
  bestImageTypes: Array<{ type: string; avgEngagement: number }>;
  bestColorCombinations: Array<{ primary: string; accent: string; avgEngagement: number }>;
  bestAccountType: "personal" | "company" | null;
  successfulPatterns: Array<{ pattern: string; frequency: number }>;
  improvements: string[];
}

/**
 * Record a prompt generation attempt
 */
export async function recordPromptGeneration(
  record: Omit<PromptPerformanceRecord, "id" | "user_id" | "created_at" | "updated_at">
): Promise<{ id: string } | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("[Prompt Learning] No user found, skipping record");
      return null;
    }

    // Calculate prompt hash for deduplication
    const promptHash = calculatePromptHash(
      record.amplified_prompt,
      {
        account_type: record.account_type,
        image_type: record.image_type,
        color_mode: record.color_mode,
      }
    );

    const { data, error } = await supabase
      .from("prompt_performance")
      .insert({
        user_id: user.id,
        ...record,
        prompt_hash: promptHash,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Prompt Learning] Failed to record generation:", error);
      return null;
    }

    console.log("[Prompt Learning] Recorded prompt generation:", data.id);
    return data;
  } catch (error) {
    console.error("[Prompt Learning] Error recording generation:", error);
    return null;
  }
}

/**
 * Link prompt performance record to post by image URL
 */
export async function linkPromptToPostFromImageUrl(
  postId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Find the most recent prompt performance record with this image URL
    const { data: records, error: findError } = await supabase
      .from("prompt_performance")
      .select("id")
      .eq("user_id", user.id)
      .eq("image_url", imageUrl)
      .eq("post_id", null) // Not already linked
      .order("created_at", { ascending: false })
      .limit(1);

    if (findError || !records || records.length === 0) {
      return false;
    }

    // Link the first matching record
    const { error: updateError } = await supabase
      .from("prompt_performance")
      .update({ post_id: postId, was_used: true })
      .eq("id", records[0].id);

    if (updateError) {
      console.error("[Prompt Learning] Failed to link to post:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Prompt Learning] Error linking to post:", error);
    return false;
  }
}

/**
 * Update performance metrics after post engagement
 */
export async function updatePromptPerformance(
  recordId: string,
  updates: {
    was_used?: boolean;
    was_regenerated?: boolean;
    user_satisfaction?: number;
    engagement_score?: number;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("prompt_performance")
      .update(updates)
      .eq("id", recordId);

    if (error) {
      console.error("[Prompt Learning] Failed to update performance:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Prompt Learning] Error updating performance:", error);
    return false;
  }
}

/**
 * Link prompt performance to a post after saving
 */
export async function linkPromptToPost(
  recordId: string,
  postId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("prompt_performance")
      .update({ post_id: postId, was_used: true })
      .eq("id", recordId);

    if (error) {
      console.error("[Prompt Learning] Failed to link to post:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Prompt Learning] Error linking to post:", error);
    return false;
  }
}

/**
 * Update engagement score from post metrics
 */
export async function updateEngagementFromPost(postId: string): Promise<void> {
  try {
    // Get post metrics
    const { data: post, error: postError } = await supabase
      .from("marketing_posts")
      .select("views, likes, comments, shares")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.warn("[Prompt Learning] Post not found:", postId);
      return;
    }

    // Calculate engagement score
    // Weighted: views (0.1) + likes (2) + comments (5) + shares (3)
    const engagementScore =
      (post.views || 0) * 0.1 +
      (post.likes || 0) * 2 +
      (post.comments || 0) * 5 +
      (post.shares || 0) * 3;

    // Update all prompt performance records linked to this post
    const { error } = await supabase
      .from("prompt_performance")
      .update({ engagement_score: engagementScore })
      .eq("post_id", postId);

    if (error) {
      console.error("[Prompt Learning] Failed to update engagement:", error);
    } else {
      console.log("[Prompt Learning] Updated engagement score:", engagementScore);
    }
  } catch (error) {
    console.error("[Prompt Learning] Error updating engagement:", error);
  }
}

/**
 * Get learning insights for a user
 */
export async function getLearningInsights(
  userId?: string,
  limit: number = 10
): Promise<LearningInsights | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      return null;
    }

    // Get successful prompts with engagement data
    const { data: records, error } = await supabase
      .from("prompt_performance")
      .select("*")
      .eq("user_id", targetUserId)
      .eq("success", true)
      .not("engagement_score", "is", null)
      .order("engagement_score", { ascending: false })
      .limit(limit * 5); // Get more to aggregate

    if (error || !records || records.length === 0) {
      console.log("[Prompt Learning] No records found for insights");
      return {
        bestImageTypes: [],
        bestColorCombinations: [],
        bestAccountType: null,
        successfulPatterns: [],
        improvements: [],
      };
    }

    // Analyze best image types
    const imageTypeMap = new Map<string, { total: number; count: number }>();
    records.forEach((r) => {
      if (r.image_type) {
        const current = imageTypeMap.get(r.image_type) || { total: 0, count: 0 };
        imageTypeMap.set(r.image_type, {
          total: current.total + (r.engagement_score || 0),
          count: current.count + 1,
        });
      }
    });

    const bestImageTypes = Array.from(imageTypeMap.entries())
      .map(([type, data]) => ({
        type,
        avgEngagement: data.total / data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, limit);

    // Analyze best color combinations
    const colorMap = new Map<string, { total: number; count: number }>();
    records.forEach((r) => {
      if (r.color_primary && r.color_accent) {
        const key = `${r.color_primary}-${r.color_accent}`;
        const current = colorMap.get(key) || { total: 0, count: 0 };
        colorMap.set(key, {
          total: current.total + (r.engagement_score || 0),
          count: current.count + 1,
        });
      }
    });

    const bestColorCombinations = Array.from(colorMap.entries())
      .map(([key, data]) => {
        const [primary, accent] = key.split("-");
        return {
          primary,
          accent,
          avgEngagement: data.total / data.count,
        };
      })
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, limit);

    // Analyze best account type
    const accountTypeMap = new Map<"personal" | "company", { total: number; count: number }>();
    records.forEach((r) => {
      if (r.account_type) {
        const current = accountTypeMap.get(r.account_type) || { total: 0, count: 0 };
        accountTypeMap.set(r.account_type, {
          total: current.total + (r.engagement_score || 0),
          count: current.count + 1,
        });
      }
    });

    const accountTypeEntries = Array.from(accountTypeMap.entries());
    const bestAccountType = accountTypeEntries.length > 0
      ? accountTypeEntries.sort((a, b) => 
          (b[1].total / b[1].count) - (a[1].total / a[1].count)
        )[0][0]
      : null;

    // Analyze successful patterns (intent + visual cues combinations)
    const patternMap = new Map<string, number>();
    records.forEach((r) => {
      if (r.intent_detected && r.visual_cues && r.visual_cues.length > 0) {
        const pattern = `${r.intent_detected}:${r.visual_cues.join(",")}`;
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
      }
    });

    const successfulPatterns = Array.from(patternMap.entries())
      .map(([pattern, frequency]) => ({ pattern, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);

    // Generate improvement suggestions
    const improvements: string[] = [];
    
    // Check for regeneration rate
    const regenerationRate = records.filter((r) => r.was_regenerated).length / records.length;
    if (regenerationRate > 0.5) {
      improvements.push("High regeneration rate - consider refining prompt templates");
    }

    // Check for low engagement
    const avgEngagement = records.reduce((sum, r) => sum + (r.engagement_score || 0), 0) / records.length;
    if (avgEngagement < 50) {
      improvements.push("Low average engagement - experiment with different color combinations");
    }

    return {
      bestImageTypes,
      bestColorCombinations,
      bestAccountType,
      successfulPatterns,
      improvements,
    };
  } catch (error) {
    console.error("[Prompt Learning] Error getting insights:", error);
    return null;
  }
}

/**
 * Get suggestions for next prompt based on learning
 */
export async function getPromptSuggestions(
  context: {
    accountType?: "personal" | "company";
    imageType?: string;
    objective?: string;
  }
): Promise<{
  suggestedImageType?: string;
  suggestedColors?: { primary: string; accent: string };
  suggestedIntent?: string;
  tips?: string[];
}> {
  try {
    const insights = await getLearningInsights();
    if (!insights) {
      return {};
    }

    const suggestions: {
      suggestedImageType?: string;
      suggestedColors?: { primary: string; accent: string };
      suggestedIntent?: string;
      tips?: string[];
    } = {
      tips: [],
    };

    // Suggest image type based on best performers
    if (!context.imageType && insights.bestImageTypes.length > 0) {
      suggestions.suggestedImageType = insights.bestImageTypes[0].type;
      suggestions.tips?.push(
        `Your ${suggestions.suggestedImageType} posts get ${Math.round(insights.bestImageTypes[0].avgEngagement)} avg engagement`
      );
    }

    // Suggest colors based on best combinations
    if (insights.bestColorCombinations.length > 0) {
      const bestColors = insights.bestColorCombinations[0];
      suggestions.suggestedColors = {
        primary: bestColors.primary,
        accent: bestColors.accent,
      };
    }

    // Suggest account type
    if (!context.accountType && insights.bestAccountType) {
      suggestions.tips?.push(
        `Your ${insights.bestAccountType} account posts perform better`
      );
    }

    // Add improvement tips
    suggestions.tips?.push(...insights.improvements);

    return suggestions;
  } catch (error) {
    console.error("[Prompt Learning] Error getting suggestions:", error);
    return {};
  }
}

/**
 * Calculate prompt hash for deduplication
 */
function calculatePromptHash(
  prompt: string,
  context: Record<string, any>
): string {
  const hashInput = prompt + JSON.stringify(context);
  // Simple hash - in production, use crypto
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
