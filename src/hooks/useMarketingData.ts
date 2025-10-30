import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

// ========================================
// TYPES
// ========================================

export type Platform = "linkedin" | "instagram" | "twitter" | "facebook";
export type PostStatus = "draft" | "scheduled" | "published" | "failed";
export type PostFormat = "text" | "image" | "video" | "carousel" | "story";

export interface MarketingPost {
  id: string;
  user_id: string;
  platform: Platform;
  content: string;
  media_urls: string[];
  status: PostStatus;
  scheduled_time: string | null;
  published_time: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingMetric {
  id: string;
  user_id: string;
  platform: Platform | "all";
  metric_date: string;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
  created_at: string;
}

export interface MarketingTarget {
  id: string;
  user_id: string;
  name: string;
  target_value: number;
  current_value: number;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  startup_name: string | null;
  logo_url: string | null;
  tagline: string | null;
  about: string | null;
  industry: string | null;
  target_audience: string | null;
  key_offerings: string | null;
  company_stage: string | null;
  design_philosophy: string | null;
  timezone: string | null;
  posting_hours: any;
  primary_metrics: string[] | null;
  marketing_goal: string | null;
  tone_personality: string[] | null;
  writing_style: string | null;
  language_style: string | null;
  brand_values: string[] | null;
  competitive_edge: string | null;
  inspirational_brands: string | null;
  offlimit_topics: string | null;
  preferred_platforms: string[] | null;
  preferred_formats: string[] | null;
  content_themes: string[] | null;
  posting_frequency: string | null;
  color_palette: any;
}

export interface ActivityHeatmapData {
  date: string;
  count: number;
  platform: Platform;
}

export interface KPIData {
  value: number;
  change: number; // percentage change from previous period
  trend: "up" | "down" | "neutral";
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getDateRange(days: number): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  return { startDate, endDate };
}

// ========================================
// BRAND PROFILE HOOK
// ========================================

export function useBrandProfile() {
  return useQuery({
    queryKey: ["brand-profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as BrandProfile;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ========================================
// MARKETING POSTS HOOKS
// ========================================

export function useMarketingPosts(platform?: Platform, status?: PostStatus) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["marketing-posts", platform, status],
    queryFn: async () => {
      let query = supabase
        .from("marketing_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (platform) {
        query = query.eq("platform", platform);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketingPost[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("marketing-posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marketing_posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      post: Omit<MarketingPost, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      console.log("[useCreatePost] Starting mutation:", post);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("[useCreatePost] No authenticated user");
        throw new Error("Not authenticated");
      }

      console.log("[useCreatePost] User ID:", user.id);

      const insertData = { ...post, user_id: user.id };
      console.log("[useCreatePost] Inserting data:", insertData);

      const { data, error } = await supabase
        .from("marketing_posts")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[useCreatePost] Supabase error:", error);
        throw error;
      }
      
      console.log("[useCreatePost] Post created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("[useCreatePost] onSuccess callback:", data);
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-metrics"] });
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      console.error("[useCreatePost] onError callback:", error);
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MarketingPost>;
    }) => {
      const { data, error } = await supabase
        .from("marketing_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
      toast.success("Post updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("marketing_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
      toast.success("Post deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
}

// ========================================
// MARKETING METRICS HOOKS
// ========================================

export function useMarketingMetrics(
  platform: Platform | "all" = "all",
  days: number = 30
) {
  return useQuery({
    queryKey: ["marketing-metrics", platform, days],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange(days);
      const prevRange = getDateRange(days * 2);

      // Fetch current period metrics
      let currentQuery = supabase
        .from("marketing_metrics")
        .select("*")
        .gte("metric_date", startDate.toISOString().split("T")[0])
        .lte("metric_date", endDate.toISOString().split("T")[0]);

      if (platform !== "all") {
        currentQuery = currentQuery.eq("platform", platform);
      }

      const { data: currentData, error: currentError } = await currentQuery;
      if (currentError) throw currentError;

      // Fetch previous period metrics for comparison
      let prevQuery = supabase
        .from("marketing_metrics")
        .select("*")
        .gte("metric_date", prevRange.startDate.toISOString().split("T")[0])
        .lt("metric_date", startDate.toISOString().split("T")[0]);

      if (platform !== "all") {
        prevQuery = prevQuery.eq("platform", platform);
      }

      const { data: prevData, error: prevError } = await prevQuery;
      if (prevError) throw prevError;

      // Calculate aggregated metrics
      const currentMetrics = {
        reach: currentData?.reduce((sum, m) => sum + m.reach, 0) || 0,
        engagement: currentData?.reduce((sum, m) => sum + m.engagement, 0) || 0,
        clicks: currentData?.reduce((sum, m) => sum + m.clicks, 0) || 0,
        conversions: currentData?.reduce((sum, m) => sum + m.conversions, 0) || 0,
      };

      const prevMetrics = {
        reach: prevData?.reduce((sum, m) => sum + m.reach, 0) || 0,
        engagement: prevData?.reduce((sum, m) => sum + m.engagement, 0) || 0,
        clicks: prevData?.reduce((sum, m) => sum + m.clicks, 0) || 0,
        conversions: prevData?.reduce((sum, m) => sum + m.conversions, 0) || 0,
      };

      // Calculate KPIs with trends
      return {
        reach: {
          value: currentMetrics.reach,
          change: calculatePercentageChange(
            currentMetrics.reach,
            prevMetrics.reach
          ),
          trend:
            currentMetrics.reach > prevMetrics.reach
              ? ("up" as const)
              : currentMetrics.reach < prevMetrics.reach
              ? ("down" as const)
              : ("neutral" as const),
        },
        engagement: {
          value: currentMetrics.engagement,
          change: calculatePercentageChange(
            currentMetrics.engagement,
            prevMetrics.engagement
          ),
          trend:
            currentMetrics.engagement > prevMetrics.engagement
              ? ("up" as const)
              : currentMetrics.engagement < prevMetrics.engagement
              ? ("down" as const)
              : ("neutral" as const),
        },
        clicks: {
          value: currentMetrics.clicks,
          change: calculatePercentageChange(
            currentMetrics.clicks,
            prevMetrics.clicks
          ),
          trend:
            currentMetrics.clicks > prevMetrics.clicks
              ? ("up" as const)
              : currentMetrics.clicks < prevMetrics.clicks
              ? ("down" as const)
              : ("neutral" as const),
        },
        conversions: {
          value: currentMetrics.conversions,
          change: calculatePercentageChange(
            currentMetrics.conversions,
            prevMetrics.conversions
          ),
          trend:
            currentMetrics.conversions > prevMetrics.conversions
              ? ("up" as const)
              : currentMetrics.conversions < prevMetrics.conversions
              ? ("down" as const)
              : ("neutral" as const),
        },
      };
    },
  });
}

// ========================================
// MARKETING TARGETS HOOKS
// ========================================

export function useMarketingTargets() {
  return useQuery({
    queryKey: ["marketing-targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_targets")
        .select("*")
        .order("deadline", { ascending: true });

      if (error) throw error;

      // Calculate progress for each target
      return (data as MarketingTarget[]).map((target) => ({
        ...target,
        progress:
          target.target_value > 0
            ? (target.current_value / target.target_value) * 100
            : 0,
      }));
    },
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      target: Omit<MarketingTarget, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("marketing_targets")
        .insert({ ...target, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-targets"] });
      toast.success("Target created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create target: ${error.message}`);
    },
  });
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MarketingTarget>;
    }) => {
      const { data, error } = await supabase
        .from("marketing_targets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-targets"] });
      toast.success("Target updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update target: ${error.message}`);
    },
  });
}

// ========================================
// ACTIVITY HEATMAP HOOK
// ========================================

export function useActivityHeatmap(
  startDate: Date,
  endDate: Date,
  platform?: Platform
) {
  return useQuery({
    queryKey: ["activity-heatmap", startDate, endDate, platform],
    queryFn: async () => {
      let query = supabase
        .from("marketing_posts")
        .select("platform, published_time")
        .not("published_time", "is", null)
        .gte("published_time", startDate.toISOString())
        .lte("published_time", endDate.toISOString());

      if (platform) {
        query = query.eq("platform", platform);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by date and count
      const heatmapData: Record<string, ActivityHeatmapData> = {};

      data?.forEach((post) => {
        const date = post.published_time.split("T")[0];
        const key = `${date}-${post.platform}`;

        if (!heatmapData[key]) {
          heatmapData[key] = {
            date,
            count: 0,
            platform: post.platform as Platform,
          };
        }

        heatmapData[key].count++;
      });

      return Object.values(heatmapData);
    },
  });
}

// ========================================
// AGGREGATE STATS HOOK
// ========================================

export function useMarketingStats(platform?: Platform) {
  const { data: posts } = useMarketingPosts(platform);
  const { data: metrics } = useMarketingMetrics(platform || "all", 30);

  return {
    totalPosts: posts?.length || 0,
    publishedPosts:
      posts?.filter((p) => p.status === "published").length || 0,
    scheduledPosts:
      posts?.filter((p) => p.status === "scheduled").length || 0,
    draftPosts: posts?.filter((p) => p.status === "draft").length || 0,
    totalViews: posts?.reduce((sum, p) => sum + p.views, 0) || 0,
    totalLikes: posts?.reduce((sum, p) => sum + p.likes, 0) || 0,
    totalComments: posts?.reduce((sum, p) => sum + p.comments, 0) || 0,
    totalShares: posts?.reduce((sum, p) => sum + p.shares, 0) || 0,
    metrics: metrics || {
      reach: { value: 0, change: 0, trend: "neutral" as const },
      engagement: { value: 0, change: 0, trend: "neutral" as const },
      clicks: { value: 0, change: 0, trend: "neutral" as const },
      conversions: { value: 0, change: 0, trend: "neutral" as const },
    },
  };
}

