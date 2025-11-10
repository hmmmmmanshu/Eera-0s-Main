/**
 * 10X Prompt Amplification Engine
 * Transforms user input into Nano Banana-optimized, highly detailed prompts
 * Based on research from Nano Banana prompting best practices
 */

import type { ImageType } from "@/types/imageTypes";
import type { BrandContext } from "./brandContext";
import { IMAGE_TYPE_PRESETS } from "./imageTypePresets";

export interface AmplificationContext {
  accountType: "personal" | "company";
  platform: "linkedin" | "instagram";
  imageType: ImageType | null;
  userInput: {
    headline: string;
    keyPoints?: string;
  };
  brandContext: BrandContext;
  colorConfig: {
    mode: "brand" | "custom" | "mood";
    primary?: string;
    accent?: string;
  };
  objective?: "awareness" | "leads" | "engagement" | "recruitment";
  tone?: string;
}

export interface ColorIntelligence {
  primary: string;
  accent: string;
  description: string;
  psychology: string;
  application: string;
  complementary: string[];
  contrastGuidelines: string;
}

/**
 * Extract intent and visual cues from user input
 */
function extractIntent(userInput: string): {
  intent: string;
  visualCues: string[];
  mood: string;
  narrative: string;
} {
  const input = userInput.toLowerCase();
  
  // Intent detection
  let intent = "general";
  const visualCues: string[] = [];
  let mood = "professional";
  let narrative = "";

  // Milestone/Achievement detection
  if (input.match(/\d+[kkm]?\s*(users|customers|subscribers|followers)/i) || 
      input.includes("milestone") || 
      input.includes("reached") ||
      input.includes("hit")) {
    intent = "announcement";
    visualCues.push("celebratory", "achievement", "growth");
    mood = "celebratory";
    narrative = "This represents significant growth and achievement, showing momentum and success";
  }

  // Product/Feature launch
  if (input.includes("launch") || input.includes("introducing") || input.includes("new feature")) {
    intent = "product_launch";
    visualCues.push("modern", "innovative", "cutting-edge");
    mood = "exciting";
    narrative = "Showcasing innovation and forward-thinking";
  }

  // Educational/How-to
  if (input.includes("how to") || input.includes("guide") || input.includes("tips") || input.includes("steps")) {
    intent = "educational";
    visualCues.push("clear", "structured", "instructional");
    mood = "helpful";
    narrative = "Providing value through education and actionable insights";
  }

  // Social proof/Testimonial
  if (input.includes("customer") || input.includes("client") || input.includes("testimonial") || 
      input.includes("review") || input.includes("success story")) {
    intent = "social_proof";
    visualCues.push("trust-building", "authentic", "relatable");
    mood = "trustworthy";
    narrative = "Building credibility through real customer experiences";
  }

  // Quote/Inspiration
  if (input.includes('"') || input.includes("quote") || input.includes("inspiration")) {
    intent = "quote";
    visualCues.push("minimalist", "elegant", "focused");
    mood = "inspirational";
    narrative = "Sharing wisdom and insights";
  }

  // Comparison
  if (input.includes("vs") || input.includes("versus") || input.includes("compared") || 
      input.includes("before") && input.includes("after")) {
    intent = "comparison";
    visualCues.push("clear contrast", "visual divide", "balanced");
    mood = "analytical";
    narrative = "Highlighting differences and improvements";
  }

  // Event/Webinar
  if (input.includes("webinar") || input.includes("event") || input.includes("workshop") || 
      input.includes("meetup")) {
    intent = "event";
    visualCues.push("dynamic", "urgent", "engaging");
    mood = "energetic";
    narrative = "Creating FOMO and urgency around live event";
  }

  return { intent, visualCues, mood, narrative };
}

/**
 * Get color intelligence based on mode and context
 */
