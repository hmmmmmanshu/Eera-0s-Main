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
  size?: "1024x1024" | "1792x1024" | "1024x1792";
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
  cost: number;
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
  "openai/dall-e-3": {
    name: "DALL-E 3",
    provider: "OpenAI",
    cost: 0.04,
    badge: "RELIABLE",
    speed: "fast",
    description: "Best for text in images, professional layouts",
  },
  "black-forest-labs/flux-dev": {
    name: "Flux Dev",
    provider: "Black Forest Labs",
    cost: 0.025,
    badge: "BALANCED",
    speed: "fast",
    description: "Great balance of quality and cost",
  },
  "black-forest-labs/flux-pro": {
    name: "Flux Pro",
    provider: "Black Forest Labs",
    cost: 0.055,
    badge: "PREMIUM",
    speed: "medium",
    description: "Highest quality photorealistic images",
  },
  "stability-ai/stable-diffusion-xl": {
    name: "SDXL",
    provider: "Stability AI",
    cost: 0.003,
    badge: "CHEAPEST",
    speed: "fast",
    description: "Ultra-low cost, great for testing and high-volume",
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

async function uploadToSupabase(
  imageUrl: string,
  filename: string
): Promise<string> {
  console.log("[OpenRouter] Downloading image from:", imageUrl);

  // Download image from OpenRouter
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const blob = await response.blob();
  console.log("[OpenRouter] Image downloaded, size:", blob.size);

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Upload to Supabase Storage
  const path = `${user.id}/marketing/${Date.now()}-${filename}`;

  const { data, error } = await supabase.storage
    .from("marketing-images")
    .upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });

  if (error) {
    console.error("[OpenRouter] Upload error:", error);
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("marketing-images").getPublicUrl(data.path);

  console.log("[OpenRouter] Upload successful:", publicUrl);
  return publicUrl;
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
 * Generate image using OpenRouter
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<GeneratedImage> {
  const { model, prompt, size = "1024x1024", brandContext, negativePrompt } = options;

  console.log("[OpenRouter Image] Starting generation:", { model, prompt, size });

  const startTime = Date.now();
  const apiKey = getOpenRouterKey();

  // Enhance prompt with brand context
  const enhancedPrompt = enhancePromptWithBrand(prompt, brandContext);
  console.log("[OpenRouter Image] Enhanced prompt:", enhancedPrompt);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/images/generations",
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
          prompt: enhancedPrompt,
          ...(negativePrompt && { negative_prompt: negativePrompt }),
          size,
          n: 1,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[OpenRouter Image] API Error:", errorData);
      throw new Error(
        `OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    console.log("[OpenRouter Image] Response received:", data);

    // Extract image URL from response
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    console.log("[OpenRouter Image] Temporary URL:", imageUrl);

    // Upload to Supabase Storage for permanent hosting
    const permanentUrl = await uploadToSupabase(imageUrl, `${model.replace(/\//g, "-")}-${Date.now()}.png`);

    const generationTime = Date.now() - startTime;
    const modelInfo = IMAGE_MODELS[model as keyof typeof IMAGE_MODELS];
    const cost = modelInfo?.cost || 0;

    console.log("[OpenRouter Image] Generation complete:", {
      url: permanentUrl,
      cost,
      time: generationTime,
    });

    return {
      url: permanentUrl,
      model,
      cost,
      generationTime,
    };
  } catch (error) {
    console.error("[OpenRouter Image] Generation failed:", error);
    throw error;
  }
}

/**
 * Generate with automatic fallback
 */
export async function generateImageWithFallback(
  options: ImageGenerationOptions,
  fallbackModels: string[] = ["openai/dall-e-3", "black-forest-labs/flux-dev", "stability-ai/stable-diffusion-xl"]
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

