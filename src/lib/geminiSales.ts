import { geminiModel } from "./gemini";
import type { SalesLead } from "@/hooks/useSalesData";

// Qualify lead and return AI confidence score
export async function qualifyLead(leadData: Partial<SalesLead>) {
  if (!geminiModel) {
    throw new Error("Gemini API not configured");
  }

  const prompt = `Analyze this sales lead and provide a qualification score:

Company: ${leadData.company || "Unknown"}
Contact: ${leadData.contact_name || "Not provided"}
Email: ${leadData.email || "Not provided"}
Source: ${leadData.source || "Unknown"}
Deal Value: $${leadData.deal_value || 0}
Business Mode: ${leadData.business_mode || "Unknown"}

Provide a JSON response with:
{
  "score": <number 0-100>,
  "reasoning": "Brief explanation of the score",
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1", "concern 2"],
  "nextAction": "Recommended next step"
}`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse AI response");
}

// Generate personalized cold email
export async function generateEmailOutreach(
  leadData: Partial<SalesLead>,
  context?: string
) {
  if (!geminiModel) {
    throw new Error("Gemini API not configured");
  }

  const prompt = `Generate a personalized cold outreach email for this sales lead:

Company: ${leadData.company || "Unknown"}
Contact Name: ${leadData.contact_name || "there"}
Business Mode: ${leadData.business_mode || "B2B"}
Source: ${leadData.source || "Unknown"}
${context ? `Additional Context: ${context}` : ""}

Requirements:
- Professional but friendly tone
- Personalized to their company/industry
- Clear value proposition
- Strong call-to-action
- Keep it concise (under 150 words)
- Subject line included

Format as:
Subject: [subject line]

[Email body]`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Predict deal win probability
export async function predictDealWinProbability(
  leadData: SalesLead,
  historicalData?: SalesLead[]
) {
  if (!geminiModel) {
    throw new Error("Gemini API not configured");
  }

  const historicalContext = historicalData
    ? `Historical data: ${historicalData.length} similar deals, ${
        historicalData.filter((l) => l.stage === "won").length
      } won`
    : "No historical data available";

  const prompt = `Predict the probability of winning this deal:

Current Lead:
- Company: ${leadData.company}
- Stage: ${leadData.stage}
- Deal Value: $${leadData.deal_value}
- Source: ${leadData.source}
- Current Progress: ${leadData.progress}%
- Days since created: ${Math.floor(
    (Date.now() - new Date(leadData.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )}

${historicalContext}

Provide JSON response:
{
  "winProbability": <number 0-100>,
  "confidence": <"high" | "medium" | "low">,
  "keyFactors": ["factor 1", "factor 2"],
  "risks": ["risk 1", "risk 2"],
  "recommendation": "Action to increase win probability"
}`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse AI response");
}

// Suggest next action for a lead
export async function suggestNextAction(leadData: SalesLead) {
  if (!geminiModel) {
    throw new Error("Gemini API not configured");
  }

  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(leadData.last_activity).getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `Suggest the next best action for this sales lead:

Lead Details:
- Company: ${leadData.company}
- Current Stage: ${leadData.stage}
- Deal Value: $${leadData.deal_value}
- Progress: ${leadData.progress}%
- Days since last activity: ${daysSinceActivity}
- AI Confidence: ${leadData.ai_confidence}%

Provide JSON response:
{
  "action": "Specific action to take",
  "priority": <"high" | "medium" | "low">,
  "reasoning": "Why this action is recommended",
  "timing": "When to take this action",
  "expectedOutcome": "What to expect from this action"
}`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse AI response");
}

// Generate tailored sales pitch
export async function generateSalesPitch(
  companyInfo: string,
  leadInfo: Partial<SalesLead>
) {
  if (!geminiModel) {
    throw new Error("Gemini API not configured");
  }

  const prompt = `Generate a tailored sales pitch for this prospect:

Your Company: ${companyInfo}

Prospect Details:
- Company: ${leadInfo.company || "Unknown"}
- Industry/Context: ${leadInfo.business_mode || "Unknown"}
- Deal Size: $${leadInfo.deal_value || 0}

Create a compelling 2-3 minute sales pitch that:
1. Opens with a hook relevant to their industry
2. Identifies their likely pain points
3. Presents your solution
4. Provides social proof/credibility
5. Ends with a clear call-to-action

Keep it conversational and benefit-focused.`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Generate AI insights from leads data
export async function generateSalesInsights(leads: SalesLead[]) {
  if (!geminiModel) {
    throw new Error("Gemini API not configured");
  }

  // Prepare summary data
  const totalLeads = leads.length;
  const stageDistribution = leads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceDistribution = leads.reduce((acc, lead) => {
    const source = lead.source || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgDealValue =
    leads.reduce((sum, l) => sum + l.deal_value, 0) / totalLeads || 0;

  const staleLead = leads.filter(
    (l) =>
      l.stage !== "won" &&
      l.stage !== "lost" &&
      Date.now() - new Date(l.last_activity).getTime() > 7 * 24 * 60 * 60 * 1000
  );

  const prompt = `Analyze this sales pipeline data and provide 3-5 actionable insights:

Pipeline Summary:
- Total Leads: ${totalLeads}
- Stage Distribution: ${JSON.stringify(stageDistribution)}
- Source Distribution: ${JSON.stringify(sourceDistribution)}
- Average Deal Value: $${avgDealValue.toFixed(0)}
- Stale Leads (>7 days no activity): ${staleLeads.length}

Provide JSON array of insights:
[
  {
    "type": "opportunity" | "risk" | "suggestion",
    "message": "Clear, actionable insight",
    "priority": "high" | "medium" | "low",
    "action": "Specific action to take"
  }
]

Focus on:
- Conversion bottlenecks
- High-value opportunities
- Stale leads needing attention
- Best-performing sources
- Quick wins`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse AI response");
}

