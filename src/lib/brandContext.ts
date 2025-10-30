import type { BrandProfile } from "@/hooks/useMarketingData";

// ========================================
// TYPES
// ========================================

export interface BrandContext {
  visual: {
    colors: any; // color_palette from profile
    style: string | null;
    mood: string[];
  };
  voice: {
    tone: string[] | null;
    style: string | null;
    values: string[] | null;
  };
  business: {
    name: string | null;
    industry: string | null;
    audience: string | null;
    offerings: string | null;
    stage: string | null;
  };
  constraints: {
    prohibited: string[];
    preferred: string[] | null;
  };
}

export interface EnhancedPrompt {
  prompt: string;
  negativePrompt?: string;
  styleModifiers: string[];
  brandGuidelines: string;
}

// ========================================
// BRAND CONTEXT ASSEMBLY
// ========================================

/**
 * Assembles brand context from user profile for AI prompt enhancement
 * This is the core of brand-aware AI generation
 */
export function assembleBrandContext(profile: BrandProfile): BrandContext {
  // Derive mood from tone personality
  const mood = deriveMoodFromTone(profile.tone_personality || []);

  return {
    visual: {
      colors: profile.color_palette || {},
      style: profile.design_philosophy,
      mood,
    },
    voice: {
      tone: profile.tone_personality,
      style: profile.writing_style,
      values: profile.brand_values,
    },
    business: {
      name: profile.startup_name,
      industry: profile.industry,
      audience: profile.target_audience,
      offerings: profile.key_offerings,
      stage: profile.company_stage,
    },
    constraints: {
      prohibited: profile.offlimit_topics?.split(",").map((t) => t.trim()) || [],
      preferred: profile.preferred_platforms,
    },
  };
}

/**
 * Derives visual mood descriptors from tone personality tags
 */
function deriveMoodFromTone(tones: string[]): string[] {
  const moodMap: Record<string, string[]> = {
    professional: ["clean", "polished", "corporate"],
    friendly: ["warm", "approachable", "inviting"],
    casual: ["relaxed", "informal", "easygoing"],
    authoritative: ["confident", "bold", "commanding"],
    playful: ["fun", "vibrant", "energetic"],
    inspirational: ["uplifting", "motivating", "aspirational"],
    educational: ["clear", "instructive", "informative"],
    empathetic: ["caring", "understanding", "supportive"],
  };

  const moods: string[] = [];
  tones.forEach((tone) => {
    const toneLower = tone.toLowerCase();
    if (moodMap[toneLower]) {
      moods.push(...moodMap[toneLower]);
    }
  });

  return moods.length > 0 ? moods : ["professional", "clean"];
}

// ========================================
// PROMPT ENHANCEMENT
// ========================================

/**
 * Enhances user prompt with brand context automatically
 * This is called before every AI generation request
 */
export function enhancePromptWithBrand(
  userPrompt: string,
  brandContext: BrandContext,
  generationType: "image" | "video" | "text"
): EnhancedPrompt {
  switch (generationType) {
    case "text":
      return enhanceTextPrompt(userPrompt, brandContext);
    case "image":
      return enhanceImagePrompt(userPrompt, brandContext);
    case "video":
      return enhanceVideoPrompt(userPrompt, brandContext);
    default:
      return { prompt: userPrompt, styleModifiers: [], brandGuidelines: "" };
  }
}

/**
 * Enhance text content prompts with brand voice and tone
 */
function enhanceTextPrompt(
  userPrompt: string,
  brandContext: BrandContext
): EnhancedPrompt {
  const { voice, business, constraints } = brandContext;

  // Build brand voice description
  const toneDesc =
    voice.tone?.join(", ") || "professional and approachable";
  const styleDesc = voice.style || "conversational";
  const valuesDesc = voice.values?.join(", ") || "authenticity and quality";

  // Build brand guidelines
  const brandGuidelines = `
Brand Voice Guidelines:
- Company: ${business.name || "the company"}
- Industry: ${business.industry || "technology"}
- Target Audience: ${business.audience || "professionals"}
- Tone: ${toneDesc}
- Writing Style: ${styleDesc}
- Core Values: ${valuesDesc}
${constraints.prohibited.length > 0 ? `- AVOID topics: ${constraints.prohibited.join(", ")}` : ""}
  `.trim();

  // Enhanced prompt
  const prompt = `${brandGuidelines}

Task: ${userPrompt}

Requirements:
- Match the brand tone (${toneDesc})
- Use ${styleDesc} writing style
- Align with brand values: ${valuesDesc}
- Target audience: ${business.audience || "professionals"}
${constraints.prohibited.length > 0 ? `- Do NOT mention: ${constraints.prohibited.join(", ")}` : ""}

Generate content that sounds authentic to this brand voice.`;

  return {
    prompt,
    styleModifiers: voice.tone || [],
    brandGuidelines,
  };
}

