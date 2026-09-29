/**
 * Server-side Gemini API client for JanSanket
 * Strictly runs server-side only. GEMINI_API_KEY is never exposed to the client.
 */

import {
  findCanonicalDistrict,
  checkDistrictCoverage,
  isMeaningfulRequest,
  isValidCategory,
  isValidSeverity,
  InfrastructureCategory,
  Severity,
} from "./validation";

export interface GeminiExtractionResult {
  isValidRequest: boolean;
  rejectionReason?: string;
  source: "gemini" | "manual_fallback";
  language: string;
  originalText: string;
  state: string | null;
  district: string | null;
  category: InfrastructureCategory;
  need_summary: string;
  severity: Severity;
  confidence: number | null; // null for manual_fallback; 0.0-1.0 for Gemini
  isFallback: boolean;
  fallbackReason?: string;
  isSupportedDistrict: boolean;
  unsupportedDistrictName?: string | null;
}

const SYSTEM_INSTRUCTION = `You are an AI assistant for JanSanket, an Indian Digital Public Good infrastructure planning intelligence platform.
Your task is to analyze unstructured citizen development requests and extract structured planning evidence.
Rules:
1. Assess Validity: Determine if the request describes a real infrastructure, public service, or community development problem. If the input is random characters, keyboard gibberish, test spam, greetings, casual chit-chat, personal remarks (e.g. "sdgsafdasafd", "hello there how are you", "this is a test", "I like apples"), or contains no civic issue, set is_valid_request to false, confidence to 0.0, and provide a clear rejection_reason ("Please describe a real infrastructure or public-service problem.").
2. Extract rather than invent. Do NOT assign a default district if none was mentioned.
3. Normalize Indian state and district names if mentioned (e.g. "रामनगर" or "Ramanagara" -> "Ramanagara", "தருமபுரி" -> "Dharmapuri"). If district or state is not mentioned or uncertain, return null.
4. Categorize into exactly one of: "roads", "water", "sanitation", "healthcare", "education", "power", "transport", "other".
5. Translate & Summarize in English: Produce a clear, concise one-sentence summary of the development need strictly in ENGLISH. If the input is in Kannada, Hindi, Tamil, or any regional language, translate the meaning into English. NEVER return the original non-English script in need_summary.
6. Rate severity as "low", "medium", or "high".
7. Provide an extraction confidence score between 0.0 and 1.0 (0.0 if invalid).
8. Identify language code (e.g. "en", "hi", "kn", "ta").
9. Never decide public spending, budget, or project approval.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    is_valid_request: {
      type: "BOOLEAN",
      description: "False if the input is random characters, keyboard gibberish, test spam, or contains no civic/infrastructure problem. True if it describes a real public need."
    },
    rejection_reason: {
      type: "STRING",
      nullable: true,
      description: "If is_valid_request is false, explain why (e.g. 'Please describe a real infrastructure or public-service problem.')"
    },
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
      description: "Concise one-sentence summary of the development need strictly translated into English. Never return regional non-English script."
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
  required: ["is_valid_request", "language", "category", "need_summary", "severity", "confidence"]
};

/**
 * Deterministic fallback when Gemini API is unavailable (e.g. HTTP 429 quota exhaustion or network outage)
 * Implements strict boundaries:
 * - Detects invalid/gibberish input and marks invalid
 * - Does NOT return fake confidence
 * - Does NOT silently assign Ramanagara or any other district
 * - Translates known categories into clear English summaries instead of copying raw Indic text
 */
export function getPreparedFallback(
  rawText: string,
  stateHint?: string,
  districtHint?: string,
  reason?: string
): GeminiExtractionResult {
  // 1. Meaningfulness / gibberish check
  const meaning = isMeaningfulRequest(rawText);
  if (!meaning.isValid) {
    return {
      isValidRequest: false,
      rejectionReason: meaning.reason || "Please describe a real infrastructure or public-service problem.",
      source: "manual_fallback",
      language: "en",
      originalText: rawText,
      state: null,
      district: null,
      category: "other",
      need_summary: "",
      severity: "medium",
      confidence: null, // Zero fake confidence
      isFallback: true,
      fallbackReason: reason || "AI analysis is temporarily unavailable. You can continue using the manual fallback.",
      isSupportedDistrict: false,
      unsupportedDistrictName: null
    };
  }

  const lower = rawText.toLowerCase();

  // 2. Language detection heuristic
  let language = "en";
  if (/[\u0900-\u097F]/.test(rawText)) language = "hi";
  else if (/[\u0C80-\u0CFF]/.test(rawText)) language = "kn";
  else if (/[\u0B80-\u0BFF]/.test(rawText)) language = "ta";

  // 3. Category heuristic
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

  // 4. English normalized need summary (never copy raw Indic text into English field)
  let need_summary = "";
  if (language === "en") {
    need_summary = rawText.length > 120 ? `${rawText.slice(0, 117)}...` : rawText;
  } else {
    // Meaningful English synthesis based on detected category
    switch (category) {
      case "roads":
        need_summary = "Citizen reported village road access, damage, or connectivity issues.";
        break;
      case "water":
        need_summary = "Citizen reported drinking water supply shortage or pipeline issues.";
        break;
      case "sanitation":
        need_summary = "Citizen reported drainage overflow, sewage blockage, or waste disposal deficit.";
        break;
      case "healthcare":
        need_summary = "Citizen reported lack of primary healthcare staff, clinic access, or medicine.";
        break;
      case "education":
        need_summary = "Citizen reported school building infrastructure or classroom facility issues.";
        break;
      case "power":
        need_summary = "Citizen reported electricity outages or transformer failure.";
        break;
      case "transport":
        need_summary = "Citizen reported public transport or bus connectivity issues.";
        break;
      default:
        need_summary = "Citizen reported local public service or infrastructure need.";
    }
  }

  // 5. Location extraction & Coverage verification
  let candidateDistrict: string | null = null;
  let candidateState: string | null = null;

  if (districtHint?.trim()) {
    candidateDistrict = districtHint.trim();
  }
  if (stateHint?.trim()) {
    candidateState = stateHint.trim();
  }

  // Also check if canonical district is mentioned directly in rawText
  const districtInText = findCanonicalDistrict(rawText);
  if (districtInText) {
    candidateDistrict = districtInText.district;
    candidateState = districtInText.state;
  }

  const coverage = candidateDistrict ? checkDistrictCoverage(candidateDistrict, candidateState) : null;

  const isSupportedDistrict = Boolean(coverage?.isSupported);
  const canonicalDistrict = coverage?.isSupported ? coverage.canonical?.district || null : null;
  const canonicalState = coverage?.isSupported ? coverage.canonical?.state || null : (candidateState || null);
  const unsupportedDistrictName = candidateDistrict && !coverage?.isSupported ? candidateDistrict : null;

  return {
    isValidRequest: true,
    source: "manual_fallback",
    language,
    originalText: rawText,
    state: canonicalState,
    district: canonicalDistrict, // null if unsupported or unmentioned (NEVER default to Ramanagara)
    category,
    need_summary,
    severity: "medium",
    confidence: null, // Strictly null for fallback to avoid fake AI confidence
    isFallback: true,
    fallbackReason: reason || "AI analysis is temporarily unavailable (API quota limit reached). You can continue using the manual fallback.",
    isSupportedDistrict,
    unsupportedDistrictName
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
  // Pre-screen for meaningless input
  const preCheck = isMeaningfulRequest(rawText);
  if (!preCheck.isValid) {
    return {
      isValidRequest: false,
      rejectionReason: preCheck.reason || "Please describe a real infrastructure or public-service problem.",
      source: "gemini",
      language: "en",
      originalText: rawText,
      state: null,
      district: null,
      category: "other",
      need_summary: "",
      severity: "medium",
      confidence: 0.0,
      isFallback: false,
      isSupportedDistrict: false,
      unsupportedDistrictName: null
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  if (!apiKey) {
    return getPreparedFallback(
      rawText,
      stateHint,
      districtHint,
      "AI analysis is temporarily unavailable (API key not configured). You can continue using the manual fallback."
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
      const isQuota = res.status === 429;
      return getPreparedFallback(
        rawText,
        stateHint,
        districtHint,
        isQuota
          ? "AI analysis is temporarily unavailable (API quota limit reached). You can continue using the manual fallback."
          : `AI analysis is temporarily unavailable (HTTP ${res.status}). You can continue using the manual fallback.`
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

    // 1. Model determined the input was invalid/gibberish
    if (parsed.is_valid_request === false) {
      return {
        isValidRequest: false,
        rejectionReason: parsed.rejection_reason || "Please describe a real infrastructure or public-service problem.",
        source: "gemini",
        language: parsed.language || "en",
        originalText: rawText,
        state: null,
        district: null,
        category: "other",
        need_summary: "",
        severity: "medium",
        confidence: 0.0,
        isFallback: false,
        isSupportedDistrict: false,
        unsupportedDistrictName: null
      };
    }

    // 2. Validate and canonicalize category
    const category = isValidCategory(parsed.category) ? parsed.category : "other";

    // 3. Validate severity
    const severity = isValidSeverity(parsed.severity) ? parsed.severity : "medium";

    // 4. District validation & coverage check
    const rawDistrict = parsed.district || districtHint || null;
    const rawState = parsed.state || stateHint || null;
    const coverage = checkDistrictCoverage(rawDistrict, rawState);

    const isSupportedDistrict = Boolean(coverage.isSupported);
    const canonicalDistrict = coverage.isSupported ? coverage.canonical?.district || null : null;
    const canonicalState = coverage.isSupported ? coverage.canonical?.state || null : rawState;
    const unsupportedDistrictName = rawDistrict && !coverage.isSupported ? rawDistrict : null;

    // 5. Validated need summary (strictly in English)
    let needSummary = typeof parsed.need_summary === "string" ? parsed.need_summary.trim() : "";
    const hasIndicChars = /[\u0900-\u0D7F]/.test(needSummary);
    if (!needSummary || hasIndicChars) {
      // Synthesize clean English summary from detected category
      switch (category) {
        case "roads":
          needSummary = "Citizen reported village road access, damage, or connectivity issues.";
          break;
        case "water":
          needSummary = "Citizen reported drinking water supply shortage or pipeline issues.";
          break;
        case "sanitation":
          needSummary = "Citizen reported drainage overflow, sewage blockage, or waste disposal deficit.";
          break;
        case "healthcare":
          needSummary = "Citizen reported lack of primary healthcare staff, clinic access, or medicine.";
          break;
        case "education":
          needSummary = "Citizen reported school building infrastructure or classroom facility issues.";
          break;
        case "power":
          needSummary = "Citizen reported electricity outages or transformer failure.";
          break;
        case "transport":
          needSummary = "Citizen reported public transport or bus connectivity issues.";
          break;
        default:
          needSummary = "Citizen reported a local public infrastructure need in regional language (English translation requires manual review).";
      }
    }

    // 6. Confidence
    const confidence = typeof parsed.confidence === "number"
      ? Math.min(1, Math.max(0, Math.round(parsed.confidence * 100) / 100))
      : 0.9;

    return {
      isValidRequest: true,
      source: "gemini",
      language: parsed.language || "en",
      originalText: rawText,
      state: canonicalState,
      district: canonicalDistrict, // null if unsupported or unmentioned (NEVER default to Ramanagara)
      category,
      need_summary: needSummary,
      severity,
      confidence,
      isFallback: false,
      isSupportedDistrict,
      unsupportedDistrictName
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.warn("Gemini normalization failure, routing to fallback:", errorMsg);
    return getPreparedFallback(
      rawText,
      stateHint,
      districtHint,
      "AI analysis is temporarily unavailable. You can continue using the manual fallback."
    );
  }
}
