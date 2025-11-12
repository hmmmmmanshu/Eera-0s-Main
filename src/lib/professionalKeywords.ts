/**
 * Professional Enhancement Keyword Library
 * Structured keywords and phrases to elevate image quality in AI prompts
 * Organized by category for easy lookup and injection
 */

// ========================================
// PHOTOGRAPHY TECHNIQUE KEYWORDS
// ========================================

export const PHOTOGRAPHY_TECHNIQUES = {
  natural: [
    "natural lighting",
    "soft diffused light",
    "window light",
    "authentic lighting",
  ],
  studio: [
    "studio lighting",
    "professional lighting setup",
    "controlled shadows",
    "even illumination",
  ],
  goldenHour: [
    "golden hour lighting",
    "warm golden tones",
    "sunset glow",
    "magic hour",
  ],
  dramatic: [
    "dramatic lighting",
    "high contrast",
    "moody shadows",
    "cinematic lighting",
  ],
  flatLay: [
    "flat lay photography",
    "top-down view",
    "product photography style",
    "overhead composition",
  ],
  portrait: [
    "shallow depth of field",
    "bokeh background",
    "portrait photography",
    "focused subject",
  ],
  documentary: [
    "documentary style",
    "authentic unposed",
    "candid photography",
    "real moments",
  ],
} as const;

// ========================================
// DESIGN SOPHISTICATION KEYWORDS
// ========================================

export const DESIGN_SOPHISTICATION = {
  cleanSimple: [
    "generous white space",
    "minimal design",
    "clean composition",
    "breathing room",
  ],
  modernBold: [
    "bold graphics",
    "strong visual impact",
    "vibrant design",
    "eye-catching",
  ],
  elegantRefined: [
    "sophisticated design",
    "premium feel",
    "refined aesthetics",
    "luxury quality",
  ],
  editorial: [
    "editorial layout",
    "magazine-style",
    "high-end design",
    "publishing quality",
  ],
  minimalist: [
    "extreme simplicity",
    "essential elements only",
    "focused composition",
    "minimalist design",
  ],
} as const;

// ========================================
// PLATFORM PROFESSIONAL STANDARDS
// ========================================

export const PLATFORM_STANDARDS = {
  linkedinProfessional: [
    "corporate photography standards",
    "executive-level quality",
    "B2B professional",
    "high-trust aesthetic",
    "business-appropriate",
  ],
  linkedinCreative: [
    "creative professional",
    "innovative design",
    "B2B creative",
    "thought leadership quality",
  ],
  instagramPremium: [
    "aspirational lifestyle photography",
    "influencer-grade quality",
    "premium Instagram aesthetic",
    "high-end social media",
  ],
  instagramAuthentic: [
    "authentic high-quality",
    "real relatable",
    "professional authentic",
    "genuine quality",
  ],
} as const;

// ========================================
// INDUSTRY AESTHETIC KEYWORDS
// ========================================

export const INDUSTRY_AESTHETICS = {
  techSaaS: [
    "modern tech aesthetic",
    "clean innovative design",
    "SaaS visual language",
    "cutting-edge",
  ],
  finance: [
    "trustworthy professional",
    "conservative elegant",
    "financial services aesthetic",
    "reliable",
  ],
  creativeAgency: [
    "bold artistic",
    "experimental design",
    "creative agency style",
    "artistic innovation",
  ],
  healthcare: [
    "clean trustworthy",
    "approachable professional",
    "healthcare aesthetic",
    "caring",
  ],
  ecommerce: [
    "product-focused",
    "conversion-optimized",
    "e-commerce photography",
    "shoppable quality",
  ],
  consulting: [
    "sophisticated authoritative",
    "professional consulting",
    "expert-level quality",
    "premium",
  ],
  startup: [
    "innovative dynamic",
    "growth-focused",
    "startup aesthetic",
    "scrappy professional",
  ],
} as const;

// ========================================
// COLOR GRADING KEYWORDS
// ========================================

