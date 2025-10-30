/**
 * OpenRouter API Client
 * Unified interface for multiple AI models (text & image generation)
 * Docs: https://openrouter.ai/docs
 */

import { supabase } from "@/integrations/supabase/client";
import { BrandContext } from "./brandContext";

// ========================================
// TYPES & INTERFACES
// ========================================

export interface TextGenerationOptions {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  brandContext?: BrandContext;
}

export interface ImageGenerationOptions {
  model: string;
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "4:5" | "5:4" | "2:3" | "3:2" | "21:9";
  brandContext?: BrandContext;
  negativePrompt?: string;
}

export interface GeneratedText {
  content: string;
  model: string;
  tokens: number;
  cost: number;
}

export interface GeneratedImage {
  url: string; // Supabase Storage URL
  model: string;
  generationTime: number;
}

// ========================================
// MODEL CATALOG
// ========================================

export const TEXT_MODELS = {
  "google/gemini-2.0-flash-exp:free": {
    name: "Gemini 2.0 Flash",
    provider: "Google",
    cost: 0, // FREE
    badge: "FREE",
    speed: "fastest",
    description: "Lightning-fast, perfect for captions and high-volume content",
  },
  "openai/gpt-4o": {
    name: "GPT-4o",
    provider: "OpenAI",
    cost: 0.0025, // $2.50 per 1M tokens (approx $0.0025 per 1000 tokens)
    badge: "PREMIUM",
    speed: "fast",
    description: "Most capable, best for professional long-form content",
  },
  "anthropic/claude-3.5-sonnet": {
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    cost: 0.003, // $3.00 per 1M tokens
    badge: "BALANCED",
    speed: "medium",
    description: "Nuanced, thoughtful content with excellent brand voice matching",
  },
} as const;

export const IMAGE_MODELS = {
  "google/gemini-2.5-flash-image-preview:free": {
    name: "Standard Quality",
    badge: "RECOMMENDED",
    speed: "Fast",
    description: "High-quality images optimized for social media",
  },
  "google/gemini-2.5-flash-image-preview": {
    name: "Premium Quality",
    badge: "BEST",
    speed: "Fast",
    description: "Highest quality images with enhanced details",
  },
} as const;

// ========================================
// HELPER FUNCTIONS
// ========================================

function getOpenRouterKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "VITE_OPENROUTER_API_KEY not found. Please add it to .env.local"
    );
  }
  return key;
}

function enhancePromptWithBrand(
  prompt: string,
  brandContext?: BrandContext
): string {
  if (!brandContext) return prompt;

  const { visual, voice, business } = brandContext;

  let enhanced = prompt;

  // Add visual style
  if (visual?.style) {
    enhanced += `, ${visual.style} aesthetic`;
  }

  // Add brand colors
  if (visual?.colors?.primary && visual?.colors?.secondary) {
    enhanced += `, brand colors ${visual.colors.primary} and ${visual.colors.secondary}`;
  }

  // Add mood/tone
  if (visual?.mood) {
    enhanced += `, ${visual.mood} mood`;
  }

  // Add business context
  if (business?.industry) {
    enhanced += `, ${business.industry} industry context`;
  }

  // Add quality markers
  enhanced += ", high quality, professional, clean composition";

  return enhanced;
}

export async function preflightModel(model: string): Promise<{ ok: boolean; code?: number; message?: string }> {
  try {
    const apiKey = getOpenRouterKey();
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "EERA OS Preflight",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
    });
    if (!res.ok) {
      let msg = undefined;
      try { msg = await res.text(); } catch {}
      return { ok: false, code: res.status, message: msg };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message };
  }
}


// ========================================
// MAIN API FUNCTIONS
// ========================================

/**
 * Generate text content using OpenRouter
 */
