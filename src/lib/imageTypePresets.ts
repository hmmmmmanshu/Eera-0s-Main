/**
 * Image Type Presets System
 * Professional design configurations for each image type
 */

import type { ImageType, ImageModel, ImageStyle } from "@/types/imageTypes";
import type { BrandContext } from "./brandContext";

export interface ImageTypePreset {
  style: ImageStyle;
  aspectRatio: "1:1" | "4:5" | "16:9" | "9:16";
  compositionInstructions: string;
  layoutGuidelines: string;
  negativePrompt: string;
  suggestedModel: ImageModel;
  textZones: string;
  examplePrompts: string[];
}

export const IMAGE_TYPE_PRESETS: Record<ImageType, ImageTypePreset> = {
  infographic: {
    style: "illustration",
    aspectRatio: "4:5",
    compositionInstructions: "Vertical layout, top-to-bottom flow, structured hierarchy with clear sections",
    layoutGuidelines: "20% top: headline zone | 60% middle: content with icons/graphics | 20% bottom: CTA/branding",
    negativePrompt: "photorealistic, cluttered, busy background, random elements, chaotic",
    suggestedModel: "dalle3",
    textZones: "Large text-safe zones for numbers, labels, and descriptions",
    examplePrompts: [
      "3-step process infographic with numbered circles and connecting arrows",
      "Data visualization showing growth metrics with bar charts and percentages",
    ],
  },
  product: {
    style: "photorealistic",
    aspectRatio: "1:1",
    compositionInstructions: "Center subject with dramatic lighting, clean background, professional studio quality",
    layoutGuidelines: "Subject in left 60% | Right 40% clean space for text overlay | Shallow depth of field",
    negativePrompt: "cluttered, multiple objects, busy background, amateur lighting, low quality",
    suggestedModel: "leonardo",
    textZones: "Right third reserved for headline and CTA text",
    examplePrompts: [
      "Laptop displaying app interface on clean desk with soft natural lighting",
      "Mobile phone mockup showing app screen, floating on gradient background",
    ],
  },
  quote: {
    style: "minimalist",
    aspectRatio: "1:1",
    compositionInstructions: "Centered large text zone, minimal graphics, elegant typography focus",
    layoutGuidelines: "60% center: quote text | 20% bottom-left: small founder photo | 20% top-right: brand accent",
    negativePrompt: "busy, cluttered, photorealistic, complex graphics, distracting elements",
    suggestedModel: "gemini",
    textZones: "Large centered zone for quote (main focus), small zone for attribution",
    examplePrompts: [
      "Inspirational quote card with elegant serif typography on clean background",
      "Customer testimonial with 5-star rating and small profile photo",
    ],
  },
  announcement: {
    style: "vibrant",
    aspectRatio: "16:9",
    compositionInstructions: "Bold, attention-grabbing, celebratory mood, dynamic composition",
    layoutGuidelines: "Top 40%: bold headline zone | Bottom 60%: supporting visual/graphic | High contrast",
    negativePrompt: "dull, muted, boring, static, low energy, corporate gray",
    suggestedModel: "sdxl",
    textZones: "Top third for headline, center for key message, bottom for CTA",
    examplePrompts: [
      "Product launch announcement with confetti and bold typography",
      "Milestone celebration graphic showing '10K users reached' with dynamic elements",
    ],
  },
  educational: {
    style: "illustration",
    aspectRatio: "4:5",
    compositionInstructions: "Clear hierarchy, numbered steps or bullet points, instructional layout",
    layoutGuidelines: "Top 15%: title | Middle 70%: content in list/grid format | Bottom 15%: branding",
    negativePrompt: "abstract, confusing, no structure, photorealistic, cluttered",
    suggestedModel: "dalle3",
    textZones: "Multiple text zones for step-by-step instructions or checklist items",
    examplePrompts: [
      "5-step tutorial with numbered icons and brief descriptions for each step",
      "Checklist graphic with checkmarks and actionable tips",
    ],
  },
  social_proof: {
    style: "photorealistic",
    aspectRatio: "1:1",
    compositionInstructions: "Trust-building elements, professional yet approachable, authentic feel",
    layoutGuidelines: "Left 40%: customer photo/logo | Right 60%: quote/results | 5-star rating prominent",
    negativePrompt: "stock photo feel, fake, overly staged, corporate stiff",
    suggestedModel: "leonardo",
    textZones: "Quote zone (main), attribution zone (name/company), results zone (metrics)",
    examplePrompts: [
      "Customer testimonial card with profile photo, quote, and company logo",
      "Case study result showing before/after metrics with client branding",
    ],
  },
  comparison: {
    style: "minimalist",
    aspectRatio: "1:1",
    compositionInstructions: "Split-screen vertical divide, clear contrast between left and right sides",
    layoutGuidelines: "Left 50%: old way/competitor | Right 50%: new way/us | Center divider line",
    negativePrompt: "cluttered, unbalanced, confusing, no clear division",
    suggestedModel: "sdxl",
    textZones: "Text zones on both sides for labels, center for 'vs' or comparison indicator",
    examplePrompts: [
      "Before and after comparison split-screen with clear visual contrast",
      "Feature comparison matrix showing checkmarks vs X marks",
    ],
  },
  event: {
    style: "vibrant",
    aspectRatio: "16:9",
    compositionInstructions: "Date/time prominent, speaker photo if applicable, urgency/FOMO elements",
    layoutGuidelines: "Top 30%: event title | Middle 40%: speaker photo/visual | Bottom 30%: date/time/CTA",
    negativePrompt: "boring, static, no energy, unclear information hierarchy",
    suggestedModel: "dalle3",
    textZones: "Large zones for event title, date/time, speaker name, registration CTA",
    examplePrompts: [
      "Webinar promotion with speaker headshot and event details prominently displayed",
      "Conference announcement with date, venue, and dynamic background graphics",
    ],
  },
};