export const COLOR_GRADING = {
  natural: [
    "true-to-life colors",
    "natural color palette",
    "accurate color representation",
  ],
  warmInviting: [
    "warm inviting tones",
    "slightly warm color grading",
    "cozy atmosphere",
  ],
  coolProfessional: [
    "cool professional tones",
    "slightly cool color grading",
    "corporate color treatment",
  ],
  highContrast: [
    "vibrant punchy colors",
    "high contrast",
    "saturated color grading",
  ],
  mutedSophisticated: [
    "desaturated premium",
    "muted sophisticated",
    "refined color palette",
  ],
  cinematic: [
    "cinematic color grading",
    "film-like color treatment",
    "cinematic tones",
  ],
} as const;

// ========================================
// QUALITY LEVEL KEYWORDS
// ========================================

export const QUALITY_LEVELS = {
  standard: [
    "high-quality",
    "professional quality",
  ],
  professional: [
    "studio-quality",
    "professional photography",
    "editorial standards",
    "magazine-worthy",
  ],
  premium: [
    "cinematic quality",
    "studio-grade",
    "magazine-worthy",
    "premium photography",
    "award-winning quality",
  ],
} as const;

// ========================================
// TYPE DEFINITIONS
// ========================================

export type PhotographyStyle = keyof typeof PHOTOGRAPHY_TECHNIQUES;
export type DesignSophistication = keyof typeof DESIGN_SOPHISTICATION;
export type PlatformStandard = keyof typeof PLATFORM_STANDARDS;
export type IndustryAesthetic = keyof typeof INDUSTRY_AESTHETICS;
export type ColorGradingStyle = keyof typeof COLOR_GRADING;
export type QualityLevel = keyof typeof QUALITY_LEVELS;

export interface ProfessionalKeywordSettings {
  photographyStyle?: PhotographyStyle | PhotographyStyle[];
  designSophistication?: DesignSophistication;
  platformStandard?: PlatformStandard;
  industryAesthetic?: IndustryAesthetic;
  colorGrading?: ColorGradingStyle;
  qualityLevel?: QualityLevel;
}

// ========================================
// HELPER FUNCTION
// ========================================

/**
 * Get professional keywords based on settings
 * Returns array of keyword strings to inject into prompts
 * 
 * @param settings - Configuration object with style preferences
 * @returns Array of professional keyword strings
 */
export function getProfessionalKeywords(
  settings?: ProfessionalKeywordSettings
): string[] {
  if (!settings) {
    return [];
  }

  const keywords: string[] = [];

  // Photography techniques (can be array or single value)
  if (settings.photographyStyle) {
    const styles = Array.isArray(settings.photographyStyle)
      ? settings.photographyStyle
      : [settings.photographyStyle];
    
    styles.forEach((style) => {
      if (style && PHOTOGRAPHY_TECHNIQUES[style]) {
        keywords.push(...PHOTOGRAPHY_TECHNIQUES[style]);
      }
    });
  }

  // Design sophistication
  if (settings.designSophistication && DESIGN_SOPHISTICATION[settings.designSophistication]) {
    keywords.push(...DESIGN_SOPHISTICATION[settings.designSophistication]);
  }

  // Platform standards
  if (settings.platformStandard && PLATFORM_STANDARDS[settings.platformStandard]) {
    keywords.push(...PLATFORM_STANDARDS[settings.platformStandard]);
  }

  // Industry aesthetics
  if (settings.industryAesthetic && INDUSTRY_AESTHETICS[settings.industryAesthetic]) {
    keywords.push(...INDUSTRY_AESTHETICS[settings.industryAesthetic]);
  }

  // Color grading
  if (settings.colorGrading && COLOR_GRADING[settings.colorGrading]) {
    keywords.push(...COLOR_GRADING[settings.colorGrading]);
  }

  // Quality levels
  if (settings.qualityLevel && QUALITY_LEVELS[settings.qualityLevel]) {
    keywords.push(...QUALITY_LEVELS[settings.qualityLevel]);
  }

  // Remove duplicates and return
  return Array.from(new Set(keywords));
}

