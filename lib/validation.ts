/**
 * Validation rules and canonical references for JanSanket
 * Implements strict schema, semantic, and demo coverage validation.
 * Guarantees that invalid or out-of-scope model output cannot silently reach the database.
 */

import { InfrastructureCategory, Severity } from "./demo-data";
export type { InfrastructureCategory, Severity };

export const SUPPORTED_STATES_AND_DISTRICTS: Record<string, string[]> = {
  Karnataka: ["Ramanagara", "Tumakuru"],
  "Uttar Pradesh": ["Bahraich", "Varanasi"],
  Rajasthan: ["Barmer", "Dausa"],
  "Tamil Nadu": ["Dharmapuri", "Madurai"]
};

export const ALL_SUPPORTED_DISTRICTS = Object.entries(SUPPORTED_STATES_AND_DISTRICTS).flatMap(
  ([state, districts]) => districts.map((district) => ({ state, district }))
);

export const ALLOWED_CATEGORIES: InfrastructureCategory[] = [
  "roads",
  "water",
  "sanitation",
  "healthcare",
  "education",
  "power",
  "transport",
  "other"
];

export const ALLOWED_SEVERITIES: Severity[] = ["low", "medium", "high"];

export const ALLOWED_SOURCES = ["text", "voice", "manual_fallback"] as const;
export type RequestSource = (typeof ALLOWED_SOURCES)[number];

export function isValidCategory(cat: unknown): cat is InfrastructureCategory {
  if (typeof cat !== "string") return false;
  return ALLOWED_CATEGORIES.includes(cat.trim().toLowerCase() as InfrastructureCategory);
}

export function isValidSeverity(sev: unknown): sev is Severity {
  if (typeof sev !== "string") return false;
  return ALLOWED_SEVERITIES.includes(sev.trim().toLowerCase() as Severity);
}

export function isValidSource(source: unknown): source is RequestSource {
  if (typeof source !== "string") return false;
  return (ALLOWED_SOURCES as readonly string[]).includes(source.trim());
}

const DISTRICT_ALIASES: Record<string, { state: string; district: string }> = {
  // Ramanagara
  ramanagara: { state: "Karnataka", district: "Ramanagara" },
  ramnagar: { state: "Karnataka", district: "Ramanagara" },
  "ರಾಮನಗರ": { state: "Karnataka", district: "Ramanagara" },
  "रामनगर": { state: "Karnataka", district: "Ramanagara" },

  // Tumakuru
  tumakuru: { state: "Karnataka", district: "Tumakuru" },
  tumkur: { state: "Karnataka", district: "Tumakuru" },
  "ತುಮಕೂರು": { state: "Karnataka", district: "Tumakuru" },
  "तुमकुर": { state: "Karnataka", district: "Tumakuru" },

  // Bahraich
  bahraich: { state: "Uttar Pradesh", district: "Bahraich" },
  "बहराइच": { state: "Uttar Pradesh", district: "Bahraich" },
  "ಬಹ್ರೈಚ್": { state: "Uttar Pradesh", district: "Bahraich" },

  // Varanasi
  varanasi: { state: "Uttar Pradesh", district: "Varanasi" },
  banaras: { state: "Uttar Pradesh", district: "Varanasi" },
  kashi: { state: "Uttar Pradesh", district: "Varanasi" },
  "वाराणसी": { state: "Uttar Pradesh", district: "Varanasi" },
  "बनारस": { state: "Uttar Pradesh", district: "Varanasi" },
  "ವಾರಣಾಸಿ": { state: "Uttar Pradesh", district: "Varanasi" },

  // Barmer
  barmer: { state: "Rajasthan", district: "Barmer" },
  "बाड़मेर": { state: "Rajasthan", district: "Barmer" },
  "ಬಾರ್ಮರ್": { state: "Rajasthan", district: "Barmer" },

  // Dausa
  dausa: { state: "Rajasthan", district: "Dausa" },
  "दौसा": { state: "Rajasthan", district: "Dausa" },
  "ದೌಸಾ": { state: "Rajasthan", district: "Dausa" },

  // Dharmapuri
  dharmapuri: { state: "Tamil Nadu", district: "Dharmapuri" },
  "தருமபுரி": { state: "Tamil Nadu", district: "Dharmapuri" },
  "धर्मपुरी": { state: "Tamil Nadu", district: "Dharmapuri" },
  "ಧರ್ಮಪುರಿ": { state: "Tamil Nadu", district: "Dharmapuri" },

  // Madurai
  madurai: { state: "Tamil Nadu", district: "Madurai" },
  "மதுரை": { state: "Tamil Nadu", district: "Madurai" },
  "मदुरै": { state: "Tamil Nadu", district: "Madurai" },
  "ಮಧುರೈ": { state: "Tamil Nadu", district: "Madurai" },
};