function getColorIntelligence(
  colorConfig: AmplificationContext["colorConfig"],
  brandContext: BrandContext,
  intent: string
): ColorIntelligence {
  let primary = colorConfig.primary || brandContext.visual.colors?.primary || "#3B82F6";
  let accent = colorConfig.accent || brandContext.visual.colors?.secondary || "#8B5CF6";

  // Mood-based color suggestion
  if (colorConfig.mode === "mood") {
    const moodColors: Record<string, { primary: string; accent: string; psychology: string }> = {
      celebratory: { primary: "#FF6B6B", accent: "#FFD93D", psychology: "Energetic, vibrant, attention-grabbing" },
      professional: { primary: "#3B82F6", accent: "#6366F1", psychology: "Trust, stability, credibility" },
      innovative: { primary: "#8B5CF6", accent: "#EC4899", psychology: "Creativity, forward-thinking, premium" },
      trustworthy: { primary: "#059669", accent: "#10B981", psychology: "Growth, success, reliability" },
      inspirational: { primary: "#6366F1", accent: "#A855F7", psychology: "Wisdom, depth, transformation" },
    };

    const selected = moodColors[intent] || moodColors.professional;
    primary = selected.primary;
    accent = selected.accent;
  }

  // Color psychology analysis
  const colorPsychologies: Record<string, string> = {
    "#3B82F6": "Professional blue: Trust, stability, corporate credibility",
    "#8B5CF6": "Creative purple: Innovation, premium, forward-thinking",
    "#FF6B6B": "Energetic red: Urgency, passion, attention",
    "#10B981": "Growth green: Success, prosperity, sustainability",
    "#FFD93D": "Vibrant yellow: Energy, optimism, creativity",
  };

  const psychology = colorPsychologies[primary] || 
    `Color ${primary}: ${intent === "celebratory" ? "Energetic and attention-grabbing" : "Professional and credible"}`;

  // Generate complementary colors
  const complementary: string[] = [];
  
  // Calculate lighter/darker variations
  const hexToRgb = hexToRgbHelper;

  function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  const primaryRgb = hexToRgb(primary);
  if (primaryRgb) {
    // Light variant (for backgrounds)
    const light = rgbToHex(
      Math.min(255, primaryRgb.r + 80),
      Math.min(255, primaryRgb.g + 80),
      Math.min(255, primaryRgb.b + 80)
    );
    complementary.push(light);
    
    // Dark variant (for text/accents)
    const dark = rgbToHex(
      Math.max(0, primaryRgb.r - 40),
      Math.max(0, primaryRgb.g - 40),
      Math.max(0, primaryRgb.b - 40)
    );
    complementary.push(dark);
  }

  return {
    primary,
    accent,
    description: `Primary color ${primary} with ${accent} accent`,
    psychology,
    application: `Use ${primary} as dominant 60% (background/base), ${accent} as accent 30% (highlights/CTAs), warm complementary tones 10% (lighting/glows)`,
    complementary,
    contrastGuidelines: "Ensure WCAG AA contrast ratio (4.5:1) for text readability. Use light backgrounds with dark text, or dark backgrounds with light text overlays.",
  };
}

/**
 * Generate scene composition based on image type
 */
