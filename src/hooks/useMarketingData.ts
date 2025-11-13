import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

// ========================================
// TYPES
// ========================================

export type Platform = "linkedin" | "instagram" | "twitter" | "facebook";
export type PostStatus = "draft" | "scheduled" | "published" | "failed" | "generating";
export type PostFormat = "text" | "image" | "video" | "carousel" | "story";

export interface PostImageMeta {
  url: string;
  caption?: string;
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  seed?: number;
  aspectRatio?: "1:1" | "4:5" | "9:16";
  imageType?: string | null;
}

export interface PostMeta {
  images?: PostImageMeta[]; // ordered, mirrors media_urls order
  reel_storyboard?: {
    slides: Array<{
      imageUrl: string;
      durationSec: number;
      overlayText?: string;
      transition?: string;
    }>;
    voiceoverScript?: string[];
    backgroundTrack?: string;
  };
}

export interface MarketingPost {
  id: string;
  user_id: string;
  platform: Platform;
  content_type?: PostFormat;
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
  post_meta?: PostMeta | null;
  // Auto-save fields for image generation workflow
  selected_image_url?: string | null;
  refined_image_url?: string | null;
  refinement_count?: number;
  generated_images?: string[] | null; // Array of image URLs
  final_image_url?: string | null;
  aspect_ratio?: "1:1" | "4:5" | "16:9" | "9:16" | null;
  image_count?: number;
  account_type?: "personal" | "company" | null;
  // Professional enhancement settings
  professional_settings?: import("../lib/professionalDefaults").ProfessionalSettings | null;
  professional_enhanced?: boolean;
  professional_settings_applied_at?: string | null;
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
        // Normalize platform to lowercase for consistent filtering
        const normalizedPlatform = platform.toLowerCase();
        query = query.eq("platform", normalizedPlatform);
        console.log("[useMarketingPosts] Filtering by platform:", normalizedPlatform);
      }

      if (status) {
        query = query.eq("status", status);
        console.log("[useMarketingPosts] Filtering by status:", status);
      }

      const { data, error } = await query;
      if (error) {
        console.error("[useMarketingPosts] Query error:", error);
        throw error;
      }
      
      console.log("[useMarketingPosts] Found posts:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("[useMarketingPosts] Sample post platforms:", data.slice(0, 3).map(p => p.platform));
      }
      
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

// ========================================
// AUTO-SAVE MUTATION HOOKS FOR IMAGE GENERATION
// ========================================

/**
 * Creates an initial draft post when image generation starts
 * Status is set to "generating" to indicate generation is in progress
 */
export function useCreateDraftPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      headline: string;
      platform: Platform;
      account_type: "personal" | "company";
      aspect_ratio: "1:1" | "4:5" | "16:9" | "9:16";
      image_count: number;
      professional_settings?: import("../lib/professionalDefaults").ProfessionalSettings | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const insertData: any = {
        platform: params.platform,
        content: params.headline,
        media_urls: [],
        status: "generating" as PostStatus,
        scheduled_time: null,
        published_time: null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        account_type: params.account_type,
        aspect_ratio: params.aspect_ratio,
        image_count: params.image_count,
        generated_images: [],
        refinement_count: 0,
      };

      // Add professional settings if provided
      if (params.professional_settings) {
        insertData.professional_settings = params.professional_settings;
        insertData.professional_enhanced = true;
        insertData.professional_settings_applied_at = new Date().toISOString();
      } else {
        insertData.professional_enhanced = false;
      }

      const { data, error } = await supabase
        .from("marketing_posts")
        .insert({ ...insertData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error("[useCreateDraftPost] Error:", error);
        throw error;
      }

      console.log("[useCreateDraftPost] Draft post created:", data.id);
      return data as MarketingPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
      console.log("[useCreateDraftPost] Success - Post ID:", data.id);
    },
    onError: (error) => {
      console.error("[useCreateDraftPost] Failed:", error);
      toast.error(`Failed to create draft: ${error.message}`);
    },
  });
}

/**
 * Updates post with generated images array
 * Updates status to "draft" when all images are complete
 * Optionally updates professional settings if provided
 */
export function useUpdatePostImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      post_id: string;
      generated_images: string[];
      media_urls?: string[];
      professional_settings?: import("../lib/professionalDefaults").ProfessionalSettings | null;
    }) => {
      const updates: any = {
        generated_images: params.generated_images,
        media_urls: params.media_urls || params.generated_images,
        status: "draft" as PostStatus, // Mark as draft when images are ready
      };

      // Add professional settings if provided
      if (params.professional_settings !== undefined) {
        if (params.professional_settings) {
          updates.professional_settings = params.professional_settings;
          updates.professional_enhanced = true;
          updates.professional_settings_applied_at = new Date().toISOString();
        } else {
          // Explicitly set to null/false if settings are cleared
          updates.professional_settings = null;
          updates.professional_enhanced = false;
          updates.professional_settings_applied_at = null;
        }
      }

      const { data, error } = await supabase
        .from("marketing_posts")
        .update(updates)
        .eq("id", params.post_id)
        .select()
        .single();

      if (error) {
        console.error("[useUpdatePostImages] Error:", error);
        throw error;
      }

      console.log("[useUpdatePostImages] Updated with", params.generated_images.length, "images");
      if (params.professional_settings) {
        console.log("[useUpdatePostImages] Professional settings saved");
      }
      return data as MarketingPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
    },
    onError: (error) => {
      console.error("[useUpdatePostImages] Failed:", error);
      toast.error(`Failed to update images: ${error.message}`);
    },
  });
}