/**
 * Matches a district string against the canonical 8 pilot districts.
 * Returns state and canonical district name, or null if unrecognized.
 */
export function findCanonicalDistrict(districtStr?: string | null): { state: string; district: string } | null {
  if (!districtStr || typeof districtStr !== "string") return null;
  const clean = districtStr.trim().toLowerCase();

  for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
    if (clean === alias.toLowerCase() || clean.includes(alias.toLowerCase())) {
      return canonical;
    }
  }

  for (const [state, districts] of Object.entries(SUPPORTED_STATES_AND_DISTRICTS)) {
    for (const d of districts) {
      if (clean === d.toLowerCase() || clean.includes(d.toLowerCase()) || d.toLowerCase().includes(clean)) {
        return { state, district: d };
      }
    }
  }
  return null;
}

export interface DistrictCoverageResult {
  isSupported: boolean;
  canonical: { state: string; district: string } | null;
  rawDistrict?: string;
  rawState?: string;
  message?: string;
}

/**
 * Validates whether a specified district falls within the 8 pilot districts.
 * Never silently defaults or replaces an unsupported district.
 */
export function checkDistrictCoverage(districtStr?: string | null, stateStr?: string | null): DistrictCoverageResult {
  if (!districtStr || typeof districtStr !== "string" || !districtStr.trim()) {
    return {
      isSupported: false,
      canonical: null,
      message: "No district specified."
    };
  }

  const clean = districtStr.trim();
  const canonical = findCanonicalDistrict(clean);

  if (canonical) {
    return {
      isSupported: true,
      canonical,
      rawDistrict: clean,
      rawState: stateStr?.trim()
    };
  }

  return {
    isSupported: false,
    canonical: null,
    rawDistrict: clean,
    rawState: stateStr?.trim(),
    message: `District "${clean}" is outside the current demo coverage (8 pilot districts). Please select a supported district.`
  };
}

/**
 * Detects obviously meaningless / invalid / gibberish text.
 * Ensures random inputs such as "sdgsafdasafd" cannot be processed as valid requests.
 */
export function isMeaningfulRequest(text?: string | null): { isValid: boolean; reason?: string } {
  const genericError = "Please describe a real infrastructure or public-service problem.";

  if (!text || typeof text !== "string") {
    return { isValid: false, reason: genericError };
  }

  const clean = text.trim();
  if (clean.length < 5) {
    return { isValid: false, reason: "Please describe a real infrastructure or public-service problem (at least 5 characters)." };
  }

  // 1. Single repeated character, e.g. "aaaaa", "11111", "......"
  if (/^(.)\1+$/u.test(clean)) {
    return { isValid: false, reason: genericError };
  }

  // 2. Obvious keyboard mashing or spam phrases
  const mashRegex = /^(?:asdf|qwer|zxcv|1234|abcd|test|sdg|safd|fdsa)+$/i;
  if (mashRegex.test(clean.replace(/\s+/g, ""))) {
    return { isValid: false, reason: genericError };
  }

  // 3. Repeated short chunks, e.g. "abcabcabc", "xyzxyz"
  if (/^(.{2,4})\1{2,}$/i.test(clean)) {
    return { isValid: false, reason: genericError };
  }

  // 4. Token analysis
  const words = clean.split(/\s+/).filter(Boolean);

  // Single word inputs that are not clear, recognized civic terms
  if (words.length === 1) {
    const single = words[0].toLowerCase();
    const allowedSingleTokens = [
      "pothole", "potholes", "water", "electricity", "hospital",
      "clinic", "school", "drainage", "garbage", "road", "roads",
      "bridge", "streetlight", "pipeline"
    ];
    if (!allowedSingleTokens.includes(single)) {
      return { isValid: false, reason: genericError };
    }
  }

  // 5. Consonant cluster check for Latin characters (e.g. 5 or more consonants in a row)
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(clean)) {
    return { isValid: false, reason: genericError };
  }

  // 6. Minimum alphabetic/character requirement
  const letters = (clean.match(/[\p{L}]/gu) || []).length;
  if (letters < 3) {
    return { isValid: false, reason: genericError };
  }

  // 7. Check for common non-problem conversational words
  const nonCivic = ["hello", "hi", "testing", "just testing", "check", "check 123", "good morning", "thanks"];
  if (nonCivic.includes(clean.toLowerCase())) {
    return { isValid: false, reason: genericError };
  }

  return { isValid: true };
}

export interface ValidatedCitizenRequest {
  id?: string;
  source: RequestSource;
  raw_text: string;
  language_code: string;
  state: string;
  district: string;
  category: InfrastructureCategory;
  need_summary: string;
  severity: Severity;
  ai_confidence: number;
  created_at?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validated?: ValidatedCitizenRequest;
}