function generateSceneComposition(
  imageType: ImageType | null,
  intent: string,
  visualCues: string[]
): string {
  if (!imageType) {
    return "Create a professional social media image. Composition: Balanced layout with clear subject focus.";
  }

  const preset = IMAGE_TYPE_PRESETS[imageType];
  const style = preset.style === "photorealistic" ? "photorealistic" : 
               preset.style === "illustration" ? "detailed illustration" :
               preset.style === "minimalist" ? "clean minimalist design" :
               "vibrant modern graphic";

  const compositionMap: Record<ImageType, string> = {
    infographic: `${preset.compositionInstructions}. Visual hierarchy: Top 20% headline zone, middle 60% structured content with icons/graphics/data visualizations, bottom 20% CTA/branding area. Vertical flow from top to bottom with clear section divisions.`,
    product: `${preset.compositionInstructions}. Subject placement: Product/feature in left 60% with dramatic studio lighting creating depth, right 40% clean negative space reserved for text overlay. Shallow depth of field focuses attention on subject.`,
    quote: `${preset.compositionInstructions}. Typography focus: Large centered quote text zone occupying 60% center area, minimal background graphics, small attribution zone (20% bottom-left), subtle brand accent (20% top-right).`,
    announcement: `${preset.compositionInstructions}. Dynamic layout: Top 40% bold headline zone with high contrast, bottom 60% supporting visual/graphic elements. Celebratory elements like confetti or growth indicators integrated naturally.`,
    educational: `${preset.compositionInstructions}. Instructional structure: Top 15% clear title, middle 70% content in organized list/grid format with numbered steps or bullet points, bottom 15% branding area. Clear visual hierarchy.`,
    social_proof: `${preset.compositionInstructions}. Trust layout: Left 40% customer photo/logo with authentic feel, right 60% quote/results display, prominent 5-star rating element. Balanced composition with personal touch.`,
    comparison: `${preset.compositionInstructions}. Split-screen design: Vertical center divider line, left 50% "before" or "competitor" side with muted tones, right 50% "after" or "us" side with vibrant colors. Clear visual contrast.`,
    event: `${preset.compositionInstructions}. Information hierarchy: Top 30% event title with high visibility, middle 40% speaker photo/visual element, bottom 30% date/time/registration CTA. Urgency elements like countdown timers suggested.`,
  };

  return `${style} ${preset.aspectRatio.replace(":", "-")} image. ${compositionMap[imageType]} Visual cues: ${visualCues.join(", ")}.`;
}

/**
 * Generate detailed visual specifications for Nano Banana
 */
function generateVisualSpecs(
  colorIntelligence: ColorIntelligence,
  imageType: ImageType | null,
  intent: string,
  mood: string
): string {
  const preset = imageType ? IMAGE_TYPE_PRESETS[imageType] : null;

  // Lighting based on intent and image type
  const lightingMap: Record<string, string> = {
    announcement: "Warm golden hour lighting (#FFD700) from upper right creating celebratory atmosphere, soft rim light on subject",
    product: "Professional studio softbox lighting from front with dramatic side light creating depth and dimension, shallow depth of field",
    quote: "Soft ambient lighting with subtle warm glow, minimal shadows for elegant feel",
    social_proof: "Natural, approachable lighting that feels authentic, warm but not overly staged",
    educational: "Clean, bright lighting ensuring text readability, minimal shadows for clarity",
    comparison: "Split lighting: cool tones on one side, warm tones on other side to emphasize contrast",
    event: "Dynamic lighting with energy, possibly neon accents or vibrant spotlights for urgency",
    infographic: "Even, clear lighting with high contrast for data visualization clarity",
  };

  const lighting = lightingMap[intent] || 
    (preset?.style === "photorealistic" ? "Professional studio lighting with soft shadows" :
     preset?.style === "illustration" ? "Even lighting for clarity" :
     "Warm ambient lighting");

  // Background strategy
  const backgroundStrategy = `
Background: Gradient transitioning smoothly from ${colorIntelligence.primary} in upper left to ${colorIntelligence.complementary[0] || "#E0E7FF"} (lightened variant) in lower right. 
Add subtle texture with 5% opacity film grain for authenticity. 
${intent === "product" ? "Clean, minimal background ensuring product stands out" : ""}
${intent === "quote" ? "Simple gradient or solid color background with 95% of space reserved for typography" : ""}
${intent === "announcement" ? "Dynamic background with celebratory elements like subtle confetti or growth indicators" : ""}
`.trim();

  // Color application details
  const colorApplication = `
Color Application:
- Primary ${colorIntelligence.primary}: Dominant 60% (background/base elements)
- Accent ${colorIntelligence.accent}: 30% (highlights, CTAs, key elements)
- Complementary warm tones: 10% (lighting accents, glows, depth)
- ${colorIntelligence.psychology}
- ${colorIntelligence.contrastGuidelines}
`.trim();

  return `
${backgroundStrategy}

Lighting: ${lighting}. Create depth and visual interest while maintaining ${mood} mood.

${colorApplication}

Texture: ${preset?.style === "photorealistic" ? "Smooth, professional quality" : preset?.style === "illustration" ? "Clean vector-style or detailed illustration texture" : "Subtle grain at 5% opacity for authentic feel"}.
Style: ${preset?.style || "modern professional"} aesthetic with cinematic quality.
`.trim();
}