export async function generateText(
  options: TextGenerationOptions
): Promise<GeneratedText> {
  const { model, prompt, temperature = 0.7, maxTokens = 1000, brandContext } = options;

  console.log("[OpenRouter Text] Starting generation:", { model, prompt });

  const startTime = Date.now();
  const apiKey = getOpenRouterKey();

  // Enhance prompt with brand context
  const systemPrompt = brandContext
    ? `You are a professional marketing content creator for ${brandContext.business?.industry || "a business"}. 
       Brand voice: ${brandContext.voice?.tone?.join(", ") || "professional"}.
       Writing style: ${brandContext.voice?.style || "clear and engaging"}.
       Brand values: ${brandContext.voice?.values?.join(", ") || "quality and innovation"}.`
    : "You are a professional marketing content creator.";

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "EERA OS Marketing Hub",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[OpenRouter Text] API Error:", errorData);
      throw new Error(
        `OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    console.log("[OpenRouter Text] Response:", data);

    const generationTime = Date.now() - startTime;
    const content = data.choices[0]?.message?.content || "";
    const tokens = data.usage?.total_tokens || 0;

    // Estimate cost (approximate)
    const modelInfo = TEXT_MODELS[model as keyof typeof TEXT_MODELS];
    const cost = modelInfo ? (tokens / 1000) * modelInfo.cost : 0;

    console.log("[OpenRouter Text] Generation complete:", {
      content: content.substring(0, 100),
      tokens,
      cost,
      time: generationTime,
    });

    return {
      content,
      model,
      tokens,
      cost,
    };
  } catch (error) {
    console.error("[OpenRouter Text] Generation failed:", error);
    throw error;
  }
}

/**
 * Generate image using OpenRouter with Gemini models
 * Uses /chat/completions endpoint with modalities parameter
 * Reference: https://openrouter.ai/docs/features/multimodal/image-generation
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<GeneratedImage> {
  const { model, prompt, aspectRatio = "1:1", brandContext } = options;

  console.log("[OpenRouter Image] Starting generation:", { model, prompt, aspectRatio });

  const startTime = Date.now();
  const apiKey = getOpenRouterKey();

  // Enhance prompt with brand context
  const enhancedPrompt = enhancePromptWithBrand(prompt, brandContext);
  console.log("[OpenRouter Image] Enhanced prompt:", enhancedPrompt);

  try {
    // Use /chat/completions endpoint with modalities parameter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "EERA OS Marketing Hub",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: enhancedPrompt,
            },
          ],
          modalities: ["image", "text"],
          image_config: {
            aspect_ratio: aspectRatio,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OpenRouter Image] API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("[OpenRouter Image] Response received");

    // Extract base64 image from response
    const images = data.choices?.[0]?.message?.images;
    if (!images || images.length === 0) {
      console.error("[OpenRouter Image] No images in response:", data);
      throw new Error("No images in response");
    }

    const base64DataUrl = images[0]?.image_url?.url;
    if (!base64DataUrl) {
      throw new Error("No image URL in response");
    }

    console.log("[OpenRouter Image] Received base64 image, size:", base64DataUrl.length);

    // Convert base64 data URL to blob
    const base64Data = base64DataUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/png" });

    console.log("[OpenRouter Image] Converted to blob, size:", blob.size);

    // Upload to Supabase Storage
    const filename = `${model.replace(/\//g, "-")}-${Date.now()}.png`;
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const path = `${user.id}/marketing/${Date.now()}-${filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("marketing-images")
      .upload(path, blob, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("[OpenRouter Image] Upload error:", uploadError);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("marketing-images").getPublicUrl(uploadData.path);

    const generationTime = Date.now() - startTime;

    console.log("[AI Image] Generation complete:", {
      url: publicUrl,
      time: generationTime,
    });

    return {
      url: publicUrl,
      model,
      generationTime,
    };
  } catch (error) {
    console.error("[OpenRouter Image] Generation failed:", error);
    throw error;
  }
}

/**
 * Generate with automatic fallback
 * Falls back from paid Gemini model to free one if it fails
 */
export async function generateImageWithFallback(
  options: ImageGenerationOptions,
  fallbackModels: string[] = ["google/gemini-2.5-flash-image-preview:free"]
): Promise<GeneratedImage> {
  const models = [options.model, ...fallbackModels.filter(m => m !== options.model)];

  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    console.log(`[OpenRouter Fallback] Attempt ${i + 1}/${models.length} with model: ${currentModel}`);

    try {
      const result = await generateImage({
        ...options,
        model: currentModel,
      });

      if (i > 0) {
        console.log(`[OpenRouter Fallback] Success with fallback model: ${currentModel}`);
      }

      return result;
    } catch (error) {
      console.error(`[OpenRouter Fallback] Model ${currentModel} failed:`, error);

      // If this was the last model, throw the error
      if (i === models.length - 1) {
        throw new Error(`All models failed. Last error: ${error}`);
      }

      // Otherwise, try the next model
      console.log(`[OpenRouter Fallback] Trying next model...`);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("All fallback attempts failed");
}

