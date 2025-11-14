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

  // Enhance prompt for video generation
  const videoPrompt = `${simplePrompt} Create a professional social media video (5-10 seconds) that visually represents this concept. The video should be dynamic, engaging, and suitable for ${params.platform} platform.`;

  console.log("[VEO3] Using prompt:", videoPrompt);

  try {
    // Call Gemini VEO3 API
    // Note: VEO3 endpoint may vary - using veo-3 model name
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-3:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: videoPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["video"],
            videoConfig: {
              aspectRatio: params.aspectRatio === "1:1" ? "1:1" : params.aspectRatio === "16:9" ? "16:9" : "9:16",
              durationSeconds: 5, // 5 seconds video
            },
          },
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
      throw new Error(`VEO3 API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[VEO3] API Response:", data);

    // Extract video data from response
    // VEO3 may return video as URL or base64 data
    let videoUrl: string;
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.videoUrl) {
      // Video URL provided directly
      videoUrl = data.candidates[0].content.parts[0].videoUrl;
      console.log("[VEO3] Received video URL:", videoUrl);
      
      // Download and upload to Supabase
      const videoResponse = await fetch(videoUrl);
      const videoBlob = await videoResponse.blob();
      const filename = `veo3-${Date.now()}.mp4`;
      videoUrl = await uploadVideoToSupabase(videoBlob, filename);
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      // Video as base64 data
      const videoData = data.candidates[0].content.parts[0].inlineData;
      const base64Video = videoData.data;
      const mimeType = videoData.mimeType || "video/mp4";

      // Convert base64 to blob
      const binaryString = atob(base64Video);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });

      const filename = `veo3-${Date.now()}.mp4`;
      videoUrl = await uploadVideoToSupabase(blob, filename);
    } else {
      // Check for async generation (VEO3 may return a task ID)
      if (data.task?.name) {
        // Poll for completion
        const taskName = data.task.name;
        console.log("[VEO3] Async task created:", taskName);
        
        // Poll for video completion
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max (5s intervals)
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          const statusResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${taskName}?key=${API_KEY}`
          );
          
          if (!statusResponse.ok) {
            throw new Error(`Failed to check task status: ${statusResponse.status}`);
          }
          
          const statusData = await statusResponse.json();
          
          if (statusData.done) {
            // Task completed
            if (statusData.response?.candidates?.[0]?.content?.parts?.[0]?.videoUrl) {
              videoUrl = statusData.response.candidates[0].content.parts[0].videoUrl;
              const videoResponse = await fetch(videoUrl);
              const videoBlob = await videoResponse.blob();
              const filename = `veo3-${Date.now()}.mp4`;
              videoUrl = await uploadVideoToSupabase(videoBlob, filename);
              break;
            } else if (statusData.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
              const videoData = statusData.response.candidates[0].content.parts[0].inlineData;
              const base64Video = videoData.data;
              const mimeType = videoData.mimeType || "video/mp4";
              
              const binaryString = atob(base64Video);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: mimeType });
              
              const filename = `veo3-${Date.now()}.mp4`;
              videoUrl = await uploadVideoToSupabase(blob, filename);
              break;
            }
          }
          
          attempts++;
        }
        
        if (attempts >= maxAttempts) {
          throw new Error("Video generation timed out");
        }
      } else {
        console.error("[VEO3] No video data in response:", data);
        throw new Error("No video data in VEO3 response");
      }
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