/**
 * Generate brand and narrative context
 */
function generateNarrativeContext(
  context: AmplificationContext,
  intent: string,
  narrative: string,
  visualCues: string[]
): string {
  const { accountType, brandContext, userInput } = context;

  // Account type voice adjustment
  const voiceAdjustment = accountType === "personal" 
    ? "Authentic, human, first-person narrative style. Personal brand voice with genuine emotion and founder's authentic voice."
    : "Professional, corporate, 'we' narrative style. Official brand voice maintaining credibility and scalability.";

  // Brand integration
  const brandIntegration = `
Brand Alignment:
- Brand: ${brandContext.business.name || "Your Company"}
- Industry: ${brandContext.business.industry || "Technology"}
- Voice: ${brandContext.voice.tone?.join(", ") || "professional"} (${voiceAdjustment})
- Visual Style: ${brandContext.visual.style || "modern"}
- Mood: ${brandContext.visual.mood.join(", ") || "professional"}
- Target Audience: ${brandContext.business.audience || "Professionals"}
`.trim();

  // Narrative direction
  const narrativeDirection = `
Narrative Context:
${narrative}
Visual Story: ${visualCues.join(", ")} elements integrated naturally.
Scene incorporates: ${userInput.headline} - ${narrative}.
Objective: ${context.objective || "engagement"} - Visual should support this goal.
`.trim();

  return `${brandIntegration}\n\n${narrativeDirection}`;
}

/**
 * Generate text zones specification
 */
function generateTextZones(imageType: ImageType | null): string {
  if (!imageType) {
    return "Text Zones: Reserve 40% of image area (typically right side or bottom) for text overlay with clear negative space.";
  }

  const preset = IMAGE_TYPE_PRESETS[imageType];
  return `Text Zones (CRITICAL - Reserve these areas, DO NOT place important graphics here):
${preset.textZones}

Specific Layout: ${preset.layoutGuidelines}

Important: Maintain clear negative space in text zones. Use gradients or subtle patterns, but avoid busy graphics that compete with text readability.`;
}

/**
 * Generate negative prompt based on learnings and best practices
 */
function generateNegativePrompt(
  imageType: ImageType | null,
  intent: string,
  brandContext: BrandContext
): string {
  const preset = imageType ? IMAGE_TYPE_PRESETS[imageType] : null;
  const baseNegative = preset?.negativePrompt || "cluttered, busy background, low quality, unprofessional";

  // Intent-specific negatives
  const intentNegatives: Record<string, string> = {
    announcement: "dull, muted, static, low energy, corporate gray, boring",
    product: "cluttered, multiple competing objects, amateur lighting, stock photo feel",
    quote: "busy, distracting elements, photorealistic details that compete with text",
    social_proof: "stock photo feel, fake, overly staged, corporate stiff, inauthentic",
    educational: "abstract, confusing, no clear structure, cluttered information",
    comparison: "unbalanced, confusing layout, no clear division, cluttered",
    event: "boring, static, no urgency, unclear information hierarchy",
    infographic: "chaotic, random elements, no clear flow, photorealistic distractions",
  };

  const intentNegative = intentNegatives[intent] || "";

  // Brand-specific negatives
  const brandNegatives = brandContext.constraints?.prohibited || [];
  const brandNegativeStr = brandNegatives.length > 0 
    ? brandNegatives.map(topic => `avoid ${topic} themes`).join(", ")
    : "";

  return `${baseNegative}, ${intentNegative}, ${brandNegativeStr}, watermark, text artifacts, distorted, low quality, blurry`.replace(/,\s*,/g, ",").trim();
}

/**
 * Convert hex color code to color name
 * Simple mapping for common colors used in brand palettes
 */
