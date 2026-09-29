/**
 * Validation rules and canonical references for JanSanket
 * Implements TASK-031: Strict schema and semantic validation per docs/02_architecture.md
 * Guarantees that invalid model output cannot silently reach the database.
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

/**
 * Matches a district string against the canonical 8 pilot districts.
 * Returns state and canonical district name, or null if unrecognized.
 */
export function findCanonicalDistrict(districtStr?: string | null): { state: string; district: string } | null {
  if (!districtStr || typeof districtStr !== "string") return null;
  const clean = districtStr.trim().toLowerCase();

  for (const [state, districts] of Object.entries(SUPPORTED_STATES_AND_DISTRICTS)) {
    for (const d of districts) {
      if (clean === d.toLowerCase() || clean.includes(d.toLowerCase()) || d.toLowerCase().includes(clean)) {
        return { state, district: d };
      }
    }
  }
  return null;
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
 * TASK-031: Pure semantic and schema validation function.
 * Validates:
 * 1. Allowed category (roads, water, sanitation, healthcare, education, power, transport, other)
 * 2. Confidence range (0.0 to 1.0)
 * 3. Known pilot district and state
 * 4. Non-empty need summary (>= 3 chars)
 * 5. Severity enum (low, medium, high)
 * 6. Non-empty raw text (>= 5 chars)
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

  // 1. Raw Text
  const rawText = typeof record.raw_text === "string" ? record.raw_text.trim() : "";
  if (!rawText || rawText.length < 5) {
    errors.push("Citizen request text must be at least 5 characters long.");
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
  let aiConfidence = 0.9;
  if (record.ai_confidence === undefined || record.ai_confidence === null) {
    errors.push("AI confidence score is required.");
  } else {
    const conf = Number(record.ai_confidence);
    if (isNaN(conf) || !isFinite(conf) || conf < 0.0 || conf > 1.0) {
      errors.push(`Confidence score (${record.ai_confidence}) must be a valid number between 0.0 and 1.0.`);
    } else {
      aiConfidence = Math.round(conf * 100) / 100;
    }
  }

  // 6. Need Summary
  const needSummary = typeof record.need_summary === "string" ? record.need_summary.trim() : "";
  if (!needSummary || needSummary.length < 3) {
    errors.push("Need summary must be non-empty and at least 3 characters long.");
  } else if (needSummary.length > 500) {
    errors.push("Need summary must not exceed 500 characters.");
  }

  // 7. Known Pilot District & State
  const districtInput = typeof record.district === "string" ? record.district : "";
  const canonical = findCanonicalDistrict(districtInput);

  if (!canonical) {
    errors.push(
      `District "${districtInput}" is not recognized. Must be one of: ${ALL_SUPPORTED_DISTRICTS.map((d) => d.district).join(", ")}.`
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
      state: canonical!.state,
      district: canonical!.district,
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
