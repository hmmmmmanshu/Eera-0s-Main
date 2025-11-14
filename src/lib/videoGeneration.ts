/**
 * Video Generation using Gemini VEO3
 * Generates videos from text prompts using Google's VEO3 model
 */

import { supabase } from "@/integrations/supabase/client";
import { buildSimpleGeminiPrompt } from "./promptAmplification";
import type { ImageType } from "@/types/imageTypes";
import type { ProfessionalKeywordSettings } from "./professionalKeywords";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const USE_PROXY = true; // Always use proxy to avoid CORS and keep API key secure

export interface VideoGenerationParams {
  accountType: "personal" | "company";
  platform: "linkedin" | "instagram";
  headline: string;
  keyPoints?: string;
  colorMode: "brand" | "custom" | "mood";
  customColors?: { primary: string; accent: string };
  brandColors?: { primary: string; accent: string };
  tone: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  professionalSettings?: ProfessionalKeywordSettings;
  imageType?: ImageType | null;
  brandProfile?: {
    industry?: string;
    style?: string;
    mood?: string[];
  };
}

export interface GeneratedVideo {
  url: string;
  prompt: string;
  generationTime: number;
}

/**
 * Upload video blob to Supabase Storage
 */
async function uploadVideoToSupabase(
  videoBlob: Blob,
  filename: string
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to upload videos");
  }

  const filePath = `marketing/videos/${user.id}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("marketing-assets")
    .upload(filePath, videoBlob, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (uploadError) {
    console.error("[Video Upload] Error:", uploadError);
    throw new Error(`Failed to upload video: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("marketing-assets").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Generate video using Gemini VEO3
 * Uses simplified prompts similar to image generation
 */
export async function generateVideoWithVEO3(
  params: VideoGenerationParams
): Promise<GeneratedVideo> {
  const startTime = Date.now();

  // Build simplified prompt (similar to image generation)
  const simplePrompt = buildSimpleGeminiPrompt({
    accountType: params.accountType,
    platform: params.platform,
    headline: params.headline,
    keyPoints: params.keyPoints,
    colorMode: params.colorMode,
    customColors: params.customColors,
    brandColors: params.brandColors,
    tone: params.tone,
    styleVariation: "minimal", // Default for video
    aspectRatio: params.aspectRatio === "1:1" ? "1:1" : params.aspectRatio === "16:9" ? "16:9" : "9:16",
    professionalSettings: params.professionalSettings,
    imageType: params.imageType,
    brandProfile: params.brandProfile,
  });

  // Map aspect ratio for prompt
  const aspectRatioText = params.aspectRatio === "1:1" 
    ? "square (1:1)" 
    : params.aspectRatio === "16:9" 
    ? "landscape (16:9)" 
    : "vertical (9:16)";
  
  // Enhance prompt for video generation
  const videoPrompt = `${simplePrompt} Create a professional social media video (5-10 seconds, ${aspectRatioText} aspect ratio) that visually represents this concept. The video should be dynamic, engaging, and suitable for ${params.platform} platform.`;

  console.log("[VEO3] Using prompt:", videoPrompt);

  try {
    // Use Supabase Edge Function proxy to avoid CORS and keep API key secure
    const modelName = "veo-3.0-generate"; // Try "veo-3.0-generate-preview" if this doesn't work
    
    if (USE_PROXY && SUPABASE_URL) {
      // Call Supabase Edge Function proxy
      try {
        const { data, error } = await supabase.functions.invoke("veo3-generate-video", {
          body: {
            prompt: videoPrompt,
            modelName: modelName,
          },
        });

        if (error) {
          console.error("[VEO3] Supabase function error:", error);
          // Check if function doesn't exist
          if (error.message?.includes("not found") || error.message?.includes("404")) {
            throw new Error(
              "VEO3 Edge Function not deployed. Please deploy the 'veo3-generate-video' function. " +
              "See DEPLOY_VEO3_FUNCTION.md for instructions."
            );
          }
          throw new Error(error.message || "Supabase function error");
        }

        if (!data?.success || !data?.video) {
          throw new Error(data?.message || "Video generation failed");
        }

      // Convert base64 to blob
      const base64Video = data.video.data;
      const binaryString = atob(base64Video);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.video.mimeType || "video/mp4" });

      // Upload to Supabase Storage
      const filename = `veo3-${Date.now()}.mp4`;
      const videoUrl = await uploadVideoToSupabase(blob, filename);

      const generationTime = Date.now() - startTime;
      console.log("[VEO3] Video generation successful:", {
        url: videoUrl,
        time: generationTime,
      });

        return {
          url: videoUrl,
          prompt: videoPrompt,
          generationTime,
        };
      } catch (invokeError: any) {
        // Handle network/CORS errors
        if (invokeError.message?.includes("Failed to send") || invokeError.message?.includes("CORS")) {
          throw new Error(
            "VEO3 Edge Function not deployed or CORS error. " +
            "Please deploy the 'veo3-generate-video' function in Supabase Dashboard. " +
            "See DEPLOY_VEO3_FUNCTION.md for instructions."
          );
        }
        throw invokeError;
      }
    } else {
      // Fallback: direct API call (will fail due to CORS, but kept for reference)
      throw new Error("VEO3 proxy not available. Please deploy the veo3-generate-video Edge Function.");
    }
  } catch (error) {
    console.error("[VEO3] Generation failed:", error);
    throw error;
  }
}