/**
 * Enhance image generation prompts with brand visual identity
 */
function enhanceImagePrompt(
  userPrompt: string,
  brandContext: BrandContext
): EnhancedPrompt {
  const { visual, business, constraints } = brandContext;

  // Extract color information
  const colors = visual.colors;
  const colorDesc = colors?.primary
    ? `primary color: ${colors.primary}, secondary: ${colors.secondary || "complementary"}`
    : "professional color palette";

  // Build style modifiers
  const styleModifiers = [
    ...visual.mood,
    visual.style || "modern",
    "high quality",
    "professional",
  ];

  // Build enhanced prompt
  const prompt = `${userPrompt}, ${styleModifiers.join(", ")}, ${colorDesc}, ${business.industry || "technology"} industry aesthetic, targeting ${business.audience || "professionals"}`;

  // Build negative prompt (what to avoid)
  const negativePrompt = [
    "low quality",
    "blurry",
    "amateur",
    "unprofessional",
    ...constraints.prohibited,
  ].join(", ");

  const brandGuidelines = `
Visual Brand Guidelines:
- Style: ${visual.style || "modern, professional"}
- Mood: ${visual.mood.join(", ")}
- Colors: ${colorDesc}
- Industry: ${business.industry || "technology"}
  `.trim();

  return {
    prompt,
    negativePrompt,
    styleModifiers,
    brandGuidelines,
  };
}

/**
 * Enhance video generation prompts with brand motion and style
 */
function enhanceVideoPrompt(
  userPrompt: string,
  brandContext: BrandContext
): EnhancedPrompt {
  const { visual, business, voice } = brandContext;

  // Derive motion style from tone
  const motionStyle = deriveMotionStyle(voice.tone || []);

  const styleModifiers = [
    ...visual.mood,
    motionStyle,
    "professional",
    "engaging",
  ];

  const colorDesc = visual.colors?.primary
    ? `incorporating ${visual.colors.primary} brand colors`
    : "using brand colors";

  const prompt = `${userPrompt}, ${styleModifiers.join(", ")} motion, ${colorDesc}, ${visual.style || "modern"} style, ${business.industry || "technology"} industry, targeting ${business.audience || "professionals"}`;

  const brandGuidelines = `
Video Brand Guidelines:
- Motion Style: ${motionStyle}
- Visual Style: ${visual.style || "modern"}
- Mood: ${visual.mood.join(", ")}
- Industry: ${business.industry || "technology"}
  `.trim();

  return {
    prompt,
    styleModifiers,
    brandGuidelines,
  };
}

/**
 * Derives motion/animation style from brand tone
 */
function deriveMotionStyle(tones: string[]): string {
  const motionMap: Record<string, string> = {
    professional: "smooth and steady",
    friendly: "gentle and flowing",
    casual: "relaxed and natural",
    authoritative: "bold and dynamic",
    playful: "energetic and bouncy",
    inspirational: "uplifting and sweeping",
    educational: "clear and deliberate",
    empathetic: "soft and caring",
  };

  for (const tone of tones) {
    const toneLower = tone.toLowerCase();
    if (motionMap[toneLower]) {
      return motionMap[toneLower];
    }
  }

  return "smooth and professional";
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generates a concise brand summary for quick context
 */
export function getBrandSummary(brandContext: BrandContext): string {
  const { business, voice } = brandContext;
  return `${business.name || "Brand"} - ${business.industry || "Technology"} company targeting ${business.audience || "professionals"}. Tone: ${voice.tone?.join(", ") || "professional"}.`;
}

/**
 * Validates if content aligns with brand constraints
 */
export function validateBrandAlignment(
  content: string,
  brandContext: BrandContext
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const contentLower = content.toLowerCase();

  // Check prohibited topics
  brandContext.constraints.prohibited.forEach((topic) => {
    if (contentLower.includes(topic.toLowerCase())) {
      violations.push(`Contains prohibited topic: ${topic}`);
    }
  });

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Extracts color hex codes from brand profile
 */
export function extractBrandColors(brandContext: BrandContext): string[] {
  const colors = brandContext.visual.colors;
  if (!colors) return [];

  const colorArray: string[] = [];
  if (colors.primary) colorArray.push(colors.primary);
  if (colors.secondary) colorArray.push(colors.secondary);
  if (colors.accent) colorArray.push(colors.accent);

  return colorArray;
}

