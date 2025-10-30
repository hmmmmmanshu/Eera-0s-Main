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

// Helper function to generate job description
export async function generateJobDescription(
  title: string,
  department?: string,
  additionalContext?: string
) {
  const model = await getGeminiModel();

  const prompt = `Generate a professional job description for the following role:

Role Title: ${title}
${department ? `Department: ${department}` : ""}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Please provide:
1. A compelling job summary (2-3 sentences)
2. 5-7 key responsibilities
3. 5-7 required qualifications/skills
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
  companyName: string
) {
  const model = await getGeminiModel();

  const prompt = `Generate a professional offer letter with the following details:

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

Keep it concise but complete.`;

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
 * Enhance user's prompt for image generation with brand context
 */
export async function enhanceImagePrompt(
  userPrompt: string,
  brandContext: BrandContext,
  platform: "linkedin" | "instagram"
): Promise<string> {
  const model = await getGeminiModel();

  const prompt = `You are an expert at creating detailed prompts for AI image generation tools like DALL-E, Stable Diffusion, and Midjourney.

USER'S INITIAL IDEA:
"${userPrompt}"

BRAND CONTEXT:
- Brand: ${brandContext.business.name}
- Industry: ${brandContext.business.industry}
- Visual Style: ${brandContext.visual.style}
- Brand Colors: Primary ${brandContext.visual.colors?.primary || "not specified"}, Secondary ${brandContext.visual.colors?.secondary || "not specified"}
- Mood: ${brandContext.visual.mood.join(", ")}
- Platform: ${platform}

TASK:
Transform the user's idea into a detailed, specific image generation prompt that:
1. Incorporates brand colors naturally
2. Matches the visual style (${brandContext.visual.style})
3. Captures the desired mood (${brandContext.visual.mood.join(", ")})
4. Optimized for ${platform} format ${platform === "linkedin" ? "(professional, clean, 1200x627)" : "(engaging, vibrant, 1080x1080)"}
5. Includes composition, lighting, style descriptors

Return ONLY the enhanced prompt text (no JSON, no explanation, just the prompt ready to send to an image AI).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

