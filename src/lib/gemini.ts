import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PREFERRED_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim();

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Ordered list of text-generation models known to work with Google AI Studio generateContent.
// We'll try env override first, then fallbacks in order.
const FALLBACK_MODELS = [
  // User override (if any) will be tried first via getWorkingModel()
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

let cachedModelName: string | null = null;

async function tryModel(modelName: string) {
  if (!genAI) throw new Error("Gemini API not configured");
  const model = genAI.getGenerativeModel({ model: modelName });
  // Minimal, cheap probe to confirm model supports generateContent for this key
  try {
    const result = await model.generateContent("Reply with 'ok'.");
    const text = (await result.response).text().toLowerCase();
    if (text) return model; // success
  } catch (err: unknown) {
    // Swallow and return null to continue fallbacks
    return null;
  }
  return null;
}

async function getWorkingModelInternal() {
  const candidates = [PREFERRED_MODEL, ...FALLBACK_MODELS].filter(Boolean) as string[];
  for (const name of candidates) {
    const mdl = await tryModel(name);
    if (mdl) {
      cachedModelName = name;
      return mdl;
    }
  }
  throw new Error(
    "No compatible Gemini model found for this API key. Set VITE_GEMINI_MODEL or verify model access in AI Studio."
  );
}

// Public getter that lazily resolves and caches the working model
let resolvedModelPromise: Promise<any> | null = null;
export function getGeminiModel() {
  if (!genAI) throw new Error("Gemini API not configured");
  if (!resolvedModelPromise) {
    resolvedModelPromise = getWorkingModelInternal();
  }
  return resolvedModelPromise;
}

// ========================================
// COGNITIVE HUB CHAT FUNCTIONS
// ========================================

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  systemPrompt?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Generate chat response using Gemini API directly
 * Optimized for low latency in Cognitive Hub
 */
export async function generateChatResponse(options: ChatOptions): Promise<string> {
  const model = await getGeminiModel();
  const {
    systemPrompt,
    messages,
    temperature = 0.7,
    maxTokens = 1000,
    jsonMode = false,
  } = options;

  try {
    // Build prompt with system message if provided
    let fullPrompt = "";
    if (systemPrompt) {
      fullPrompt += `${systemPrompt}\n\n`;
    }

    // Add conversation history (excluding system messages from history as they're already in systemPrompt)
    for (const msg of messages) {
      if (msg.role === "system") {
        // System messages in history are added to prompt
        fullPrompt += `${msg.content}\n\n`;
      } else if (msg.role === "user") {
        fullPrompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === "assistant") {
        fullPrompt += `Assistant: ${msg.content}\n\n`;
      }
    }

    // Add instruction for JSON mode if needed
    if (jsonMode) {
      fullPrompt += "Respond with valid JSON only, no additional text or explanation.\n\n";
    }

    const generationConfig: any = {
      temperature,
      maxOutputTokens: maxTokens,
    };

    if (jsonMode) {
      // Try to use responseMimeType for JSON if supported (Gemini 2.0+)
      try {
        generationConfig.responseMimeType = "application/json";
      } catch {
        // Fallback: just rely on prompt instruction
      }
    }

    const result = await model.generateContent(fullPrompt, {
      generationConfig,
    });

    const response = await result.response;
    let text = response.text();

    // If JSON mode, try to extract JSON from response
    if (jsonMode) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }
    }

    return text;
  } catch (error: any) {
    console.error("[Gemini Chat] Generation failed:", error);
    throw new Error(`Gemini API error: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Generate chat response with streaming support
 * Returns an async generator that yields chunks of text as they arrive
 */
export async function* generateChatResponseStreaming(options: ChatOptions): AsyncGenerator<string, void, unknown> {
  const model = await getGeminiModel();
  const {
    systemPrompt,
    messages,
    temperature = 0.7,
    maxTokens = 1000,
    jsonMode = false,
  } = options;

  try {
    // Build prompt with system message if provided
    let fullPrompt = "";
    if (systemPrompt) {
      fullPrompt += `${systemPrompt}\n\n`;
    }

    // Add conversation history
    for (const msg of messages) {
      if (msg.role === "system") {
        fullPrompt += `${msg.content}\n\n`;
      } else if (msg.role === "user") {
        fullPrompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === "assistant") {
        fullPrompt += `Assistant: ${msg.content}\n\n`;
      }
    }

    if (jsonMode) {
      fullPrompt += "Respond with valid JSON only, no additional text or explanation.\n\n";
    }

    const generationConfig: any = {
      temperature,
      maxOutputTokens: maxTokens,
    };

    if (jsonMode) {
      try {
        generationConfig.responseMimeType = "application/json";
      } catch {
        // Fallback
      }
    }

    // Use streaming API - Gemini SDK uses generateContentStream method
    let fullText = "";
    try {
      const result = await model.generateContentStream(fullPrompt, {
        generationConfig,
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullText += chunkText;
          yield chunkText;
        }
      }
    } catch (streamError) {
      // Fallback to non-streaming if streaming fails
      console.warn("Streaming not available, using fallback:", streamError);
      const result = await model.generateContent(fullPrompt, {
        generationConfig,
      });
      const response = await result.response;
      const text = response.text();
      fullText = text;
      
      // Simulate streaming by yielding in word chunks for better UX
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        yield chunk;
        // Small delay to simulate streaming
        if (i % 3 === 0 && i < words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 15));
        }
      }
    }

    // If JSON mode, try to extract JSON from full response
    if (jsonMode && fullText) {
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        yield jsonMatch[0];
      }
    }
  } catch (error: any) {
    console.error("[Gemini Chat] Streaming failed:", error);
    throw new Error(`Gemini API error: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Classify chat message to determine category and hub
 */
export async function classifyChatMessage(
  message: string
): Promise<{
  hub: string | null;
  category: string;
  subcategories: string[];
  intent: string;
}> {
  const model = await getGeminiModel();

  const prompt = `Analyze this message and classify it. Output JSON with this exact structure:
{
  "hub": one of "marketing"|"sales"|"finance"|"ops"|"hr"|"legal"|"cognitive"|null,
  "category": one of "marketing"|"sales"|"finance"|"ops"|"hr"|"legal"|"cognitive"|"general",
  "subcategories": ["string1", "string2"],
  "intent": one of "plan"|"question"|"journal"|"issue"|"discussion"|"action"
}

Message: "${message}"

Return only valid JSON, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        hub: parsed.hub || null,
        category: parsed.category || "general",
        subcategories: Array.isArray(parsed.subcategories) ? parsed.subcategories : [],
        intent: parsed.intent || "question",
      };
    }

    // Fallback
    return {
      hub: null,
      category: "general",
      subcategories: [],
      intent: "question",
    };
  } catch (error) {
    console.error("[Gemini Chat] Classification failed:", error);
    // Fallback classification
    return {
      hub: null,
      category: "general",
      subcategories: [],
      intent: "question",
    };
  }
}

// Helper function to generate job description
export async function generateJobDescription(
  title: string,
  department?: string,
  additionalContext?: string,
  organizationContext?: {
    companyName?: string;
    founderName?: string;
    industry?: string;
    about?: string;
    keyOfferings?: string;
    companyStage?: string;
    tagline?: string;
    targetAudience?: string;
    competitiveEdge?: string;
    brandValues?: string[];
    websiteUrl?: string;
    marketingGoal?: string;
    tonePersonality?: string[];
    writingStyle?: string;
    languageStyle?: string;
    designPhilosophy?: string;
    inspirationalBrands?: string;
    offlimitTopics?: string;
    contentThemes?: string[];
  }
) {
  const model = await getGeminiModel();

  // Build comprehensive organization context section
  let orgContextSection = "";
  if (organizationContext) {
    const orgParts: string[] = [];
    
    // Core Company Info
    if (organizationContext.companyName) {
      orgParts.push(`Company Name: ${organizationContext.companyName}`);
    }
    if (organizationContext.founderName) {
      orgParts.push(`Founder: ${organizationContext.founderName}`);
    }
    if (organizationContext.tagline) {
      orgParts.push(`Tagline: ${organizationContext.tagline}`);
    }
    if (organizationContext.websiteUrl) {
      orgParts.push(`Website: ${organizationContext.websiteUrl}`);
    }
    
    // Business Info
    if (organizationContext.about) {
      orgParts.push(`About: ${organizationContext.about}`);
    }
    if (organizationContext.industry) {
      orgParts.push(`Industry: ${organizationContext.industry}`);
    }
    if (organizationContext.companyStage) {
      orgParts.push(`Company Stage: ${organizationContext.companyStage}`);
    }
    if (organizationContext.keyOfferings) {
      orgParts.push(`Key Offerings: ${organizationContext.keyOfferings}`);
    }
    if (organizationContext.targetAudience) {
      orgParts.push(`Target Audience: ${organizationContext.targetAudience}`);
    }
    if (organizationContext.competitiveEdge) {
      orgParts.push(`Competitive Edge: ${organizationContext.competitiveEdge}`);
    }
    if (organizationContext.marketingGoal) {
      orgParts.push(`Marketing Goal: ${organizationContext.marketingGoal}`);
    }
    
    // Brand Identity
    if (organizationContext.brandValues && organizationContext.brandValues.length > 0) {
      orgParts.push(`Brand Values: ${organizationContext.brandValues.join(", ")}`);
    }
    if (organizationContext.tonePersonality && organizationContext.tonePersonality.length > 0) {
      orgParts.push(`Tone & Personality: ${organizationContext.tonePersonality.join(", ")}`);
    }
    if (organizationContext.writingStyle) {
      orgParts.push(`Writing Style: ${organizationContext.writingStyle}`);
    }
    if (organizationContext.languageStyle) {
      orgParts.push(`Language Style: ${organizationContext.languageStyle}`);
    }
    if (organizationContext.designPhilosophy) {
      orgParts.push(`Design Philosophy: ${organizationContext.designPhilosophy}`);
    }
    
    // Additional Context
    if (organizationContext.inspirationalBrands) {
      orgParts.push(`Inspirational Brands: ${organizationContext.inspirationalBrands}`);
    }
    if (organizationContext.contentThemes && organizationContext.contentThemes.length > 0) {
      orgParts.push(`Content Themes: ${organizationContext.contentThemes.join(", ")}`);
    }
    if (organizationContext.offlimitTopics) {
      orgParts.push(`Off-Limit Topics: ${organizationContext.offlimitTopics}`);
    }

    if (orgParts.length > 0) {
      orgContextSection = `

ORGANIZATION CONTEXT (COMPREHENSIVE):
${orgParts.join("\n")}

IMPORTANT INSTRUCTIONS FOR JOB DESCRIPTION:
1. This job description MUST be tailored specifically for ${organizationContext.companyName || "this organization"}
2. Reflect the ${organizationContext.industry || "industry"} industry and ${organizationContext.companyStage || "company stage"} stage
3. Align with the organization's brand values: ${organizationContext.brandValues?.join(", ") || "authenticity, innovation"}
4. Match their ${organizationContext.tonePersonality?.join(", ") || "professional"} tone and ${organizationContext.writingStyle || "clear"} writing style
5. Incorporate their competitive edge: ${organizationContext.competitiveEdge || "innovation"}
6. Target their audience: ${organizationContext.targetAudience || "professionals"}
7. The job description should feel authentic to this organization's unique culture, values, and identity

Make the job description compelling and specific to this organization - not generic!`;
    }
  }

  const prompt = `Generate a professional job description for the following role:${orgContextSection}

Role Title: ${title}
${department ? `Department: ${department}` : ""}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Please provide:
1. A compelling job summary (2-3 sentences) that references the organization context and makes the role appealing within this specific company
2. 5-7 key responsibilities tailored to this organization and role
3. 5-7 required qualifications/skills relevant to this industry and company stage
4. Nice-to-have skills (3-4 items)

Format the response as JSON with this structure:
{
  "summary": "...",
  "responsibilities": ["...", "..."],
  "requirements": ["...", "..."],
  "niceToHave": ["...", "..."]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response");
}

// Helper function to score resume
export async function scoreResume(
  resumeText: string,
  jobRequirements: string[]
) {
  const model = await getGeminiModel();

  const prompt = `Analyze this resume against the job requirements and provide a score from 0-100.

Job Requirements:
${jobRequirements.map((req, i) => `${i + 1}. ${req}`).join("\n")}

Resume Content:
${resumeText}

Provide a JSON response with:
{
  "score": <number 0-100>,
  "strengths": ["...", "..."],
  "gaps": ["...", "..."],
  "summary": "Brief 2-3 sentence assessment"
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response");
}

// Helper function to generate offer letter
export async function generateOfferLetter(
  candidateName: string,
  role: string,
  salary: string,
  startDate: string,
  companyName: string,
  organizationContext?: {
    companyName?: string;
    founderName?: string;
    industry?: string;
    about?: string;
    companyStage?: string;
    tagline?: string;
    targetAudience?: string;
    competitiveEdge?: string;
    brandValues?: string[];
    websiteUrl?: string;
    tonePersonality?: string[];
    writingStyle?: string;
    languageStyle?: string;
  }
) {
  const model = await getGeminiModel();

  // Build comprehensive organization context section
  let orgContextSection = "";
  if (organizationContext) {
    const orgParts: string[] = [];
    
    if (organizationContext.companyName) {
      orgParts.push(`Company Name: ${organizationContext.companyName}`);
    }
    if (organizationContext.founderName) {
      orgParts.push(`Founder: ${organizationContext.founderName}`);
    }
    if (organizationContext.tagline) {
      orgParts.push(`Tagline: ${organizationContext.tagline}`);
    }
    if (organizationContext.websiteUrl) {
      orgParts.push(`Website: ${organizationContext.websiteUrl}`);
    }
    if (organizationContext.about) {
      orgParts.push(`About: ${organizationContext.about}`);
    }
    if (organizationContext.industry) {
      orgParts.push(`Industry: ${organizationContext.industry}`);
    }
    if (organizationContext.companyStage) {
      orgParts.push(`Company Stage: ${organizationContext.companyStage}`);
    }
    if (organizationContext.targetAudience) {
      orgParts.push(`Target Audience: ${organizationContext.targetAudience}`);
    }
    if (organizationContext.competitiveEdge) {
      orgParts.push(`Competitive Edge: ${organizationContext.competitiveEdge}`);
    }
    if (organizationContext.brandValues && organizationContext.brandValues.length > 0) {
      orgParts.push(`Brand Values: ${organizationContext.brandValues.join(", ")}`);
    }
    if (organizationContext.tonePersonality && organizationContext.tonePersonality.length > 0) {
      orgParts.push(`Tone & Personality: ${organizationContext.tonePersonality.join(", ")}`);
    }
    if (organizationContext.writingStyle) {
      orgParts.push(`Writing Style: ${organizationContext.writingStyle}`);
    }
    if (organizationContext.languageStyle) {
      orgParts.push(`Language Style: ${organizationContext.languageStyle}`);
    }

    if (orgParts.length > 0) {
      orgContextSection = `

ORGANIZATION CONTEXT:
${orgParts.join("\n")}

IMPORTANT: Use this organization context to make the offer letter feel authentic to ${companyName}'s culture and values. 
- Reflect their ${organizationContext.industry || "industry"} and ${organizationContext.companyStage || "stage"} stage
- Match their ${organizationContext.tonePersonality?.join(", ") || "professional"} tone
- Align with their brand values: ${organizationContext.brandValues?.join(", ") || "innovation"}
- Use their ${organizationContext.writingStyle || "professional"} writing style

Make it personal, warm, and specific to this organization - not generic!`;
    }
  }

  const prompt = `Generate a professional offer letter with the following details:${orgContextSection}

Candidate Name: ${candidateName}
Role: ${role}
Salary: ${salary}
Start Date: ${startDate}
Company Name: ${companyName}

Make it professional, warm, and include standard sections like:
- Opening congratulations
- Position details
- Compensation and benefits overview
- Start date and next steps
- Closing

Keep it concise but complete, and reflect the organization's culture and values.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// ========================================
// MARKETING CONTENT GENERATION
// ========================================

import type { BrandContext } from "./brandContext";

export interface GeneratePostParams {
  platform: "linkedin" | "instagram";
  contentType: "text" | "image" | "carousel" | "video";
  headline: string;
  keyPoints?: string;
  tone?: "quirky" | "humble" | "inspirational" | "professional" | "witty";
  objective?: "awareness" | "leads" | "engagement" | "recruitment";
  brandContext: BrandContext;
}

export interface GeneratedPostContent {
  caption: string;
  hashtags: string[];
  callToAction?: string;
  alternativeVersions: string[];
  aiReasoning: string;
  estimatedEngagement: "low" | "medium" | "high";
}

/**
 * Generate platform-optimized social media post content with brand voice
 */
export async function generatePostContent(
  params: GeneratePostParams
): Promise<GeneratedPostContent> {
  const model = await getGeminiModel();

  const {
    platform,
    contentType,
    headline,
    keyPoints,
    tone = "professional",
    objective = "engagement",
    brandContext,
  } = params;

  // Platform-specific guidelines
  const platformGuidelines =
    platform === "linkedin"
      ? `
LinkedIn Best Practices:
- Character limit: 3000 (aim for 1500-2000 for readability)
- Structure: Hook (1-2 lines) → Story/Context → Key insight → CTA
- Style: Professional storytelling, thought-leadership
- Hashtags: 3-5 professional, industry-relevant tags
- First 2 lines are critical (appears in feed before "...more")
- Use line breaks for readability
- Personal stories perform better than purely promotional
`
      : `
Instagram Best Practices:
- First 125 characters are critical (before "...more")
- Structure: Eye-catching opener → Visual description → Emoji integration → CTA
- Style: Conversational, visual-first language
- Hashtags: 10-15 mix of niche + broad tags
- Emojis enhance engagement (use 3-5 contextually)
- Short paragraphs, easy to scan
- Questions and CTAs drive comments
`;

  // Build comprehensive prompt
  const prompt = `You are an expert social media content strategist specializing in ${platform} content. Generate a ${contentType} post for ${brandContext.business.name || "this brand"}.

BRAND CONTEXT:
- Company: ${brandContext.business.name || "Not specified"}
- Industry: ${brandContext.business.industry || "Technology"}
- Target Audience: ${brandContext.business.audience || "Professionals"}
- Brand Tone: ${brandContext.voice.tone?.join(", ") || tone}
- Writing Style: ${brandContext.voice.style || "conversational"}
- Brand Values: ${brandContext.voice.values?.join(", ") || "authenticity, innovation"}
- Prohibited Topics: ${brandContext.constraints.prohibited.length > 0 ? brandContext.constraints.prohibited.join(", ") : "None"}

POST DETAILS:
- Platform: ${platform.toUpperCase()}
- Content Type: ${contentType}
- Main Headline/Topic: ${headline}
${keyPoints ? `- Key Points to Cover: ${keyPoints}` : ""}
- Desired Tone: ${tone}
- Objective: ${objective}

${platformGuidelines}

TASK:
Generate 1 primary post and 2 alternative versions that:
1. Match the brand's voice (${brandContext.voice.tone?.join(", ")})
2. Appeal to ${brandContext.business.audience}
3. Follow ${platform} best practices
4. Achieve the ${objective} objective
5. AVOID mentioning: ${brandContext.constraints.prohibited.join(", ") || "nothing specific"}

Provide response as JSON:
{
  "caption": "The primary post content (formatted with line breaks where appropriate)",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "callToAction": "Clear CTA if applicable",
  "alternativeVersions": [
    "Alternative version 1 (slightly different angle/hook)",
    "Alternative version 2 (different tone or structure)"
  ],
  "aiReasoning": "Brief explanation of the strategy (2-3 sentences): why this approach, how it aligns with brand voice, expected engagement drivers",
  "estimatedEngagement": "low|medium|high based on content quality, timing, and audience fit"
}

Make the content authentic, engaging, and true to ${brandContext.business.name || "the brand"}'s identity. For ${platform}, prioritize ${
    platform === "linkedin" ? "thought leadership and professional value" : "visual storytelling and relatability"
  }.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as GeneratedPostContent;
  }

  throw new Error("Failed to parse AI response for post generation");
}

/**
 * Generate hashtag suggestions based on content and platform
 */
export async function generateHashtags(
  content: string,
  platform: "linkedin" | "instagram",
  industry?: string,
  count: number = 10
): Promise<string[]> {
  const model = await getGeminiModel();

  const prompt = `Generate ${count} relevant hashtags for this ${platform} post:

Content: "${content}"
Industry: ${industry || "General"}

Requirements:
${
  platform === "linkedin"
    ? "- Professional, industry-specific hashtags\n- Mix of broad and niche tags\n- 3-5 total recommended"
    : "- Mix of popular and niche hashtags\n- Include trending and evergreen tags\n- 10-15 total recommended"
}

Return as JSON array: ["hashtag1", "hashtag2", ...]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\[[\s\S]*?\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse hashtag suggestions");
}

/**
 * Enhance user's prompt for image generation using 10x amplification engine
 * This now uses the new amplification system instead of basic enhancement
 */
export async function enhanceImagePrompt(
  userPrompt: string,
  brandContext: BrandContext,
  platform: "linkedin" | "instagram",
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
  // Use new 10x amplification engine if we have the context
  if (amplificationContext && imageType) {
    try {
      const { amplifyPromptForNanoBanana } = await import("./promptAmplification");
      
      // Extract headline and key points from userPrompt
      const parts = userPrompt.split(/\n|\. /);
      const headline = parts[0] || userPrompt;
      const keyPoints = parts.slice(1).join("\n") || "";

      const amplified = await amplifyPromptForNanoBanana({
        accountType: amplificationContext.accountType || "company",
        platform,
        // imageType removed - no longer used, function will default to null
        userInput: {
          headline,
          keyPoints,
        },
        brandContext,
        colorConfig: amplificationContext.colorConfig || {
          mode: "brand",
        },
        objective: amplificationContext.objective,
        tone: amplificationContext.tone,
      });

      // Store metadata for learning system
      (amplified as any).__metadata = {
        intent: amplified.intent,
        visualCues: amplified.visualCues,
        mood: amplified.mood,
      };

      return amplified.prompt;
    } catch (e) {
      console.warn("Amplification engine failed, falling back to basic enhancement", e);
      // Fall through to basic enhancement
    }
  }

  // Fallback: Basic enhancement (for backward compatibility)
  const model = await getGeminiModel();

  // Import image type presets if imageType is provided
  let presetInstructions = "";
  if (imageType) {
    try {
      const { IMAGE_TYPE_PRESETS } = await import("./imageTypePresets");
      const preset = IMAGE_TYPE_PRESETS[imageType as keyof typeof IMAGE_TYPE_PRESETS];
      if (preset) {
        presetInstructions = `
IMAGE TYPE: ${imageType}

COMPOSITION RULES:
${preset.compositionInstructions}

LAYOUT GUIDELINES:
${preset.layoutGuidelines}

TEXT ZONES (important - reserve these areas):
${preset.textZones}

STYLE: ${preset.style}
ASPECT RATIO: ${preset.aspectRatio}

REFERENCE EXAMPLES (style to emulate):
${preset.examplePrompts.map((ex, i) => `${i + 1}. ${ex}`).join("\n")}

`;
      }
    } catch (e) {
      console.warn("Failed to load image type preset", e);
    }
  }

  const prompt = `You are a professional art director specializing in ${imageType ? `${imageType} design` : "social media design"} for ${platform}.

${presetInstructions}

USER'S IDEA:
"${userPrompt}"

BRAND CONTEXT:
- Brand: ${brandContext.business.name}
- Industry: ${brandContext.business.industry}
- Primary Color: ${brandContext.visual.colors?.primary || "not specified"} (use as dominant 60%)
- Secondary Color: ${brandContext.visual.colors?.secondary || "not specified"} (use as accent 30%)
- Visual Style: ${brandContext.visual.style}
- Mood: ${brandContext.visual.mood.join(", ")}

PLATFORM OPTIMIZATION:
${platform === "linkedin" ? "Professional, clean, business-appropriate, high-trust" : "Engaging, vibrant, scroll-stopping, mobile-optimized"}

TASK:
Create a single, detailed prompt for AI image generation that:
${imageType ? `1. Follows the ${imageType} composition rules exactly
2. Reserves specified text zones (DO NOT put important graphics there)
3. Integrates brand colors naturally (${brandContext.visual.colors?.primary || "primary color"} dominant)
4. Matches the preset style
5. Optimized for the preset aspect ratio
6. Includes lighting, atmosphere, technical quality descriptors
7. Platform-optimized for ${platform}` : `1. Integrates brand colors naturally (${brandContext.visual.colors?.primary || "primary color"} dominant)
2. Matches the visual style (${brandContext.visual.style})
3. Captures the desired mood (${brandContext.visual.mood.join(", ")})
4. Includes lighting, atmosphere, technical quality descriptors
5. Platform-optimized for ${platform}`}

OUTPUT: One detailed prompt ready for AI image generation (no JSON, no explanation).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

// ========================================
// FINANCE AI FUNCTIONS
// ========================================

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceParams {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  companyInfo: {
    companyName: string;
    gstNumber?: string;
    panNumber?: string;
    address?: string;
  };
  lineItems: InvoiceLineItem[];
  dueDate: string;
  invoiceDate: string;
  gstPercentage?: number;
}

export interface GeneratedInvoice {
  invoiceNumber: string;
  formattedInvoice: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  breakdown: {
    cgst?: number;
    sgst?: number;
    igst?: number;
  };
}

/**
 * Generate a professional invoice in Indian format with GST breakdown
 */
export async function generateInvoice(
  params: InvoiceParams
): Promise<GeneratedInvoice> {
  const model = await getGeminiModel();

  const subtotal = params.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const gstPercentage = params.gstPercentage || 18;
  const gstAmount = (subtotal * gstPercentage) / 100;
  const totalAmount = subtotal + gstAmount;

  const cgst = gstAmount / 2; // 9% CGST
  const sgst = gstAmount / 2; // 9% SGST

  const prompt = `Generate a professional invoice in Indian format with GST breakdown.

INVOICE DETAILS:
- Invoice Date: ${params.invoiceDate}
- Due Date: ${params.dueDate}
- Invoice Number: (Generate sequential format like INV-${new Date().getFullYear()}-XXX)

COMPANY DETAILS (Your Company):
- Company Name: ${params.companyInfo.companyName}
${params.companyInfo.gstNumber ? `- GST Number: ${params.companyInfo.gstNumber}` : ""}
${params.companyInfo.panNumber ? `- PAN Number: ${params.companyInfo.panNumber}` : ""}
${params.companyInfo.address ? `- Address: ${params.companyInfo.address}` : ""}

CLIENT DETAILS:
- Client Name: ${params.clientName}
${params.clientEmail ? `- Email: ${params.clientEmail}` : ""}
${params.clientPhone ? `- Phone: ${params.clientPhone}` : ""}

LINE ITEMS:
${params.lineItems
  .map(
    (item, idx) =>
      `${idx + 1}. ${item.description} - Quantity: ${item.quantity}, Rate: ₹${item.rate}, Amount: ₹${item.amount}`
  )
  .join("\n")}

TAX CALCULATION:
- Subtotal: ₹${subtotal.toFixed(2)}
- GST (${gstPercentage}%): ₹${gstAmount.toFixed(2)}
  - CGST (${gstPercentage / 2}%): ₹${cgst.toFixed(2)}
  - SGST (${gstPercentage / 2}%): ₹${sgst.toFixed(2)}
- Total Amount: ₹${totalAmount.toFixed(2)}

Generate the invoice as formatted markdown with:
1. Professional header with company logo placeholder
2. Invoice number and dates
3. Bill To section (client details)
4. Itemized table with description, quantity, rate, amount
5. Tax breakdown section
6. Total amount prominently displayed
7. Payment terms and bank details placeholder
8. Footer with thank you message

Return as JSON:
{
  "invoiceNumber": "INV-YYYY-XXX",
  "formattedInvoice": "Full markdown formatted invoice text",
  "subtotal": ${subtotal},
  "gstAmount": ${gstAmount},
  "totalAmount": ${totalAmount},
  "breakdown": {
    "cgst": ${cgst},
    "sgst": ${sgst}
  }
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response for invoice generation");
}

export interface PayrollAnalysisResult {
  totalPayroll: number;
  taxEfficiency: number; // 0-100 score
  anomalies: string[];
  optimizationSuggestions: string[];
  complianceNotes: string[];
  salaryDistribution: {
    department: string;
    totalSalary: number;
    employeeCount: number;
  }[];
}

/**
 * Analyze payroll data for compliance and optimization suggestions
 */
export async function analyzePayroll(
  payrollData: any[],
  employees: any[]
): Promise<PayrollAnalysisResult> {
  const model = await getGeminiModel();

  const prompt = `Analyze payroll data for compliance and optimization suggestions.

PAYROLL DATA:
${JSON.stringify(payrollData, null, 2)}

EMPLOYEE DATA:
${JSON.stringify(employees, null, 2)}

Provide analysis covering:
1. Tax efficiency score (0-100) - how well salaries are structured for tax optimization
2. Anomalies - any unusual patterns (e.g., inconsistent deductions, missing TDS)
3. Optimization suggestions - ways to reduce tax burden legally
4. Compliance notes - any compliance risks (PF, ESI, TDS)
5. Salary distribution by department

Return as JSON:
{
  "totalPayroll": <total monthly payroll>,
  "taxEfficiency": <score 0-100>,
  "anomalies": ["anomaly1", "anomaly2"],
  "optimizationSuggestions": ["suggestion1", "suggestion2"],
  "complianceNotes": ["note1", "note2"],
  "salaryDistribution": [
    {
      "department": "Engineering",
      "totalSalary": <amount>,
      "employeeCount": <count>
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response for payroll analysis");
}

/**
 * Generate a friendly reminder for compliance tasks
 */
export async function generateComplianceReminder(
  task: {
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
  },
  daysUntilDue: number
): Promise<string> {
  const model = await getGeminiModel();

  const urgency =
    daysUntilDue < 7 ? "urgent" : daysUntilDue < 15 ? "high" : daysUntilDue < 30 ? "medium" : "low";

  const prompt = `Generate a friendly reminder for the founder about an upcoming compliance task.

TASK DETAILS:
- Title: ${task.title}
- Description: ${task.description || "No description"}
- Due Date: ${task.dueDate}
- Priority: ${task.priority}
- Days Until Due: ${daysUntilDue} days
- Urgency: ${urgency}

Generate a concise, friendly reminder (2-3 sentences) that:
1. Clearly states what needs to be done
2. Mentions the due date and urgency
3. Provides brief action steps if needed
4. Uses a supportive, helpful tone (like a virtual CFO assistant)

Keep it professional but warm. Return only the reminder text (no JSON, no quotes).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

export interface PitchDeckAnalysisResult {
  financialHealthScore: number; // 0-100
  investorReadinessScore: number; // 0-100
  keyInsights: string[];
  redFlags: string[];
  recommendations: string[];
  summary: string;
}

/**
 * Analyze pitch deck for financial soundness and investor readiness
 */
export async function analyzePitchDeck(
  deckText: string,
  companyInfo?: {
    companyName?: string;
    industry?: string;
    stage?: string;
  },
  financialData?: {
    revenue?: number;
    expenses?: number;
    runway?: number;
    burnRate?: number;
  }
): Promise<PitchDeckAnalysisResult> {
  const model = await getGeminiModel();

  const prompt = `You are a CFO. Analyze this pitch deck for financial soundness, investor readiness, and overall investment appeal.

PITCH DECK CONTENT:
${deckText.substring(0, 5000)}${deckText.length > 5000 ? "... (truncated)" : ""}

COMPANY CONTEXT:
${companyInfo ? JSON.stringify(companyInfo, null, 2) : "Not provided"}

CURRENT FINANCIAL DATA:
${financialData ? JSON.stringify(financialData, null, 2) : "Not provided"}

Provide comprehensive analysis covering:

1. FINANCIAL HEALTH SCORE (0-100):
   - Revenue growth trends
   - Unit economics (CAC, LTV, margins)
   - Cash flow sustainability
   - Burn rate and runway
   - Financial projections credibility

2. INVESTOR READINESS SCORE (0-100):
   - Clarity of value proposition
   - Market opportunity sizing
   - Competitive positioning
   - Team and execution capability
   - Financial transparency
   - Ask clarity and use of funds

3. KEY INSIGHTS:
   - 5-7 key positive points
   - What stands out favorably

4. RED FLAGS:
   - 3-5 concerns or gaps
   - Missing information
   - Unrealistic assumptions

5. RECOMMENDATIONS:
   - 5-7 actionable improvements
   - Specific areas to strengthen
   - What investors will likely ask

6. SUMMARY:
   - 2-3 sentence executive summary

Return as JSON:
{
  "financialHealthScore": <0-100>,
  "investorReadinessScore": <0-100>,
  "keyInsights": ["insight1", "insight2", ...],
  "redFlags": ["flag1", "flag2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "summary": "Executive summary here"
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response for pitch deck analysis");
}

export interface CashFlowForecast {
  months: {
    month: string;
    projectedInflow: number;
    projectedOutflow: number;
    projectedNet: number;
  }[];
  runwayExtension: number; // months
  recommendations: string[];
}

/**
 * Forecast next 3 months cash flow based on historical trends
 */
export async function generateCashFlowForecast(
  historicalData: {
    month: string;
    inflow: number;
    outflow: number;
    net: number;
  }[],
  plannedExpenses?: {
    category: string;
    amount: number;
    month: string;
  }[],
  revenueForecast?: {
    month: string;
    amount: number;
  }[]
): Promise<CashFlowForecast> {
  const model = await getGeminiModel();

  const prompt = `Forecast next 3 months cash flow based on historical trends and planned expenses.

HISTORICAL DATA (last 6 months):
${JSON.stringify(historicalData, null, 2)}

PLANNED EXPENSES:
${plannedExpenses ? JSON.stringify(plannedExpenses, null, 2) : "None provided"}

REVENUE FORECAST:
${revenueForecast ? JSON.stringify(revenueForecast, null, 2) : "None provided"}

Analyze trends and project:
1. Projected inflow for each of next 3 months
2. Projected outflow for each of next 3 months
3. Projected net cash flow
4. How many months this extends runway
5. Recommendations for optimizing cash flow

Consider:
- Historical growth/decline trends
- Seasonality if evident
- Planned expenses impact
- Revenue forecast if provided

Return as JSON:
{
  "months": [
    {
      "month": "YYYY-MM",
      "projectedInflow": <amount>,
      "projectedOutflow": <amount>,
      "projectedNet": <amount>
    }
  ],
  "runwayExtension": <months>,
  "recommendations": ["rec1", "rec2", ...]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Failed to parse AI response for cash flow forecast");
}

