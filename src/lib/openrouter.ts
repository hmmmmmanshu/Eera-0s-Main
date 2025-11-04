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
  system?: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  brandContext?: BrandContext;
}

export interface ImageGenerationOptions {
  model: string;
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "4:5" | "5:4" | "2:3" | "3:2" | "21:9";
  brandContext?: BrandContext;
  negativePrompt?: string;
  imageType?: string | null;
  accountType?: "personal" | "company";
  colorConfig?: {
    mode: "brand" | "custom" | "mood";
    primary?: string;
    accent?: string;
  };
  objective?: "awareness" | "leads" | "engagement" | "recruitment";
  tone?: string;
}

export interface GeneratedText {
  content: string;
  model: string;
  tokens: number;
  cost: number;
}

export interface GeneratedImage {
  url: string; // Supabase Storage URL
  prompt?: string; // Enhanced/amplified prompt used
  model: string;
  generationTime: number;
  metadata?: {
    aspectRatio?: string;
    generationTimeMs?: number;
  };
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
  "google/gemini-2.5-flash-image-preview": {
    name: "Gemini 2.5 Flash (Premium)",
    badge: "PREMIUM",
    speed: "Fast",
    description: "Highest quality images with enhanced details and professional results",
  },
} as const;

// Lightweight defaults for Cognitive Hub
export const LIGHT_TEXT_PRIMARY = "qwen/qwen-2.5-7b-instruct";
export const LIGHT_TEXT_FALLBACK = "meta-llama/llama-3.1-8b-instruct";

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

