/**
 * Smart Defaults Engine
 * Intelligently determines professional enhancement settings based on user context
 * Provides context-aware defaults for professional image generation
 */

import type { ImageType } from "@/types/imageTypes";
import type {
  PhotographyStyle,
  DesignSophistication,
  PlatformStandard,
  IndustryAesthetic,
  ColorGradingStyle,
  QualityLevel,
  ProfessionalKeywordSettings,
} from "./professionalKeywords";

export interface SmartDefaultsContext {
  accountType: "personal" | "company";
  platform: "linkedin" | "instagram";
  imageType?: ImageType | null;
  tone?: string;
  brandProfile?: {
    industry?: string;
    style?: string;
    mood?: string[];
  };
}

export interface ProfessionalSettings extends ProfessionalKeywordSettings {
  qualityLevel: QualityLevel;
  photographyStyle: PhotographyStyle[];
  designSophistication: DesignSophistication;
  platformStandard: PlatformStandard;
  colorGrading: ColorGradingStyle;
  industryAesthetic?: IndustryAesthetic;
}

/**
 * Get default photography style based on image type
 */
export function getDefaultPhotographyStyle(
  imageType?: ImageType | null
): PhotographyStyle[] {
  if (!imageType) {
    return ["natural"];
  }

  const styleMap: Record<ImageType, PhotographyStyle[]> = {
    product: ["studio", "flatLay"],
    announcement: ["natural", "goldenHour"],
    quote: ["natural", "portrait"],
    infographic: ["flatLay", "studio"],
    social_proof: ["portrait", "natural"],
    educational: ["natural", "documentary"],
    comparison: ["studio", "flatLay"],
    event: ["natural", "documentary"],
  };

  return styleMap[imageType] || ["natural"];
}

/**
 * Get default design sophistication based on account type
 */
export function getDefaultDesignSophistication(
  accountType: "personal" | "company"
): DesignSophistication {
  if (accountType === "personal") {
    // Personal accounts: clean simple or modern bold (alternate randomly or use first)
    return "modernBold";
  }
  // Company accounts: elegant refined or editorial
  return "elegantRefined";
}

/**
 * Get default platform standard based on platform and account type
 */
export function getDefaultPlatformStandard(
  platform: "linkedin" | "instagram",
  accountType: "personal" | "company"
): PlatformStandard {
  if (platform === "linkedin") {
    return accountType === "company" ? "linkedinProfessional" : "linkedinCreative";
  }
  // Instagram
  return accountType === "company" ? "instagramPremium" : "instagramAuthentic";
}

/**
 * Get default color grading based on tone
 */
export function getDefaultColorGrading(tone?: string): ColorGradingStyle {
  if (!tone) {
    return "natural";
  }

  const toneLower = tone.toLowerCase();

  if (toneLower === "professional") {
    return "coolProfessional";
  }
  if (toneLower === "casual" || toneLower === "inspirational") {
    return "warmInviting";
  }
  if (toneLower === "humble") {
    return "natural";
  }
  if (toneLower === "witty") {
    return "highContrast";
  }

  return "natural";
}

/**
 * Map industry from brand profile to industry aesthetic
 */
export function getIndustryAestheticFromProfile(
  industry?: string
): IndustryAesthetic | undefined {
  if (!industry) {
    return undefined;
  }

  const industryLower = industry.toLowerCase();

  if (industryLower.includes("technology") || industryLower.includes("saas") || industryLower.includes("tech")) {
    return "techSaaS";
  }
  if (industryLower.includes("finance") || industryLower.includes("financial")) {
    return "finance";
  }
  if (industryLower.includes("creative") || industryLower.includes("design") || industryLower.includes("agency")) {
    return "creativeAgency";
  }
  if (industryLower.includes("healthcare") || industryLower.includes("health")) {
    return "healthcare";
  }
  if (industryLower.includes("ecommerce") || industryLower.includes("retail") || industryLower.includes("e-commerce")) {
    return "ecommerce";
  }
  if (industryLower.includes("consulting")) {
    return "consulting";
  }

  // Default to startup for unknown industries
  return "startup";
}

/**
 * Get default quality level based on image type
 */
export function getDefaultQualityLevel(imageType?: ImageType | null): QualityLevel {
  // Premium quality for product and announcement images
  if (imageType === "product" || imageType === "announcement") {
    return "premium";
  }
  // Professional quality for everything else
  return "professional";
}

/**
 * Get smart defaults based on context
 * Intelligently determines professional enhancement settings
 */
export function getSmartDefaults(
  context: SmartDefaultsContext
): ProfessionalSettings {
  const {
    accountType,
    platform,
    imageType,
    tone,
    brandProfile,
  } = context;

  // Quality level
  const qualityLevel = getDefaultQualityLevel(imageType);

  // Photography style
  const photographyStyle = getDefaultPhotographyStyle(imageType);

  // Design sophistication
  const designSophistication = getDefaultDesignSophistication(accountType);

  // Platform standard
  const platformStandard = getDefaultPlatformStandard(platform, accountType);

  // Color grading
  const colorGrading = getDefaultColorGrading(tone);

  // Industry aesthetic (optional, from brand profile)
  const industryAesthetic = getIndustryAestheticFromProfile(brandProfile?.industry);

  return {
    qualityLevel,
    photographyStyle,
    designSophistication,
    platformStandard,
    colorGrading,
    industryAesthetic,
  };
}