function hexToColorName(hex: string): string {
  const normalizedHex = hex.toUpperCase().trim();
  
  // Common color mappings
  const colorMap: Record<string, string> = {
    "#3B82F6": "blue",
    "#2563EB": "blue",
    "#1E40AF": "dark blue",
    "#8B5CF6": "purple",
    "#7C3AED": "purple",
    "#6366F1": "indigo",
    "#EC4899": "pink",
    "#F43F5E": "rose",
    "#EF4444": "red",
    "#F59E0B": "amber",
    "#F97316": "orange",
    "#10B981": "green",
    "#059669": "emerald",
    "#14B8A6": "teal",
    "#06B6D4": "cyan",
    "#0EA5E9": "sky blue",
    "#FFD93D": "yellow",
    "#FBBF24": "gold",
    "#64748B": "slate",
    "#475569": "dark slate",
    "#1E293B": "dark",
    "#FFFFFF": "white",
    "#000000": "black",
    "#F3F4F6": "light gray",
    "#E5E7EB": "gray",
  };
  
  // Exact match
  if (colorMap[normalizedHex]) {
    return colorMap[normalizedHex];
  }
  
  // Try to match by RGB values for common colors
  const rgb = hexToRgbHelper(hex);
  if (rgb) {
    // Blue range
    if (rgb.b > rgb.r && rgb.b > rgb.g && rgb.b > 150) {
      if (rgb.b > 200) return "bright blue";
      return "blue";
    }
    // Green range
    if (rgb.g > rgb.r && rgb.g > rgb.b && rgb.g > 150) {
      if (rgb.g > 200) return "bright green";
      return "green";
    }
    // Red/Pink range
    if (rgb.r > rgb.g && rgb.r > rgb.b && rgb.r > 150) {
      if (rgb.r > 200 && rgb.b > 100) return "pink";
      if (rgb.r > 200) return "red";
      return "coral";
    }
    // Purple range
    if (rgb.r > 100 && rgb.b > 100 && rgb.g < 100) {
      return "purple";
    }
    // Yellow/Orange range
    if (rgb.r > 150 && rgb.g > 150 && rgb.b < 100) {
      if (rgb.r > rgb.g) return "orange";
      return "yellow";
    }
  }
  
  // Fallback: return generic description
  return "brand color";
}

/**
 * Helper function to convert hex to RGB
 * Shared utility for color conversions
 */
