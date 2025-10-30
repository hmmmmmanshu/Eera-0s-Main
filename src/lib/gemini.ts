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
let resolvedModelPromise: Promise<ReturnType<typeof genAI!.getGenerativeModel>> | null = null;
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

