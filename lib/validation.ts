/**
 * Validation rules and canonical references for JanSanket
 * Implements strict schema, semantic, and demo coverage validation.
 * Guarantees that invalid or out-of-scope model output cannot silently reach the database.
 */

import { InfrastructureCategory, Severity } from "./demo-data";
export type { InfrastructureCategory, Severity };

import {
  PILOT_STATES_AND_DISTRICTS,
  ALL_PILOT_DISTRICTS,
  ALL_INDIAN_STATES,
  INDIAN_DISTRICTS_BY_STATE,
  LOCATION_ALIASES,
  isPilotDistrict,
  findCanonicalState,
  resolveIndianLocation,
  GeographicValidationResult,
} from "./india-locations";


export {
  PILOT_STATES_AND_DISTRICTS,
  ALL_PILOT_DISTRICTS,
  ALL_INDIAN_STATES,
  INDIAN_DISTRICTS_BY_STATE,
  isPilotDistrict,
  findCanonicalState,
  resolveIndianLocation,
};
export type { GeographicValidationResult };

// Backward-compatible aliases for existing callers
export const SUPPORTED_STATES_AND_DISTRICTS = PILOT_STATES_AND_DISTRICTS;
export const ALL_SUPPORTED_DISTRICTS = ALL_PILOT_DISTRICTS;

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
 * Matches a district string against canonical references across India.
 * Returns state and canonical district name, or null if unrecognized.
 */
export function findCanonicalDistrict(districtStr?: string | null): { state: string; district: string } | null {
  if (!districtStr || typeof districtStr !== "string") return null;
  const clean = districtStr.trim();
  if (!clean) return null;

  // 1. Direct resolution (exact match or alias match on the whole input)
  const res = resolveIndianLocation(clean);
  if (res.isValid && res.state && res.district) {
    return { state: res.state, district: res.district };
  }

  // 2. Scan text for known city/district aliases (e.g. Bangalore, Banaras, Anjuna, etc.)
  const lower = clean.toLowerCase();
  for (const [alias, loc] of Object.entries(LOCATION_ALIASES)) {
    if (alias.length >= 3) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, "i");
      if (regex.test(lower)) {
        return { state: loc.state, district: loc.district };
      }
    }
  }

  // 3. Scan text for official Indian district names (min 4 characters)
  for (const [state, districts] of Object.entries(INDIAN_DISTRICTS_BY_STATE)) {
    for (const d of districts) {
      if (d.length >= 4) {
        const escaped = d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, "i");
        if (regex.test(lower)) {
          return { state, district: d };
        }
      }
    }
  }

  return null;
}


export interface DistrictCoverageResult {
  isSupported: boolean; // In 8 pilot districts
  isGeographicallyValid: boolean; // Valid Indian state + district combination
  canonical: { state: string; district: string } | null;
  rawDistrict?: string;
  rawState?: string;
  message?: string;
}

/**
 * Validates a district and state across India.
 * Distinguishes geographic validity (any real Indian state+district)
 * from pilot analytics coverage (the 8 demo context districts).
 */
export function checkDistrictCoverage(districtStr?: string | null, stateStr?: string | null): DistrictCoverageResult {
  if (!districtStr || typeof districtStr !== "string" || !districtStr.trim()) {
    return {
      isSupported: false,
      isGeographicallyValid: false,
      canonical: null,
      message: "No district specified. Please select or enter a district."
    };
  }

  const cleanDistrict = districtStr.trim();
  const cleanState = stateStr && typeof stateStr === "string" ? stateStr.trim() : undefined;

  const geo = resolveIndianLocation(cleanDistrict, cleanState);

  if (!geo.isValid || !geo.district || !geo.state) {
    return {
      isSupported: false,
      isGeographicallyValid: false,
      canonical: null,
      rawDistrict: cleanDistrict,
      rawState: cleanState,
      message: geo.message || `District "${cleanDistrict}" does not match state "${cleanState}".`
    };
  }

  return {
    isSupported: geo.isPilot,
    isGeographicallyValid: true,
    canonical: { state: geo.state, district: geo.district },
    rawDistrict: cleanDistrict,
    rawState: geo.state,
    message: geo.isPilot
      ? undefined
      : `District "${geo.district}" is outside current pilot analytics coverage.`
  };
}