function hexToRgbHelper(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Get mood-based color description
 */
function getMoodColors(imageType: ImageType | null, tone: string): string {
  const moodMap: Record<string, string> = {
    celebratory: "warm celebratory colors",
    milestone: "warm celebratory colors",
    announcement: "vibrant energetic colors",
    product: "modern innovative colors",
    quote: "sophisticated thoughtful colors",
    educational: "clear professional colors",
    social_proof: "trustworthy authentic colors",
    comparison: "contrasting dynamic colors",
    event: "energetic engaging colors",
  };
  
  const toneMap: Record<string, string> = {
    professional: "professional blue tones",
    casual: "warm approachable colors",
    humble: "muted authentic colors",
    inspirational: "uplifting vibrant colors",
    witty: "playful energetic colors",
  };
  
  if (imageType && moodMap[imageType]) {
    return moodMap[imageType];
  }
  
  if (tone && toneMap[tone.toLowerCase()]) {
    return toneMap[tone.toLowerCase()];
  }
  
  return "professional brand colors";
}

/**
 * Get what to show based on headline and image type
 */
function getWhatToShow(headline: string, imageType: ImageType | null, keyPoints?: string): string {
  if (!imageType) {
    return headline.toLowerCase();
  }
  
  const typeMap: Record<ImageType, string> = {
    announcement: "milestone celebration or achievement",
    product: "product feature or innovation",
    quote: "inspiring quote or insight",
    infographic: "data visualization or process",
    educational: "instructional content or guide",
    social_proof: "customer success or testimonial",
    comparison: "before and after comparison",
    event: "upcoming event or webinar",
  };
  
  return typeMap[imageType] || headline.toLowerCase();
}

/**
 * Get atmosphere based on image type and tone
 */
function getAtmosphere(imageType: ImageType | null, tone: string): string {
  const atmosphereMap: Record<string, string> = {
    announcement: "celebratory but humble atmosphere",
    milestone: "celebratory but humble atmosphere",
    product: "exciting and innovative atmosphere",
    quote: "inspirational and thoughtful atmosphere",
    infographic: "clear and informative atmosphere",
    educational: "helpful and instructive atmosphere",
    social_proof: "trustworthy and authentic atmosphere",
    comparison: "analytical and clear atmosphere",
    event: "energetic and engaging atmosphere",
  };
  
  if (imageType && atmosphereMap[imageType]) {
    return atmosphereMap[imageType];
  }
  
  // Fallback to tone-based atmosphere
  const toneAtmosphere: Record<string, string> = {
    professional: "professional and polished atmosphere",
    casual: "relaxed and approachable atmosphere",
    humble: "authentic and genuine atmosphere",
    inspirational: "uplifting and motivating atmosphere",
    witty: "playful and engaging atmosphere",
  };
  
  return toneAtmosphere[tone.toLowerCase()] || "professional atmosphere";
}

/**
 * Build simple, concise prompt for Gemini image generation (50-80 words)
 * Optimized for founder/startup content with natural language
 */
export function buildSimpleGeminiPrompt(params: {
  accountType: "personal" | "company";
  platform: "linkedin" | "instagram";
  imageType: ImageType | null;
  headline: string;
  keyPoints?: string;
  colorMode: "brand" | "custom" | "mood";
  customColors?: { primary: string; accent: string };
  brandColors?: { primary: string; accent: string };
  tone: string;
  styleVariation: "minimal" | "bold" | "elegant";
  aspectRatio: "1:1" | "4:5" | "16:9" | "9:16";
}): string {
  const {
    accountType,
    platform,
    imageType,
    headline,
    keyPoints,
    colorMode,
    customColors,
    brandColors,
    tone,
    styleVariation,
    aspectRatio,
  } = params;
  
  // 1. Opening: Professional [image type] for [platform], showing [what to show]
  const imageTypeLabel = imageType || "social media image";
  const whatToShow = getWhatToShow(headline, imageType, keyPoints);
  const opening = `Professional ${imageTypeLabel} for ${platform}, showing ${whatToShow}`;
  
  // 2. Account Type Context
  const accountContext = accountType === "personal"
    ? "Authentic founder moment, relatable and human"
    : "Polished corporate brand style";
  
  // 3. Style based on styleVariation
  const styleMap: Record<"minimal" | "bold" | "elegant", string> = {
    minimal: "Modern minimal style, clean centered composition",
    bold: "Bold graphic style, vibrant colors, eye-catching design",
    elegant: "Elegant professional style, sophisticated design",
  };
  const style = styleMap[styleVariation];
  
  // 4. Colors based on colorMode
  let colors = "";
  if (colorMode === "brand" && brandColors) {
    const primaryColor = hexToColorName(brandColors.primary);
    const accentColor = brandColors.accent ? hexToColorName(brandColors.accent) : null;
    colors = accentColor 
      ? `${primaryColor} and ${accentColor} brand colors`
      : `${primaryColor} brand colors`;
  } else if (colorMode === "custom" && customColors) {
    const primaryColor = hexToColorName(customColors.primary);
    const accentColor = customColors.accent ? hexToColorName(customColors.accent) : null;
    colors = accentColor
      ? `${primaryColor} and ${accentColor} colors`
      : `${primaryColor} colors`;
  } else {
    // mood mode
    colors = getMoodColors(imageType, tone);
  }
  
  // 5. Mood/Atmosphere
  const atmosphere = getAtmosphere(imageType, tone);
  
  // 6. Layout Hint
  const layoutHint = "Clean space for headline text overlay on top";
  
  // 7. Aspect Ratio
  const aspectRatioDesc = aspectRatio === "1:1" 
    ? "square format (1:1 aspect ratio)"
    : aspectRatio === "4:5"
    ? "portrait format (4:5 aspect ratio)"
    : aspectRatio === "16:9"
    ? "landscape format (16:9 aspect ratio)"
    : "vertical format (9:16 aspect ratio)";
  
  // 8. Quality
  const quality = imageType === "product" || imageType === "social_proof"
    ? "High-quality professional photography quality"
    : "High-quality professional design quality";
  
  // Assemble the prompt
  const promptParts = [
    opening,
    accountContext,
    style,
    `with ${colors}`,
    atmosphere,
    layoutHint,
    aspectRatioDesc,
    quality,
  ];
  
  let prompt = promptParts.join(". ") + ".";
  
  // Ensure word count is between 50-80 words
  const wordCount = prompt.split(/\s+/).length;
  
  if (wordCount > 80) {
    // Trim if too long - remove less critical parts
    prompt = [
      opening,
      accountContext,
      style,
      `with ${colors}`,
      atmosphere,
      aspectRatioDesc,
      quality,
    ].join(". ") + ".";
  }
  
  if (wordCount < 50) {
    // Add more detail if too short
    const additionalDetail = keyPoints 
      ? ` Highlighting ${keyPoints.split(/[,\n]/)[0].trim().toLowerCase()}`
      : "";
    prompt = [
      opening,
      accountContext,
      style,
      `with ${colors}`,
      atmosphere,
      layoutHint,
      quality + additionalDetail,
    ].join(". ") + ".";
  }
  
  return prompt;
}

/**
 * Main amplification function - transforms user input into 10x Nano Banana prompt
 * Returns both the prompt and extracted metadata for learning
 */
export async function amplifyPromptForNanoBanana(
  context: AmplificationContext
): Promise<{
  prompt: string;
  intent: string;
  visualCues: string[];
  mood: string;
}> {
  const { userInput, imageType, platform } = context;

  // Step 1: Extract intent
  const { intent, visualCues, mood, narrative } = extractIntent(
    `${userInput.headline}. ${userInput.keyPoints || ""}`
  );

  // Step 2: Get color intelligence
  const colorIntelligence = getColorIntelligence(
    context.colorConfig,
    context.brandContext,
    intent
  );

  // Step 3: Generate scene composition
  const sceneComposition = generateSceneComposition(imageType, intent, visualCues);

  // Step 4: Generate visual specifications
  const visualSpecs = generateVisualSpecs(colorIntelligence, imageType, intent, mood);

  // Step 5: Generate narrative context
  const narrativeContext = generateNarrativeContext(
    context,
    intent,
    narrative,
    visualCues
  );

  // Step 6: Text zones
  const textZones = generateTextZones(imageType);

  // Step 7: Negative prompt
  const negativePrompt = generateNegativePrompt(imageType, intent, context.brandContext);

  // Step 8: Assemble final Gemini-optimized prompt
  // Gemini works best with clear, structured prompts that are visual-first
  // Format: Single paragraph with key visual elements prioritized
  const platformStyle = platform === "linkedin" 
    ? "Professional, clean, business-appropriate, high-trust, optimized for feed scrolling" 
    : "Engaging, vibrant, scroll-stopping, mobile-optimized, Instagram feed aesthetic";
  
  // Condense visual specs to key points (remove excessive newlines)
  const visualSpecsCondensed = visualSpecs
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('. ')
    .replace(/\. \./g, '.')
    .replace(/\s+/g, ' ');
  
  // Condense narrative to essential brand context
  const narrativeCondensed = narrativeContext
    .split('\n')
    .slice(0, 4)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.includes(':'))
    .join('. ')
    .replace(/\s+/g, ' ');
  
  // Condense text zones to first line only (most important)
  const textZonesCondensed = textZones.split('\n')[0].trim();
  
  // Build optimized prompt: Scene + Visuals + Context + Requirements
  const finalPrompt = `${sceneComposition} ${visualSpecsCondensed} ${narrativeCondensed} ${textZonesCondensed}. Platform style: ${platformStyle}. Quality requirements: Ultra-detailed, professional photography/design quality, 8k resolution, cinematic lighting, perfect composition, brand-consistent. Avoid: ${negativePrompt}`.trim();

  return {
    prompt: finalPrompt,
    intent,
    visualCues,
    mood,
  };
}