/**
 * Updates post when user selects an image from generated options
 */
export function useSelectImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      post_id: string;
      selected_image_url: string;
    }) => {
      const updates: Partial<MarketingPost> = {
        selected_image_url: params.selected_image_url,
        final_image_url: params.selected_image_url, // Also set as final for now
        media_urls: [params.selected_image_url], // Update media_urls
      };

      const { data, error } = await supabase
        .from("marketing_posts")
        .update(updates)
        .eq("id", params.post_id)
        .select()
        .single();

      if (error) {
        console.error("[useSelectImage] Error:", error);
        throw error;
      }

      console.log("[useSelectImage] Image selected:", params.selected_image_url);
      return data as MarketingPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
    },
    onError: (error) => {
      console.error("[useSelectImage] Failed:", error);
      toast.error(`Failed to select image: ${error.message}`);
    },
  });
}

/**
 * Updates post when user refines an image
 * Increments refinement_count and updates refined_image_url
 */
export function useRefineImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      post_id: string;
      refined_image_url: string;
    }) => {
      // First get current refinement_count
      const { data: currentPost, error: fetchError } = await supabase
        .from("marketing_posts")
        .select("refinement_count")
        .eq("id", params.post_id)
        .single();

      if (fetchError) {
        console.error("[useRefineImage] Error fetching current post:", fetchError);
        throw fetchError;
      }

      const currentCount = currentPost?.refinement_count || 0;
      const newCount = currentCount + 1;

      const updates: Partial<MarketingPost> = {
        refined_image_url: params.refined_image_url,
        refinement_count: newCount,
        final_image_url: params.refined_image_url, // Update final image
        media_urls: [params.refined_image_url], // Update media_urls
      };

      const { data, error } = await supabase
        .from("marketing_posts")
        .update(updates)
        .eq("id", params.post_id)
        .select()
        .single();

      if (error) {
        console.error("[useRefineImage] Error:", error);
        throw error;
      }

      console.log("[useRefineImage] Image refined, count:", newCount);
      return data as MarketingPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
    },
    onError: (error) => {
      console.error("[useRefineImage] Failed:", error);
      toast.error(`Failed to refine image: ${error.message}`);
    },
  });
}

/**
 * Finalizes post with final image and caption
 * Status remains "draft" (ready for scheduling)
 */
export function useFinalizePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      post_id: string;
      final_image_url: string;
      final_caption: string;
    }) => {
      const updates: Partial<MarketingPost> = {
        final_image_url: params.final_image_url,
        content: params.final_caption, // Store caption in content field
        media_urls: [params.final_image_url],
        status: "draft" as PostStatus, // Keep as draft for scheduling
      };

      const { data, error } = await supabase
        .from("marketing_posts")
        .update(updates)
        .eq("id", params.post_id)
        .select()
        .single();

      if (error) {
        console.error("[useFinalizePost] Error:", error);
        throw error;
      }

      console.log("[useFinalizePost] Post finalized");
      return data as MarketingPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-posts"] });
      toast.success("Post finalized successfully!");
    },
    onError: (error) => {
      console.error("[useFinalizePost] Failed:", error);
      toast.error(`Failed to finalize post: ${error.message}`);
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
      const { data: targets, error } = await supabase
        .from("marketing_targets")
        .select("*")
        .order("deadline", { ascending: true });

      if (error) throw error;

      // Get current date range for weekly/monthly calculations
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Fetch posts for calculating current values
      const { data: posts } = await supabase
        .from("marketing_posts")
        .select("id, platform, published_time, views, likes, comments, shares, created_at")
        .eq("status", "published")
        .not("published_time", "is", null);

      // Calculate current values for each target
      const targetsWithCurrentValues = (targets as MarketingTarget[]).map((target) => {
        let currentValue = 0;
        const targetName = target.name.toLowerCase();
        const isWeekly = targetName.includes("weekly");
        const isMonthly = targetName.includes("monthly");
        
        // Determine date range
        const startDate = isWeekly ? startOfWeek : isMonthly ? startOfMonth : null;
        
        if (startDate && posts) {
          // Filter posts within the target period
          const periodPosts = posts.filter((post) => {
            if (!post.published_time) return false;
            const postDate = new Date(post.published_time);
            return postDate >= startDate && postDate <= now;
          });

          // Calculate based on target type
          if (targetName.includes("posts")) {
            currentValue = periodPosts.length;
          } else if (targetName.includes("impressions") || targetName.includes("reach")) {
            currentValue = periodPosts.reduce((sum, p) => sum + (p.views || 0), 0);
          } else if (targetName.includes("likes")) {
            currentValue = periodPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
          } else if (targetName.includes("comments")) {
            currentValue = periodPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
          } else if (targetName.includes("shares")) {
            currentValue = periodPosts.reduce((sum, p) => sum + (p.shares || 0), 0);
          } else if (targetName.includes("engagement")) {
            currentValue = periodPosts.reduce(
              (sum, p) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0),
              0
            );
          } else if (targetName.includes("clicks")) {
            // Clicks would come from marketing_metrics table if available
            currentValue = 0; // Placeholder - would need to fetch from metrics
          }
        }

        return {
          ...target,
          current_value: currentValue,
          progress:
            target.target_value > 0
              ? (currentValue / target.target_value) * 100
              : 0,
        };
      });

      return targetsWithCurrentValues;
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