/**
 * Pure semantic and schema validation function.
 * Validates:
 * 1. Non-empty meaningful raw text (rejects gibberish like "sdgsafdasafd")
 * 2. Allowed category (roads, water, sanitation, healthcare, education, power, transport, other)
 * 3. Confidence range (0.0 to 1.0, or 0.0 for manual_fallback)
 * 4. Known pilot district and state (strictly one of the 8 supported districts)
 * 5. Non-empty need summary (>= 3 chars)
 * 6. Severity enum (low, medium, high)
 * 7. Allowed source (text, voice, manual_fallback)
 */
export function validateCitizenRequest(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return {
      isValid: false,
      errors: ["Request payload must be a non-null JSON object."]
    };
  }

  const record = input as Record<string, unknown>;

  // 1. Raw Text & Meaningfulness Check
  const rawText = typeof record.raw_text === "string" ? record.raw_text.trim() : "";
  const meaningCheck = isMeaningfulRequest(rawText);
  if (!meaningCheck.isValid) {
    errors.push(meaningCheck.reason || "Please describe a real infrastructure or public-service problem.");
  }

  // 2. Source
  let source: RequestSource = "text";
  if (record.source !== undefined && record.source !== null) {
    if (isValidSource(record.source)) {
      source = record.source;
    } else {
      errors.push(`Invalid source "${record.source}". Must be one of: ${ALLOWED_SOURCES.join(", ")}.`);
    }
  }

  // 3. Category
  let category: InfrastructureCategory = "other";
  if (typeof record.category !== "string" || !isValidCategory(record.category)) {
    errors.push(
      `Invalid category "${record.category}". Must be one of: ${ALLOWED_CATEGORIES.join(", ")}.`
    );
  } else {
    category = record.category.trim().toLowerCase() as InfrastructureCategory;
  }

  // 4. Severity
  let severity: Severity = "medium";
  if (typeof record.severity !== "string" || !isValidSeverity(record.severity)) {
    errors.push(`Invalid severity "${record.severity}". Must be one of: ${ALLOWED_SEVERITIES.join(", ")}.`);
  } else {
    severity = record.severity.trim().toLowerCase() as Severity;
  }

  // 5. AI Confidence
  let aiConfidence = 0.0;
  if (source === "manual_fallback") {
    // For manual fallback, confidence is 0.00 (not an AI prediction)
    aiConfidence = 0.0;
  } else {
    if (record.ai_confidence === undefined || record.ai_confidence === null) {
      errors.push("AI confidence score is required for AI-extracted requests.");
    } else {
      const conf = Number(record.ai_confidence);
      if (isNaN(conf) || !isFinite(conf) || conf < 0.0 || conf > 1.0) {
        errors.push(`Confidence score (${record.ai_confidence}) must be a valid number between 0.0 and 1.0.`);
      } else {
        aiConfidence = Math.round(conf * 100) / 100;
      }
    }
  }

  // 6. Need Summary
  const needSummary = typeof record.need_summary === "string" ? record.need_summary.trim() : "";
  if (!needSummary || needSummary.length < 3) {
    errors.push("Need summary must be non-empty and at least 3 characters long.");
  } else if (needSummary.length > 500) {
    errors.push("Need summary must not exceed 500 characters.");
  }

  // 7. Known Pilot District & State (Strictly 8 Supported Districts)
  const districtInput = typeof record.district === "string" ? record.district : "";
  const coverage = checkDistrictCoverage(districtInput);

  if (!coverage.isSupported || !coverage.canonical) {
    errors.push(
      `District "${districtInput}" is outside the current demo coverage. Must be one of: ${ALL_SUPPORTED_DISTRICTS.map((d) => d.district).join(", ")}.`
    );
  }

  // 8. Language code
  const langCode = typeof record.language_code === "string" && record.language_code.trim()
    ? record.language_code.trim().toLowerCase().slice(0, 5)
    : "en";

  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true,
    errors: [],
    validated: {
      id: typeof record.id === "string" ? record.id : undefined,
      source,
      raw_text: rawText,
      language_code: langCode,
      state: coverage.canonical!.state,
      district: coverage.canonical!.district,
      category,
      need_summary: needSummary,
      severity,
      ai_confidence: aiConfidence,
      created_at: typeof record.created_at === "string" ? record.created_at : undefined
    }
  };
}

export interface NormalizedRequestInput {
  rawText: string;
  source?: RequestSource;
  stateHint?: string;
  districtHint?: string;
  manualOverride?: {
    category?: InfrastructureCategory;
    state?: string;
    district?: string;
    needSummary?: string;
    severity?: Severity;
  };
}
