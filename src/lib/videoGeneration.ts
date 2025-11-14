/**
 * Video Generation using Gemini VEO3
 * Generates videos from text prompts using Google's VEO3 model
 */

import { supabase } from "@/integrations/supabase/client";
import { buildSimpleGeminiPrompt } from "./promptAmplification";
import type { ImageType } from "@/types/imageTypes";
import type { ProfessionalKeywordSettings } from "./professionalKeywords";

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
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is required for video generation");
  }

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
    // Call Gemini VEO3 API
    // VEO 3 uses a different endpoint: generate_videos (not generateContent)
    // Model names: "veo-3.0-generate" or "veo-3.0-generate-preview"
    // Reference: https://developers.googleblog.com/en/veo-3-now-available-gemini-api/
    // VEO 3 returns async operations that need to be polled
    
    const modelName = "veo-3.0-generate"; // Try "veo-3.0-generate-preview" if this doesn't work
    
    // Step 1: Initiate video generation (returns an operation)
    // Note: The exact REST endpoint format may vary - this is based on typical Google API patterns
    // If this fails, check the official REST API docs or use the Python SDK as reference
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateVideos?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: videoPrompt,
          // Optional config based on Python SDK example:
          // negative_prompt: "...",
          // aspect_ratio: params.aspectRatio,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[VEO3] API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      // Provide more helpful error message
      let errorMessage = `VEO3 API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage += ` - ${errorJson.error.message}`;
        }
        // Check if model doesn't exist or wrong endpoint
        if (errorJson.error?.message?.includes("not found") || response.status === 404) {
          errorMessage += `\n\nNote: VEO3 uses a different API endpoint. Model: ${modelName}.`;
          errorMessage += `\nTry "veo-3.0-generate-preview" or check Google AI Studio for the correct endpoint.`;
          errorMessage += `\nReference: https://developers.googleblog.com/en/veo-3-now-available-gemini-api/`;
        }
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const operationData = await response.json();
    console.log("[VEO3] Operation created:", operationData);
    
    // Step 2: Poll for operation completion
    // VEO 3 returns an async operation that needs to be polled
    // Operation format: { name: "operations/...", done: false, ... }
    let operation = operationData;
    const operationName = operation.name;
    
    if (!operationName) {
      throw new Error("No operation name returned from VEO3 API");
    }
    
    // Poll the operation until it's done
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (poll every 5 seconds)
    
    while (!operation.done && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      // Poll operation status
      const statusResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${API_KEY}`
      );
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check operation status: ${statusResponse.status}`);
      }
      
      operation = await statusResponse.json();
      attempts++;
      
      console.log(`[VEO3] Polling operation (attempt ${attempts}/${maxAttempts}):`, {
        done: operation.done,
        name: operationName,
      });
    }
    
    if (!operation.done) {
      throw new Error("Video generation timed out after 5 minutes");
    }
    
    // Step 3: Extract video from completed operation
    // VEO 3 response format: operation.result.generated_videos[0].video
    const data = operation;
    console.log("[VEO3] Operation completed:", data);

    // Extract video data from completed operation
    // VEO 3 format: operation.result.generated_videos[0].video (file reference)
    // Need to download the file using the file API
    let videoUrl: string;
    
    if (data.result?.generated_videos?.[0]?.video) {
      // VEO 3 returns a file reference, need to download it
      const videoFile = data.result.generated_videos[0].video;
      const fileUri = videoFile.uri || videoFile.name || videoFile;
      
      console.log("[VEO3] Video file reference:", fileUri);
      
      // Download the video file
      // VEO 3 files API endpoint: /v1beta/files/{file_id}:download
      // Or use the file URI directly if it's a public URL
      if (typeof fileUri === "string" && fileUri.startsWith("http")) {
        // Direct URL
        const videoResponse = await fetch(fileUri);
        const videoBlob = await videoResponse.blob();
        const filename = `veo3-${Date.now()}.mp4`;
        videoUrl = await uploadVideoToSupabase(videoBlob, filename);
      } else {
        // File ID - need to download via files API
        const fileId = typeof fileUri === "string" ? fileUri.split("/").pop() : fileUri;
        const downloadResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/files/${fileId}:download?key=${API_KEY}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download video file: ${downloadResponse.status}`);
        }
        
        const videoBlob = await downloadResponse.blob();
        const filename = `veo3-${Date.now()}.mp4`;
        videoUrl = await uploadVideoToSupabase(videoBlob, filename);
      }
    } else {
      console.error("[VEO3] No video data in operation result:", data);
      throw new Error("No video data in VEO3 operation result. Check operation.result.generated_videos");
    }

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
  } catch (error) {
    console.error("[VEO3] Generation failed:", error);
    throw error;
  }
}

