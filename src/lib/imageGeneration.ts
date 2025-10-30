/**
 * Multi-Model AI Image Generation System
 * Supports: Google Gemini Imagen, DALL-E 3, Stability SDXL, Leonardo AI
 * With automatic brand context injection and Supabase Storage integration
 */

import type { BrandContext } from "./brandContext";
import { supabase } from "@/integrations/supabase/client";
import { enhanceImagePrompt as geminiEnhancePrompt } from "./gemini";

// ========================================
// TYPES
// ========================================

export type ImageModel = "gemini" | "dalle3" | "sdxl" | "leonardo";
export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";
export type ImageStyle =
  | "photorealistic"
  | "illustration"
  | "minimalist"
  | "vibrant";

export interface ImageGenerationParams {
  model: ImageModel;
  prompt: string;
  brandContext: BrandContext;
  aspectRatio: AspectRatio;
  style?: ImageStyle;
  negativePrompt?: string; // For SDXL
  seed?: number; // For reproducibility
  referenceImage?: string; // URL for image-to-image
}

export interface GeneratedImage {
  url: string; // Supabase Storage URL
  model: ImageModel;
  prompt: string; // The enhanced prompt used
  metadata: {
    seed?: number;
    aspectRatio: string;
    generationTime: number; // milliseconds
    estimatedCost: number; // USD
  };
}

export interface ModelInfo {
  name: string;
  description: string;
  pricing: string;
  speed: string;
  badge: string;
  bestFor: string;
}

// ========================================
// MODEL METADATA
// ========================================

export const MODEL_INFO: Record<ImageModel, ModelInfo> = {
  gemini: {
    name: "Google Gemini Imagen",
    description: "Quick edits, text in images, 2-4s generation",
    pricing: "$0.02-0.04/image",
    speed: "2-4s",
    badge: "FASTEST",
    bestFor: "Quick iterations, text editing, compositional changes",
  },
  dalle3: {
    name: "DALL-E 3",
    description: "Best text rendering, detailed layouts",
    pricing: "$0.08/image",
    speed: "5-10s",
    badge: "RELIABLE",
    bestFor: "Professional ads, layouts with text, high quality",
  },
  sdxl: {
    name: "Stability SDXL",
    description: "Reproducible, templates, max control",
    pricing: "$0.03-0.065/image",
    speed: "4-8s",
    badge: "FLEXIBLE",
    bestFor: "Brand templates, reproducibility, consistent outputs",
  },
  leonardo: {
    name: "Leonardo AI",
    description: "Multiple styles, photorealistic + creative",
    pricing: "$0.05/image",
    speed: "5-12s",
    badge: "ARTISTIC",
    bestFor: "Artistic variety, exploration, diverse styles",
  },
};

// ========================================
// COST ESTIMATION
// ========================================

export function estimateCost(model: ImageModel): number {
  const costs: Record<ImageModel, number> = {
    gemini: 0.03,
    dalle3: 0.08,
    sdxl: 0.05,
    leonardo: 0.05,
  };
  return costs[model];
}

export function estimateTime(model: ImageModel): number {
  const times: Record<ImageModel, number> = {
    gemini: 3, // seconds
    dalle3: 7,
    sdxl: 6,
    leonardo: 8,
  };
  return times[model];
}

// ========================================
// DIMENSION HELPERS
// ========================================

function getDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  const dimensions: Record<AspectRatio, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "4:5": { width: 1024, height: 1280 },
    "16:9": { width: 1792, height: 1024 },
    "9:16": { width: 1024, height: 1792 },
  };
  return dimensions[aspectRatio];
}

// ========================================
// BRAND-AWARE PROMPT ENHANCEMENT
// ========================================

async function enhancePromptWithBrandContext(
  userPrompt: string,
  brandContext: BrandContext,
  aspectRatio: AspectRatio,
  style?: ImageStyle
): Promise<string> {
  const { visual, business } = brandContext;

  // Use Gemini to create a sophisticated enhanced prompt
  try {
    const enhanced = await geminiEnhancePrompt(
      userPrompt,
      brandContext,
      "linkedin" // Default platform for image generation
    );
    return enhanced;
  } catch (error) {
    console.warn("Gemini prompt enhancement failed, using fallback", error);

    // Fallback: Manual enhancement
    const colorDesc =
      visual.colors?.primary && visual.colors?.secondary
        ? `incorporating brand colors ${visual.colors.primary} and ${visual.colors.secondary}`
        : "";

    const styleDesc = style
      ? `${style} style`
      : visual.style
      ? `${visual.style} aesthetic`
      : "modern, professional style";

    const moodDesc = visual.mood.length > 0 ? visual.mood.join(", ") : "clean, polished";

    return `${userPrompt}, ${styleDesc}, ${colorDesc}, ${moodDesc} mood, ${business.industry || "technology"} industry context, high quality, professional composition, aspect ratio ${aspectRatio}`;
  }
}

// ========================================
// SUPABASE STORAGE UPLOAD
// ========================================

