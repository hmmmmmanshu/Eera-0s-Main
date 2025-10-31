/**
 * Image Type System for Marketing Hub
 * Defines the 8 professional image types for social media content
 */

export type ImageType =
  | "infographic"
  | "product"
  | "quote"
  | "announcement"
  | "educational"
  | "social_proof"
  | "comparison"
  | "event";

export type ImageModel = "gemini" | "dalle3" | "sdxl" | "leonardo";

export type ImageStyle =
  | "photorealistic"
  | "illustration"
  | "minimalist"
  | "vibrant";

export interface ImageTypeInfo {
  id: ImageType;
  icon: any; // Lucide icon component
  label: string;
  desc: string;
  platforms: ("linkedin" | "instagram")[];
}