/**
 * Vocabulary of civic infrastructure, public services, and problem indicators.
 * Used to ensure legitimate citizen requests are accepted while casual chit-chat,
 * greetings, test spam, and non-civic phrases are rejected.
 */
const CIVIC_TOPIC_TERMS = [
  // Roads & Transport
  "road", "roads", "pothole", "potholes", "street", "highway", "bridge", "culvert", "path",
  "footpath", "traffic", "bus", "transport", "transit", "station", "stop", "vehicle", "auto",
  // Water & Sanitation
  "water", "drinking", "pipeline", "pipe", "borewell", "handpump", "well", "tank", "tap",
  "drainage", "drain", "drains", "sewage", "sewer", "gutter", "toilet", "toilets", "sanitation",
  "garbage", "waste", "trash", "dump", "filth", "cleanliness",
  // Power & Energy
  "power", "electricity", "electric", "current", "voltage", "transformer", "pole", "wire",
  "wires", "light", "lights", "streetlight", "streetlights", "outage", "blackout",
  // Healthcare
  "hospital", "clinic", "phc", "doctor", "doctors", "nurse", "medicine", "medicines",
  "medical", "ambulance", "health", "treatment", "patient", "dispensary",
  // Education
  "school", "college", "classroom", "classrooms", "teacher", "teachers", "student", "students",
  "desk", "desks", "bench", "building", "education", "books",
  // Community & Environment
  "flood", "flooding", "waterlogging", "canal", "river", "village", "community", "panchayat",
  // Regional - Kannada
  "ರಸ್ತೆ", "ಗುಂಡಿ", "ನೀರು", "ಕುಡಿಯುವ", "ಚರಂಡಿ", "ಕಸ", "ಶಾಲೆ", "ಆಸ್ಪತ್ರೆ", "ವೈದ್ಯ", "ಔಷಧ",
  "ವಿದ್ಯುತ್", "ಕರೆಂಟ್", "ದೀಪ", "ಬಸ್", "ಸೇತುವೆ", "ಕೊಳವೆಬಾವಿ", "ಗ್ರಾಮ", "ಹಳ್ಳಿ",
  // Regional - Hindi
  "सड़क", "गड्ढा", "गड्ढे", "पानी", "जल", "नल", "हैंडपंप", "नाली", "सीवर", "कचरा",
  "स्कूल", "अस्पताल", "डॉक्टर", "दवा", "बिजली", "बत्ती", "बस", "पुल", "गांव", "बस्ती",
  // Regional - Tamil
  "சாலை", "குழி", "குடிநீர்", "தண்ணீர்", "குழாய்", "சாக்கடை", "குப்பை", "பள்ளி",
  "மருத்துவமனை", "மருத்துவர்", "மருந்து", "மின்சாரம்", "விளக்கு", "பேருந்து", "பாலம்", "கிராமம்"
];

const CIVIC_PROBLEM_TERMS = [
  "broken", "damaged", "damage", "potholes", "leak", "leaking", "leakage", "overflow", "overflowing",
  "shortage", "scarcity", "deficit", "outage", "cut", "blocked", "clogged", "dirty", "unclean",
  "muddy", "washed", "repair", "fix", "construct", "build", "need", "needed", "urgent",
  "problem", "issue", "complaint", "hazard", "danger", "closed", "unavailable", "missing",
  "lack", "irregular", "failure", "collapsed", "condition", "maintenance", "crisis",
  // Regional problem terms
  "ಹಾಳಾಗಿದೆ", "ಸರಿಮಾಡಿ", "ದುರಸ್ತಿ", "ಸಮಸ್ಯೆ", "ತೊಂದರೆ", "ಬಂದಿಲ್ಲ", "ಖರಾಬ್", "ಬೀಳುತ್ತಿದೆ",
  "खराब", "मरम्मत", "समस्या", "परेशानी", "टूटा", "टूटी", "बंद", "गंदा", "कमी", "किल्लत",
  "சேதமடைந்துள்ளது", "பழுது", "பிரச்சனை", "இல்லை", "மோசம்", "தேவை"
];