async function uploadToSupabase(
  imageBlob: Blob,
  filename: string
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const path = `${user.id}/marketing/${Date.now()}-${filename}`;

  const { data, error } = await supabase.storage
    .from("marketing-images")
    .upload(path, imageBlob, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("marketing-images").getPublicUrl(data.path);

  return publicUrl;
}

// ========================================
// MAIN GENERATION FUNCTION
// ========================================

export async function generateImage(
  params: ImageGenerationParams
): Promise<GeneratedImage> {
  const startTime = Date.now();

  // 1. Enhance prompt with brand context
  const enhancedPrompt = await enhancePromptWithBrandContext(
    params.prompt,
    params.brandContext,
    params.aspectRatio,
    params.style
  );

  console.log(`[Image Gen] Model: ${params.model}, Enhanced prompt:`, enhancedPrompt);

  // 2. Route to appropriate model
  let imageUrl: string;
  let seed: number | undefined;

  switch (params.model) {
    case "gemini":
      imageUrl = await generateWithGemini(enhancedPrompt, params);
      break;
    case "dalle3":
      imageUrl = await generateWithDallE(enhancedPrompt, params);
      break;
    case "sdxl":
      const sdxlResult = await generateWithSDXL(enhancedPrompt, params);
      imageUrl = sdxlResult.url;
      seed = sdxlResult.seed;
      break;
    case "leonardo":
      imageUrl = await generateWithLeonardo(enhancedPrompt, params);
      break;
    default:
      throw new Error(`Unknown model: ${params.model}`);
  }

  const endTime = Date.now();

  return {
    url: imageUrl,
    model: params.model,
    prompt: enhancedPrompt,
    metadata: {
      seed: seed || params.seed,
      aspectRatio: params.aspectRatio,
      generationTime: endTime - startTime,
      estimatedCost: estimateCost(params.model),
    },
  };
}

// ========================================
// MODEL-SPECIFIC GENERATORS
// ========================================

/**
 * Google Gemini Imagen 3 / 2.5 Flash
 */
async function generateWithGemini(
  prompt: string,
  params: ImageGenerationParams
): Promise<string> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) throw new Error("Gemini API key not configured");

  const { width, height } = getDimensions(params.aspectRatio);

  // Note: This is a placeholder. Actual Gemini image generation API might differ.
  // For now, we'll use a mock implementation that returns a placeholder
  console.warn("Gemini image generation not yet implemented - using placeholder");

  // TODO: Implement actual Gemini Imagen API call
  // const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict', {...});

  // For now, return a placeholder that indicates Gemini was requested
  const placeholderBlob = await fetch(
    `https://placehold.co/${width}x${height}/0A66FF/FFFFFF/png?text=Gemini+Image+${width}x${height}`
  ).then((r) => r.blob());

  return uploadToSupabase(placeholderBlob, `gemini-${Date.now()}.png`);
}

/**
 * OpenAI DALL-E 3
 */
async function generateWithDallE(
  prompt: string,
  params: ImageGenerationParams
): Promise<string> {
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!API_KEY) throw new Error("OpenAI API key not configured");

  const { aspectRatio } = params;
  let size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024";

  if (aspectRatio === "16:9") size = "1792x1024";
  else if (aspectRatio === "9:16") size = "1024x1792";

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
      quality: "hd",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DALL-E 3 error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;

  // Download and upload to Supabase
  const imageBlob = await fetch(imageUrl).then((r) => r.blob());
  return uploadToSupabase(imageBlob, `dalle3-${Date.now()}.png`);
}

/**
 * Stability AI SDXL / Stable Diffusion 3.5
 */
async function generateWithSDXL(
  prompt: string,
  params: ImageGenerationParams
): Promise<{ url: string; seed: number }> {
  const API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
  if (!API_KEY) throw new Error("Stability AI API key not configured");

  const seed = params.seed || Math.floor(Math.random() * 1000000);

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/sd3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt:
          params.negativePrompt ||
          "blurry, lowres, watermark, text artifacts, distorted, low quality",
        aspect_ratio: params.aspectRatio.replace(":", "_"), // "1:1" -> "1_1"
        seed: seed,
        output_format: "png",
        model: "sd3.5-large",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stability AI error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  const base64Image = data.image;

  // Convert base64 to blob
  const binaryString = atob(base64Image);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const imageBlob = new Blob([bytes], { type: "image/png" });

  const url = await uploadToSupabase(imageBlob, `sdxl-${Date.now()}.png`);

  return { url, seed };
}

/**
 * Leonardo AI (Flux / Phoenix)
 */
async function generateWithLeonardo(
  prompt: string,
  params: ImageGenerationParams
): Promise<string> {
  const API_KEY = import.meta.env.VITE_LEONARDO_API_KEY;
  if (!API_KEY) throw new Error("Leonardo AI API key not configured");

  const { width, height } = getDimensions(params.aspectRatio);
  const modelId =
    params.style === "photorealistic"
      ? "flux-pro" // Flux for photorealistic
      : "phoenix-1.0"; // Phoenix for artistic

  // Step 1: Create generation
  const generateResponse = await fetch(
    "https://cloud.leonardo.ai/api/rest/v1/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        modelId: modelId,
        width: width,
        height: height,
        num_images: 1,
      }),
    }
  );

  if (!generateResponse.ok) {
    const error = await generateResponse.json();
    throw new Error(`Leonardo AI error: ${error.message || generateResponse.statusText}`);
  }

  const { sdGenerationJob } = await generateResponse.json();
  const generationId = sdGenerationJob.generationId;

  // Step 2: Poll for completion
  let imageUrl: string | null = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s

    const statusResponse = await fetch(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      if (statusData.generations_by_pk?.generated_images?.[0]?.url) {
        imageUrl = statusData.generations_by_pk.generated_images[0].url;
        break;
      }
    }
  }

  if (!imageUrl) {
    throw new Error("Leonardo AI generation timed out");
  }

  // Download and upload to Supabase
  const imageBlob = await fetch(imageUrl).then((r) => r.blob());
  return uploadToSupabase(imageBlob, `leonardo-${Date.now()}.png`);
}

// ========================================
// BATCH GENERATION (FUTURE)
// ========================================

export async function generateMultipleImages(
  params: ImageGenerationParams,
  count: number = 3
): Promise<GeneratedImage[]> {
  const promises = Array.from({ length: count }, () => generateImage(params));
  return Promise.all(promises);
}

