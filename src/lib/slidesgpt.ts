/**
 * SlidesGPT API Client
 * 
 * Documentation: https://slidesgpt.com/docs/getting-started/introduction
 * API Reference: https://slidesgpt.com/docs/api-reference
 */

const SLIDESGPT_API_KEY = import.meta.env.VITE_SLIDESGPT_API_KEY;
const SLIDESGPT_API_BASE = "https://api.slidesgpt.com/v1";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const USE_PROXY = true; // Route through Supabase Edge Function to avoid CORS

// Prefer invoking via Supabase client to ensure proper headers (apikey/authorization)
import { supabase } from "@/integrations/supabase/client";

if (!SLIDESGPT_API_KEY) {
  console.warn("SlidesGPT API key not found. Pitch deck generation will be disabled.");
}

export interface SlidesGPTGenerateRequest {
  prompt: string;
  theme?: "default" | "modern" | "professional" | "creative" | "minimal";
  slides?: number;
}

export interface SlidesGPTPresentation {
  id: string;
  embed_url: string;
  download_url: string;
  title?: string;
  created_at?: string;
}

export interface SlidesGPTGenerateResponse {
  presentation: SlidesGPTPresentation;
  message?: string;
}

/**
 * Generate a presentation using SlidesGPT API
 */
export async function generatePresentation(
  request: SlidesGPTGenerateRequest
): Promise<SlidesGPTGenerateResponse> {
  try {
    // Prefer proxy to avoid CORS and keep key server-side
    const useProxy = USE_PROXY && SUPABASE_URL;
    let response: Response;
    if (useProxy) {
      // Use supabase.functions.invoke to attach required headers automatically
      const { data, error } = await supabase.functions.invoke("slidesgpt-generate", {
        body: {
          prompt: request.prompt,
          theme: request.theme || "professional",
          slides: request.slides || 10,
        },
      });
      if (error) {
        throw new Error(error.message || "Supabase function error");
      }
      // Normalize to expected shape
      return data as SlidesGPTGenerateResponse;
    } else {
      const url = `${SLIDESGPT_API_BASE}/presentations/generate`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (!SLIDESGPT_API_KEY) {
        throw new Error(
          "SlidesGPT API key not configured. Add VITE_SLIDESGPT_API_KEY to .env.local or enable proxy."
        );
      }
      headers["Authorization"] = `Bearer ${SLIDESGPT_API_KEY}`;
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: request.prompt,
          theme: request.theme || "professional",
          slides: request.slides || 10,
        }),
      });
    }

    if (response) {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `SlidesGPT API error: ${response.status} ${response.statusText}`
        );
      }
      const data: SlidesGPTGenerateResponse = await response.json();
      return data;
    }
  } catch (error: any) {
    console.error("SlidesGPT API error:", error);
    throw new Error(`Failed to generate presentation: ${error.message}`);
  }
}

/**
 * Get presentation details by ID
 */
export async function getPresentation(presentationId: string): Promise<SlidesGPTPresentation> {
  if (!SLIDESGPT_API_KEY) {
    throw new Error("SlidesGPT API key not configured");
  }

  try {
    const response = await fetch(`${SLIDESGPT_API_BASE}/presentations/${presentationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SLIDESGPT_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch presentation: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.presentation || data;
  } catch (error: any) {
    console.error("SlidesGPT API error:", error);
    throw new Error(`Failed to get presentation: ${error.message}`);
  }
}

/**
 * Delete a presentation
 */
export async function deletePresentation(presentationId: string): Promise<void> {
  if (!SLIDESGPT_API_KEY) {
    throw new Error("SlidesGPT API key not configured");
  }

  try {
    const response = await fetch(`${SLIDESGPT_API_BASE}/presentations/${presentationId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SLIDESGPT_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete presentation: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.error("SlidesGPT API error:", error);
    throw new Error(`Failed to delete presentation: ${error.message}`);
  }
}

/**
 * Build a comprehensive prompt for pitch deck generation
 * Combines company context, financial data, and user inputs
 */
export function buildPitchDeckPrompt(
  companyContext: {
    companyName?: string;
    industry?: string;
    description?: string;
    stage?: string;
  },
  financialData?: {
    revenue?: number;
    runway?: number;
    burnRate?: number;
    cashBalance?: number;
    growthRate?: number;
  },
  userInputs: {
    topic: string;
    keyPoints?: string[];
    targetAudience?: string;
    fundingAsk?: string;
    useOfFunds?: string;
    additionalContext?: string;
  }
): string {
  let prompt = `Create a professional investor pitch deck for ${companyContext.companyName || "a startup"}`;

  // Add company context
  if (companyContext.industry) {
    prompt += ` in the ${companyContext.industry} industry`;
  }
  if (companyContext.stage) {
    prompt += ` at ${companyContext.stage} stage`;
  }
  prompt += ".\n\n";

  // Add company description
  if (companyContext.description) {
    prompt += `Company Overview: ${companyContext.description}\n\n`;
  }

  // Add user-specified topic/theme
  if (userInputs.topic) {
    prompt += `Pitch Focus: ${userInputs.topic}\n\n`;
  }

  // Add key points
  if (userInputs.keyPoints && userInputs.keyPoints.length > 0) {
    prompt += `Key Points to Highlight:\n${userInputs.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n`;
  }

  // Add financial data
  if (financialData) {
    prompt += "Financial Highlights:\n";
    if (financialData.revenue) {
      prompt += `- Annual Revenue: $${financialData.revenue.toLocaleString()}\n`;
    }
    if (financialData.cashBalance) {
      prompt += `- Cash Balance: $${financialData.cashBalance.toLocaleString()}\n`;
    }
    if (financialData.runway) {
      prompt += `- Runway: ${financialData.runway} months\n`;
    }
    if (financialData.burnRate) {
      prompt += `- Monthly Burn Rate: $${financialData.burnRate.toLocaleString()}\n`;
    }
    if (financialData.growthRate) {
      prompt += `- Growth Rate: ${financialData.growthRate}%\n`;
    }
    prompt += "\n";
  }

  // Add target audience
  if (userInputs.targetAudience) {
    prompt += `Target Audience: ${userInputs.targetAudience}\n\n`;
  }

  // Add funding ask
  if (userInputs.fundingAsk) {
    prompt += `Funding Ask: ${userInputs.fundingAsk}\n\n`;
  }

  // Add use of funds
  if (userInputs.useOfFunds) {
    prompt += `Use of Funds: ${userInputs.useOfFunds}\n\n`;
  }

  // Add additional context
  if (userInputs.additionalContext) {
    prompt += `Additional Context: ${userInputs.additionalContext}\n\n`;
  }

  prompt += "\nCreate a comprehensive pitch deck that includes: Problem statement, Solution, Market opportunity, Business model, Traction, Financial projections, Team, Ask/Use of funds, and Vision. Make it compelling for investors.";

  return prompt;
}