/**
 * Detects obviously meaningless, spam, conversational, or non-civic text.
 * Rejects:
 * - Keyboard gibberish: "sdgsafdasafd", "asdfghjkl"
 * - Greetings & chit-chat: "hello there how are you", "good morning"
 * - Test spam: "this is a test", "testing 123"
 * - Casual / non-civic personal remarks: "I like apples", "I love cricket"
 * Ensures legitimate short civic requests pass (e.g. "water pipeline leak", "potholes on main road").
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

  // 2. Obvious keyboard mashing or spam chunks
  const mashRegex = /^(?:asdf|qwer|zxcv|1234|abcd|test|sdg|safd|fdsa)+$/i;
  if (mashRegex.test(clean.replace(/\s+/g, ""))) {
    return { isValid: false, reason: genericError };
  }

  // 3. Repeated short chunks, e.g. "abcabcabc", "xyzxyz"
  if (/^(.{2,4})\1{2,}$/i.test(clean)) {
    return { isValid: false, reason: genericError };
  }

  // 4. Consonant cluster check for Latin characters (e.g. 5 or more consonants in a row like "sdgsafd")
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(clean)) {
    return { isValid: false, reason: genericError };
  }

  // 5. Minimum alphabetic/character requirement
  const letters = (clean.match(/[\p{L}]/gu) || []).length;
  if (letters < 3) {
    return { isValid: false, reason: genericError };
  }

  const lower = clean.toLowerCase();

  // 6. Test spam phrases
  const testPhrases = [
    /^this is a test\b/i,
    /^just a test\b/i,
    /^testing\b/i,
    /^test 123\b/i,
    /^sample test\b/i,
    /^lorem ipsum\b/i,
    /^check 123\b/i
  ];
  if (testPhrases.some((re) => re.test(lower))) {
    return { isValid: false, reason: genericError };
  }

  // 7. Conversational greetings and chit-chat without any civic issue
  const greetingPhrases = [
    /^hello\b/i,
    /^hi\b/i,
    /^hey\b/i,
    /^how are you\b/i,
    /^good morning\b/i,
    /^good afternoon\b/i,
    /^good evening\b/i,
    /^namaste\b/i,
    /^vanakkam\b/i,
    /^namaskara\b/i
  ];
  const startsWithGreeting = greetingPhrases.some((re) => re.test(lower));

  // 8. Casual personal statements without any civic issue (e.g. "I like apples", "I am hungry")
  const casualPhrases = [
    /^i like\b/i,
    /^i love\b/i,
    /^i am\b/i,
    /^i want\b/i,
    /^i feel\b/i,
    /^who are you\b/i,
    /^what is your name\b/i,
    /^tell me\b/i,
    /^can you\b/i,
    /^weather is\b/i
  ];
  const startsWithCasual = casualPhrases.some((re) => re.test(lower));

  // 9. Semantic Civic Relevance Check
  // Check whether the text contains at least one civic topic OR civic problem keyword
  const hasCivicTopic = CIVIC_TOPIC_TERMS.some((term) => lower.includes(term.toLowerCase()));
  const hasCivicProblem = CIVIC_PROBLEM_TERMS.some((term) => lower.includes(term.toLowerCase()));

  // If it starts with greeting or casual phrase and contains NO civic topic/problem, reject immediately
  if ((startsWithGreeting || startsWithCasual) && !hasCivicTopic && !hasCivicProblem) {
    return { isValid: false, reason: genericError };
  }

  // If text is short (< 8 words) and contains neither civic topic nor civic problem term, reject
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 8 && !hasCivicTopic && !hasCivicProblem) {
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

  // 7. Geographic Location (Valid State & District anywhere in India)
  const districtInput = typeof record.district === "string" ? record.district : "";
  const stateInput = typeof record.state === "string" ? record.state : "";
  const coverage = checkDistrictCoverage(districtInput, stateInput);

  if (!coverage.isGeographicallyValid || !coverage.canonical) {
    errors.push(
      coverage.message ||
        `District "${districtInput}" is not recognized or does not match state "${stateInput}".`
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