async function enhancePromptWithBrand(
  prompt: string,
  brandContext?: BrandContext,
  platform: "linkedin" | "instagram" = "linkedin",
  imageType?: string | null,
  amplificationContext?: {
    accountType?: "personal" | "company";
    colorConfig?: {
      mode: "brand" | "custom" | "mood";
      primary?: string;
      accent?: string;
    };
    objective?: "awareness" | "leads" | "engagement" | "recruitment";
    tone?: string;
  }
): Promise<string> {
  if (!brandContext) return prompt;

  // Use Gemini enhanceImagePrompt with 10x amplification
  try {
    const { enhanceImagePrompt } = await import("./gemini");
    return await enhanceImagePrompt(prompt, brandContext, platform, imageType, amplificationContext);
  } catch (e) {
    console.warn("Gemini prompt enhancement failed, using fallback", e);
    
    // Fallback: Manual enhancement
    const { visual, voice, business } = brandContext;
    let enhanced = prompt;

    // Add visual style
    if (visual?.style) {
      enhanced += `, ${visual.style} aesthetic`;
    }

    // Add brand colors
    const primaryColor = amplificationContext?.colorConfig?.primary || visual?.colors?.primary;
    const accentColor = amplificationContext?.colorConfig?.accent || visual?.colors?.secondary;
    
    if (primaryColor && accentColor) {
      enhanced += `, brand colors ${primaryColor} and ${accentColor}`;
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

export async function preflightTextRoute(models: string[] = [LIGHT_TEXT_PRIMARY, LIGHT_TEXT_FALLBACK]): Promise<{ model: string | null; code?: number; message?: string }> {
  for (const m of models) {
    const r = await preflightModel(m);
    if (r.ok) return { model: m };
    // If credits (402) or provider 429, try next
    if (r.code && (r.code === 402 || r.code === 429)) continue;
  }
  return { model: null, message: "No available text model (rate-limited or credits required)" };
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
  const { model, prompt, system, temperature = 0.7, maxTokens = 1000, json, brandContext } = options;

  console.log("[OpenRouter Text] Starting generation:", { model, prompt, system, json });

  const startTime = Date.now();
  const apiKey = getOpenRouterKey();

  // Determine system prompt: use provided system, or derive from brand context, or default
  let systemPrompt = system;
  if (!systemPrompt && brandContext) {
    systemPrompt = `You are a professional marketing content creator for ${brandContext.business?.industry || "a business"}. 
       Brand voice: ${brandContext.voice?.tone?.join(", ") || "professional"}.
       Writing style: ${brandContext.voice?.style || "clear and engaging"}.
       Brand values: ${brandContext.voice?.values?.join(", ") || "quality and innovation"}.`;
  }
  if (!systemPrompt) {
    systemPrompt = "You are a helpful AI assistant.";
  }

  try {
    const body: any = {
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
    };

    // Add response_format for JSON mode if requested
    if (json) {
      body.response_format = { type: "json_object" };
    }

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
        body: JSON.stringify(body),
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
  const { model, prompt, aspectRatio = "1:1", brandContext, imageType, accountType, colorConfig, objective, tone } = options;

  console.log("[OpenRouter Image] Starting generation:", { model, prompt, aspectRatio, imageType, accountType, colorConfig });

  const startTime = Date.now();
  const apiKey = getOpenRouterKey();

  // Enhance prompt with 10x amplification engine
  const platform = "linkedin"; // Default, could be derived from context
  const enhancedPrompt = await enhancePromptWithBrand(
    prompt, 
    brandContext, 
    platform, 
    imageType,
    {
      accountType,
      colorConfig,
      objective,
      tone,
    }
  );
  console.log("[OpenRouter Image] Enhanced prompt (10x amplified):", enhancedPrompt);

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

    // Record prompt generation for learning (async, don't await)
    // Try to get metadata from enhanced prompt if it was stored
    const metadata = (enhancedPrompt as any).__metadata;
    
    recordPromptGenerationForLearning({
      originalPrompt: prompt,
      amplifiedPrompt: typeof enhancedPrompt === 'string' ? enhancedPrompt : (enhancedPrompt as any).prompt || enhancedPrompt,
      modelUsed: model,
      generationTimeMs: generationTime,
      success: true,
      imageUrl: publicUrl,
      aspectRatio: aspectRatio || undefined,
      accountType,
      colorConfig,
      objective,
      tone,
      imageType: imageType || undefined,
      platform,
      metadata,
    }).catch(err => {
      console.warn("[OpenRouter] Failed to record prompt learning:", err);
    });

    return {
      url: publicUrl,
      prompt: enhancedPrompt,
      model,
      generationTime,
      metadata: {
        aspectRatio: aspectRatio,
        generationTimeMs: generationTime,
      },
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
  fallbackModels: string[] = [] // No fallback - premium only
): Promise<GeneratedImage> {
  // Force premium model only - no fallback
  const premiumModel = "google/gemini-2.5-flash-image-preview";
  console.log(`[OpenRouter] Using premium model only: ${premiumModel}`);

  try {
    const result = await generateImage({
      ...options,
      model: premiumModel,
    });

    // Ensure result has prompt field for compatibility
    if (!result.prompt) {
      result.prompt = options.prompt;
    }

    return result;
  } catch (error) {
    console.error(`[OpenRouter] Premium model failed:`, error);
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Record prompt generation for learning system (async helper)
 */
async function recordPromptGenerationForLearning(params: {
  originalPrompt: string;
  amplifiedPrompt: string;
  modelUsed: string;
  generationTimeMs: number;
  success: boolean;
  imageUrl: string;
  aspectRatio?: string;
  accountType?: "personal" | "company";
  colorConfig?: {
    mode: "brand" | "custom" | "mood";
    primary?: string;
    accent?: string;
  };
  objective?: "awareness" | "leads" | "engagement" | "recruitment";
  tone?: string;
  imageType?: string;
  platform?: "linkedin" | "instagram";
  metadata?: {
    intent?: string;
    visualCues?: string[];
    mood?: string;
  };
}): Promise<void> {
  try {
    const { recordPromptGeneration } = await import("./promptLearning");
    
    // Use metadata if available, otherwise try basic extraction
    const intent = params.metadata?.intent || 
      params.amplifiedPrompt.match(/intent[:\s]+(\w+)/i)?.[1];
    
    const visualCues = params.metadata?.visualCues || 
      (params.amplifiedPrompt.match(/visual cues?:?\s*([^.]*)/i)?.[1]
        ?.split(",").map(c => c.trim()).filter(Boolean));

    await recordPromptGeneration({
      original_prompt: params.originalPrompt,
      amplified_prompt: params.amplifiedPrompt,
      model_used: params.modelUsed,
      generation_time_ms: params.generationTimeMs,
      success: params.success,
      image_url: params.imageUrl,
      aspect_ratio: params.aspectRatio,
      account_type: params.accountType,
      image_type: params.imageType,
      color_mode: params.colorConfig?.mode,
      color_primary: params.colorConfig?.primary,
      color_accent: params.colorConfig?.accent,
      objective: params.objective,
      tone: params.tone,
      platform: params.platform,
      intent_detected: intent,
      visual_cues: visualCues,
    });
  } catch (error) {
    // Fail silently - learning is optional
    console.warn("[OpenRouter] Learning system error:", error);
  }
}

