/**
 * Video Generation using Gemini VEO3
 * Generates videos from text prompts using Google's VEO3 model
 */

import { supabase } from "@/integrations/supabase/client";
import { buildSimpleGeminiPrompt } from "./promptAmplification";
import type { ImageType } from "@/types/imageTypes";
import type { ProfessionalKeywordSettings } from "./professionalKeywords";

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

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

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is required for video generation");
  }

  const modelName = "veo-3.0-generate";

  try {
    // Step 1: Initiate video generation (returns an operation)
    console.log(`[VEO3] Calling VEO3 API directly with model: ${modelName}`);
    console.log(`[VEO3] Prompt length: ${videoPrompt.length} characters`);
    
    const generateResponse = await fetch(
      `${GEMINI_API_BASE}/models/${modelName}:generateVideos?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: videoPrompt,
        }),
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('[VEO3] API Error:', {
        status: generateResponse.status,
        statusText: generateResponse.statusText,
        error: errorText,
      });
      
      let errorMessage = 'VEO3 API error';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText.substring(0, 200);
      }
      
      throw new Error(`VEO3 API error: ${generateResponse.status} - ${errorMessage}`);
    }

    const operationData = await generateResponse.json();
    console.log('[VEO3] Operation created:', operationData);

    // Step 2: Poll for operation completion
    const operationName = operationData.name;
    if (!operationName) {
      throw new Error('No operation name returned from VEO3 API');
    }

    // Poll the operation until it's done
    let operation = operationData;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (poll every 5 seconds)

    while (!operation.done && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `${GEMINI_API_BASE}/${operationName}?key=${API_KEY}`
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to check operation status: ${statusResponse.status}`);
      }

      operation = await statusResponse.json();
      attempts++;

      console.log(`[VEO3] Polling operation (attempt ${attempts}/${maxAttempts}):`, {
        done: operation.done,
      });
    }

    if (!operation.done) {
      throw new Error('Video generation timed out after 5 minutes');
    }

    // Step 3: Extract video file reference and download
    const videoFile = operation.result?.generated_videos?.[0]?.video;
    if (!videoFile) {
      console.error('[VEO3] No video data in operation result:', operation);
      throw new Error('No video data in operation result');
    }

    const fileUri = videoFile.uri || videoFile.name || videoFile;
    let videoBlob: Blob;

    if (typeof fileUri === 'string' && fileUri.startsWith('http')) {
      // Direct URL
      const videoResponse = await fetch(fileUri);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video from URL: ${videoResponse.status}`);
      }
      videoBlob = await videoResponse.blob();
    } else {
      // File ID - download via files API
      const fileId = typeof fileUri === 'string' ? fileUri.split('/').pop() : fileUri;
      const downloadResponse = await fetch(
        `${GEMINI_API_BASE}/files/${fileId}:download?key=${API_KEY}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!downloadResponse.ok) {
        throw new Error(`Failed to download video file: ${downloadResponse.status}`);
      }

      videoBlob = await downloadResponse.blob();
    }

    // Upload to Supabase Storage
    const filename = `veo3-${Date.now()}.mp4`;
    const videoUrl = await uploadVideoToSupabase(videoBlob, filename);

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

