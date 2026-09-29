/**
 * Server-side Gemini API client for JanSanket
 * Strictly runs server-side only. GEMINI_API_KEY is never exposed to the client.
 */

import { findCanonicalDistrict, isValidCategory, isValidSeverity, InfrastructureCategory, Severity } from "./validation";

export interface GeminiExtractionResult {
  language: string;
  state: string | null;
  district: string | null;
  category: InfrastructureCategory;
  need_summary: string;
  severity: Severity;
  confidence: number;
  isFallback?: boolean;
  fallbackReason?: string;
}

const SYSTEM_INSTRUCTION = `You are an AI assistant for JanSanket, an Indian Digital Public Good infrastructure planning intelligence platform.
Your task is to analyze unstructured citizen development requests and extract structured planning evidence.
Rules:
1. Extract rather than invent.
2. Normalize Indian state and district names (e.g. "रामनगर" or "Ramanagara" -> "Ramanagara", "தருமபுரி" -> "Dharmapuri").
3. If district or state is not mentioned or uncertain, return null for those fields.
4. Categorize into exactly one of: "roads", "water", "sanitation", "healthcare", "education", "power", "transport", "other".
5. Produce a concise need summary in English (1 sentence).
6. Rate severity as "low", "medium", or "high".
7. Provide an extraction confidence score between 0.0 and 1.0.
8. Identify language code (e.g. "en", "hi", "kn", "ta").
9. Never decide public spending, budget, or project approval.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    language: {
      type: "STRING",
      description: "ISO language code, e.g. en, hi, kn, ta"
    },
    state: {
      type: "STRING",
      nullable: true,
      description: "Normalized Indian state name, or null if unmentioned/unknown"
    },
    district: {
      type: "STRING",
      nullable: true,
      description: "Normalized Indian district name, or null if unmentioned/unknown"
    },
    category: {
      type: "STRING",
      enum: ["roads", "water", "sanitation", "healthcare", "education", "power", "transport", "other"],
      description: "Standard infrastructure category"
    },
    need_summary: {
      type: "STRING",
      description: "Concise one-sentence summary of the development need in English"
    },
    severity: {
      type: "STRING",
      enum: ["low", "medium", "high"],
      description: "Severity level of the problem"
    },
    confidence: {
      type: "NUMBER",
      description: "Model confidence in extraction from 0.0 to 1.0"
    }
  },
  required: ["language", "category", "need_summary", "severity", "confidence"]
};

/**
 * Intelligent deterministic fallback when Gemini API is unavailable (503/429/network outage)
 * Implements TASK-023: Error fallback so the user is never trapped.
 */
export function getPreparedFallback(
  rawText: string,
  stateHint?: string,
  districtHint?: string,
  reason?: string
): GeminiExtractionResult {
  const lower = rawText.toLowerCase();

  // 1. Language detection heuristic
  let language = "en";
  if (/[\u0900-\u097F]/.test(rawText)) language = "hi";
  else if (/[\u0C80-\u0CFF]/.test(rawText)) language = "kn";
  else if (/[\u0B80-\u0BFF]/.test(rawText)) language = "ta";

  // 2. Category heuristic
  let category: InfrastructureCategory = "other";
  if (
    lower.includes("road") ||
    lower.includes("bridge") ||
    lower.includes("highway") ||
    lower.includes("pothole") ||
    lower.includes("सड़क") ||
    lower.includes("रस्ता") ||
    lower.includes("पुल") ||
    lower.includes("ರಸ್ತೆ") ||
    lower.includes("ಸೇತುವೆ") ||
    lower.includes("சாலை") ||
    lower.includes("பாலம்")
  ) {
    category = "roads";
  } else if (
    lower.includes("water") ||
    lower.includes("borewell") ||
    lower.includes("pipeline") ||
    lower.includes("drinking") ||
    lower.includes("पानी") ||
    lower.includes("जल") ||
    lower.includes("ನೀರು") ||
    lower.includes("ಕುಡಿಯುವ") ||
    lower.includes("குடிநீர்") ||
    lower.includes("தண்ணீர்")
  ) {
    category = "water";
  } else if (
    lower.includes("toilet") ||
    lower.includes("sewage") ||
    lower.includes("drain") ||
    lower.includes("garbage") ||
    lower.includes("शौचालय") ||
    lower.includes("नाली") ||
    lower.includes("कचरा") ||
    lower.includes("ಕಸ") ||
    lower.includes("ಚರಂಡಿ") ||
    lower.includes("சாக்கடை") ||
    lower.includes("குப்பை")
  ) {
    category = "sanitation";
  } else if (
    lower.includes("doctor") ||
    lower.includes("hospital") ||
    lower.includes("clinic") ||
    lower.includes("ambulance") ||
    lower.includes("health") ||
    lower.includes("medicine") ||
    lower.includes("अस्पताल") ||
    lower.includes("स्वास्थ्य") ||
    lower.includes("दवा") ||
    lower.includes("एम्बुलेंस") ||
    lower.includes("ಆಸ್ಪತ್ರೆ") ||
    lower.includes("ಆರೋಗ್ಯ") ||
    lower.includes("ಔಷಧ") ||
    lower.includes("மருத்துவ") ||
    lower.includes("சுகாதார") ||
    lower.includes("ஆம்புலன்ஸ்")
  ) {
    category = "healthcare";
  } else if (
    lower.includes("school") ||
    lower.includes("teacher") ||
    lower.includes("student") ||
    lower.includes("classroom") ||
    lower.includes("education") ||
    lower.includes("स्कूल") ||
    lower.includes("शिक्षा") ||
    lower.includes("ಶಾಲೆ") ||
    lower.includes("ಶಿಕ್ಷಣ") ||
    lower.includes("பள்ளி") ||
    lower.includes("கல்வி")
  ) {
    category = "education";
  } else if (
    lower.includes("power") ||
    lower.includes("electric") ||
    lower.includes("transformer") ||
    lower.includes("light") ||
    lower.includes("बिजली") ||
    lower.includes("ವಿದ್ಯುತ್") ||
    lower.includes("மின்சாரம்")
  ) {
    category = "power";
  } else if (
    lower.includes("bus") ||
    lower.includes("transport") ||
    lower.includes("बस") ||
    lower.includes("ಬಸ್") ||
    lower.includes("பேருந்து")
  ) {
    category = "transport";
  }

  // 3. Location extraction heuristic
  const foundDistrict =
    findCanonicalDistrict(districtHint) ||
    findCanonicalDistrict(stateHint) ||
    findCanonicalDistrict(rawText);

  // 4. Need summary
  const need_summary = rawText.length > 120 ? `${rawText.slice(0, 117)}...` : rawText;

  return {
    language,
    state: foundDistrict?.state || (stateHint?.trim() || null),
    district: foundDistrict?.district || (districtHint?.trim() || null),
    category,
    need_summary,
    severity: "high",
    confidence: 0.85,
    isFallback: true,
    fallbackReason: reason || "AI analysis is unavailable right now. Continue with the fallback input path."
  };
}

/**
 * Normalizes citizen text request using gemini-3.8-flash server-side
 */
export async function normalizeRequestWithGemini(
  rawText: string,
  stateHint?: string,
  districtHint?: string
): Promise<GeminiExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  if (!apiKey) {
    return getPreparedFallback(
      rawText,
      stateHint,
      districtHint,
      "AI analysis is unavailable right now (API key not configured). Continue with the fallback input path."
    );
  }

  const promptText = `Citizen Request: "${rawText}"\n${stateHint ? `State Hint: ${stateHint}\n` : ""}${districtHint ? `District Hint: ${districtHint}\n` : ""}`;

  const payload = {
    contents: [
      {
        parts: [{ text: promptText }]
      }
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000) // 12 second server-side timeout guard
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Gemini API returned ${res.status}: ${errText}`);
      return getPreparedFallback(
        rawText,
        stateHint,
        districtHint,
        `AI analysis is unavailable right now (HTTP ${res.status}). Continue with the fallback input path.`
      );
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText || typeof candidateText !== "string") {
      throw new Error("Empty candidate returned by Gemini API");
    }

    let cleanJson = candidateText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);

    // Validate and canonicalize extracted category
    const category = isValidCategory(parsed.category) ? parsed.category : "other";

    // Validate severity
    const severity = isValidSeverity(parsed.severity) ? parsed.severity : "medium";

    // Match with canonical districts
    const canonical = findCanonicalDistrict(parsed.district) || findCanonicalDistrict(districtHint);

    return {
      language: parsed.language || "en",
      state: canonical?.state || parsed.state || stateHint || null,
      district: canonical?.district || parsed.district || districtHint || null,
      category,
      need_summary: parsed.need_summary || rawText,
      severity,
      confidence: typeof parsed.confidence === "number" ? Math.min(1, Math.max(0, parsed.confidence)) : 0.9,
      isFallback: false
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.warn("Gemini normalization failure, routing to fallback:", errorMsg);
    return getPreparedFallback(
      rawText,
      stateHint,
      districtHint,
      "AI analysis is unavailable right now. Continue with the fallback input path."
    );
  }
}
