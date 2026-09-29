/**
 * Comprehensive AI Provider Verification Suite
 * Tests Google Gemini (gemini-3.5-flash-lite) provider integration and fallback paths:
 * 1. Valid English request
 * 2. Kannada input (authentic Kannada text -> English summary)
 * 3. Hindi input (authentic Hindi text -> English summary)
 * 4. Tamil input (authentic Tamil text -> English summary)
 * 5. Gibberish input (e.g. "sdgsafdasafd") -> rejected
 * 6. Non-civic text (e.g. "hello there how are you", "I like apples", "this is a test") -> rejected
 * 7. Missing district -> null, never default to Ramanagara
 * 8. Unsupported district -> outside coverage flagged, never Ramanagara
 * 9. State-district mismatch (Goa + Ramanagara) -> rejected
 * 10. Malformed AI response -> graceful recovery without crash
 * 11. 429 / offline fallback -> clean fallback, confidence: null, no fake AI data
 *
 * Usage:
 *   npx tsx scripts/test-ai-provider.ts
 */

import fs from "fs";
import path from "path";
import { normalizeCitizenRequest, getPreparedFallback } from "../lib/ai";
import { checkDistrictCoverage, validateCitizenRequest, isMeaningfulRequest } from "../lib/validation";
import { calculatePriorityScore, computePlanningSignals } from "../lib/priority";
import { SEED_DISTRICT_CONTEXT } from "../lib/demo-data";

// Auto-load .env.local if present
try {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore
}

async function runAiProviderTests() {
  console.log("==================================================");
  console.log("  JanSanket AI Provider & Fallback Test Suite");
  console.log("  Provider: Google Gemini (gemini-3.5-flash-lite) + Fallback");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(title: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${title}${detail ? ` (${detail})` : ""}`);
      passed++;
    } else {
      console.log(`[FAIL] ${title}${detail ? ` (${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Valid English request
  console.log("--- 1. Valid English Request ---");
  const enRes = await normalizeCitizenRequest(
    "In Ramanagara district, the road connecting our village to the main highway is completely broken and full of deep potholes.",
    "Karnataka",
    "Ramanagara"
  );
  assert(
    "English Request is valid",
    enRes.isValidRequest === true,
    `category: ${enRes.category}, district: ${enRes.district}`
  );
  assert(
    "English Request maps to roads category",
    enRes.category === "roads"
  );
  assert(
    "English Request identifies Ramanagara",
    enRes.district === "Ramanagara" && enRes.state === "Karnataka"
  );

  // 2. Kannada input
  console.log("\n--- 2. Kannada Input ---");
  const knRes = await normalizeCitizenRequest(
    "ಮಳೆ ಬಂದಾಗ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ, ರಾಮನಗರ ಜಿಲ್ಲೆಯ ಶಾಲೆಗೆ ಹೋಗಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ.",
    "Karnataka",
    "Ramanagara"
  );
  assert("Kannada input is valid", knRes.isValidRequest === true);
  assert("Kannada input detects category 'roads'", knRes.category === "roads");
  assert(
    "Kannada input has English need summary (no raw Indic characters)",
    !/[\u0C80-\u0CFF]/.test(knRes.need_summary) && knRes.need_summary.length > 5,
    `summary: "${knRes.need_summary}"`
  );

  // 3. Hindi input
  console.log("\n--- 3. Hindi Input ---");
  const hiRes = await normalizeCitizenRequest(
    "बहराइच जिले के हमारे गांव में पीने के पानी की भारी किल्लत है और सरकारी हैंडपंप महीनों से खराब पड़े हैं।",
    "Uttar Pradesh",
    "Bahraich"
  );
  assert("Hindi input is valid", hiRes.isValidRequest === true);
  assert("Hindi input detects category 'water'", hiRes.category === "water");
  assert(
    "Hindi input has English need summary (no raw Devanagari script)",
    !/[\u0900-\u097F]/.test(hiRes.need_summary) && hiRes.need_summary.length > 5,
    `summary: "${hiRes.need_summary}"`
  );

  // 4. Tamil input
  console.log("\n--- 4. Tamil Input ---");
  const taRes = await normalizeCitizenRequest(
    "தருமபுரி மாவட்டத்தில் எங்கள் கிராம ஆரம்ப சுகாதார நிலையத்தில் மருத்துவர் மற்றும் அடிப்படை மருந்துகள் இல்லை.",
    "Tamil Nadu",
    "Dharmapuri"
  );
  assert("Tamil input is valid", taRes.isValidRequest === true);
  assert("Tamil input detects category 'healthcare'", taRes.category === "healthcare");
  assert(
    "Tamil input has English need summary (no raw Tamil script)",
    !/[\u0B80-\u0BFF]/.test(taRes.need_summary) && taRes.need_summary.length > 5,
    `summary: "${taRes.need_summary}"`
  );

  // 5. Gibberish
  console.log("\n--- 5. Gibberish Input Screening ---");
  const gibberishCheck = isMeaningfulRequest("sdgsafdasafd");
  assert("Gibberish rejected by meaningfulness check", !gibberishCheck.isValid);

  const gibRes = await normalizeCitizenRequest("sdgsafdasafd");
  assert(
    "Gibberish rejected by AI normalization layer",
    gibRes.isValidRequest === false,
    `reason: "${gibRes.rejectionReason}"`
  );
  assert("Gibberish does not assign Ramanagara", gibRes.district === null);
  assert("Gibberish does not have confidence score", gibRes.confidence === 0.0 || gibRes.confidence === null);

  // 6. Non-civic text
  console.log("\n--- 6. Non-Civic Input Screening ---");
  const nonCivicSamples = [
    "hello there how are you",
    "this is a test",
    "I like apples"
  ];
  for (const sample of nonCivicSamples) {
    const check = isMeaningfulRequest(sample);
    const res = await normalizeCitizenRequest(sample);
    assert(
      `Non-civic "${sample}" rejected`,
      !check.isValid && res.isValidRequest === false
    );
  }

  // 7. Missing district
  console.log("\n--- 7. Missing District ---");
  const missingDistRes = await normalizeCitizenRequest(
    "The drinking water pipeline in our village has ruptured and clean water is unavailable."
  );
  assert(
    "Missing district is not defaulted to Ramanagara",
    missingDistRes.district === null,
    `district: ${missingDistRes.district}`
  );

  // 8. India-wide Geographic Validation & Outside Pilot Coverage
  console.log("\n--- 8. India-wide Geographic Validation & Outside Pilot Coverage ---");
  // A. Karnataka + Ramanagara -> valid pilot district
  const ramanagaraCoverage = checkDistrictCoverage("Ramanagara", "Karnataka");
  assert(
    "Karnataka + Ramanagara is geographically valid and in pilot coverage",
    ramanagaraCoverage.isGeographicallyValid === true && ramanagaraCoverage.isSupported === true && ramanagaraCoverage.canonical?.district === "Ramanagara"
  );

  // B. Uttar Pradesh + Bahraich -> valid pilot district
  const bahraichCoverage = checkDistrictCoverage("Bahraich", "Uttar Pradesh");
  assert(
    "Uttar Pradesh + Bahraich is geographically valid and in pilot coverage",
    bahraichCoverage.isGeographicallyValid === true && bahraichCoverage.isSupported === true && bahraichCoverage.canonical?.district === "Bahraich"
  );

  // C. Goa + North Goa / Anjuna -> valid outside-pilot location accepted for storage
  const anjunaCoverage = checkDistrictCoverage("Anjuna", "Goa");
  assert(
    "Anjuna in Goa resolves to North Goa (geographically valid, outside pilot coverage)",
    anjunaCoverage.isGeographicallyValid === true && anjunaCoverage.isSupported === false && anjunaCoverage.canonical?.district === "North Goa"
  );

  const outsideValidation = validateCitizenRequest({
    raw_text: "Road in Anjuna village has potholes and streetlights are broken.",
    state: "Goa",
    district: "North Goa",
    category: "roads",
    need_summary: "Road in Anjuna has potholes.",
    severity: "medium",
    source: "text",
    ai_confidence: 0.9
  });
  assert(
    "Valid outside-pilot district request is accepted by schema validation for storage",
    outsideValidation.isValid === true
  );

  // D. Bangalore / Bengaluru Urban normalization
  const bangaloreCoverage = checkDistrictCoverage("Bangalore", "Karnataka");
  assert(
    "Bangalore in Karnataka normalizes deterministically to Bengaluru Urban",
    bangaloreCoverage.isGeographicallyValid === true && bangaloreCoverage.canonical?.district === "Bengaluru Urban"
  );

  // 9. State/District mismatch (Goa + Ramanagara)
  console.log("\n--- 9. State/District Mismatch (Goa + Ramanagara) ---");
  const mismatchCoverage = checkDistrictCoverage("Ramanagara", "Goa");
  assert(
    "Mismatched pair (Goa + Ramanagara) rejected deterministically",
    mismatchCoverage.isGeographicallyValid === false && mismatchCoverage.isSupported === false && mismatchCoverage.canonical === null,
    `message: "${mismatchCoverage.message}"`
  );

  const mismatchValidation = validateCitizenRequest({
    raw_text: "Road in Ramanagara has major potholes.",
    state: "Goa",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Road in Ramanagara has potholes.",
    severity: "high",
    source: "text",
    ai_confidence: 0.95
  });
  assert(
    "Submission with mismatched pair (Goa + Ramanagara) rejected by schema validation",
    mismatchValidation.isValid === false && mismatchValidation.errors.some((e) => e.includes("does not match") || e.includes("Karnataka"))
  );


  // 10. Malformed AI response handling
  console.log("\n--- 10. Malformed Response Recovery ---");
  const fallbackFromMalformed = getPreparedFallback(
    "Village drinking water pipeline has burst in Bahraich.",
    "Uttar Pradesh",
    "Bahraich",
    "Malformed model JSON output recovered via fallback."
  );
  assert(
    "Malformed response recovers cleanly to fallback",
    fallbackFromMalformed.isValidRequest === true &&
    fallbackFromMalformed.isFallback === true &&
    fallbackFromMalformed.category === "water" &&
    fallbackFromMalformed.district === "Bahraich"
  );

  // 11. 429 Fallback
  console.log("\n--- 11. HTTP 429 Fallback Behavior ---");
  const fallback429 = getPreparedFallback(
    "Village primary health center has no doctor in Dharmapuri.",
    "Tamil Nadu",
    "Dharmapuri",
    "AI analysis is temporarily unavailable (Gemini quota limit reached). You can continue using the manual fallback."
  );
  assert("429 Fallback has source 'manual_fallback'", fallback429.source === "manual_fallback");
  assert("429 Fallback has confidence null (no fake confidence)", fallback429.confidence === null);
  assert("429 Fallback is flagged as isFallback: true", fallback429.isFallback === true);
  assert("429 Fallback correctly detected category 'healthcare'", fallback429.category === "healthcare");
  assert("429 Fallback correctly preserved district 'Dharmapuri'", fallback429.district === "Dharmapuri");

  // 12. Regression Test: Citizen Input Channel vs AI Provider Metadata
  console.log("\n--- 12. Regression Test: Citizen Input Channel vs AI Provider Metadata ---");
  const expectedSource = enRes.isFallback ? "manual_fallback" : "text";
  assert(
    `AI extraction returns citizen input channel source '${expectedSource}'`,
    enRes.source === expectedSource,
    `source: "${enRes.source}"`
  );
  assert(
    "AI extraction source is strictly a valid citizen input channel (never 'ai')",
    (enRes.source as string) !== "ai" && (enRes.source === "text" || enRes.source === "manual_fallback" || enRes.source === "voice")
  );
  assert(
    "AI extraction returns provider metadata 'gemini' or 'manual_fallback'",
    enRes.provider === "gemini" || enRes.provider === "manual_fallback",
    `provider: "${enRes.provider}"`
  );

  const validTextSubmit = validateCitizenRequest({
    source: "text",
    raw_text: "Road needs repair in Ramanagara",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Repair road",
    severity: "medium",
    ai_confidence: 0.95
  });
  assert("Valid submission with source 'text' passes validation", validTextSubmit.isValid === true);

  const validFallbackSubmit = validateCitizenRequest({
    source: "manual_fallback",
    raw_text: "Road needs repair in Ramanagara",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Repair road",
    severity: "medium",
    ai_confidence: 0.0
  });
  assert("Valid submission with source 'manual_fallback' passes validation", validFallbackSubmit.isValid === true);

  const invalidAiSourceSubmit = validateCitizenRequest({
    source: "ai",
    raw_text: "Road needs repair in Ramanagara",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Repair road",
    severity: "medium",
    ai_confidence: 0.95
  });
  assert(
    "Invalid source 'ai' is strictly rejected with schema error",
    invalidAiSourceSubmit.isValid === false &&
    invalidAiSourceSubmit.errors.some((e) => e.includes('Invalid source "ai"'))
  );

  const invalidProviderSourceSubmit = validateCitizenRequest({
    source: "gemini",
    raw_text: "Road needs repair in Ramanagara",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Repair road",
    severity: "medium",
    ai_confidence: 0.95
  });
  assert(
    "Invalid source 'gemini' is strictly rejected with schema error",
    invalidProviderSourceSubmit.isValid === false &&
    invalidProviderSourceSubmit.errors.some((e) => e.includes('Invalid source "gemini"'))
  );

  // 13. Outside-Pilot Request Has No Fabricated Score
  console.log("\n--- 13. Outside-Pilot Request Has No Fabricated Score ---");
  const outsideRequests = [
    {
      id: "test-outside-1",
      raw_text: "Road repair needed in North Goa",
      language_code: "en",
      state: "Goa",
      district: "North Goa",
      category: "roads" as const,
      need_summary: "Road repair needed in North Goa",
      severity: "medium" as const,
      source: "text" as const,
      ai_confidence: 0.9,
      created_at: new Date().toISOString()
    }
  ];
  const outsideSignals = computePlanningSignals(outsideRequests, SEED_DISTRICT_CONTEXT);
  assert(
    "Outside-pilot request is not assigned a fabricated hotspot score",
    outsideSignals.hotspots.length === 0,
    `hotspots count: ${outsideSignals.hotspots.length}`
  );
  assert(
    "Outside-pilot district does not appear in hotspot ranking",
    outsideSignals.hotspots.some((h) => h.district === "North Goa") === false
  );

  // 14. Deterministic Priority Formula Verification
  console.log("\n--- 14. Deterministic Priority Formula Verification ---");
  // Formula:
  // requestsPer100k = (10 / 100000) * 100000 = 10
  // demandScore = min(100, 10 * 5) = 50
  // unaddressedGap = 60 * (1 - 50/100) = 30
  // expectedScore = 0.40 * 50 + 0.30 * 60 + 0.15 * 70 + 0.15 * 30 = 20 + 18 + 10.5 + 4.5 = 53.0
  const priorityTest = calculatePriorityScore({
    requestCount: 10,
    population: 100000,
    infrastructureGapIndex: 60,
    plannedCoveragePct: 50,
    populationImpactScore: 70
  });
  assert(
    "Deterministic priority formula calculates exact expected score (53.0)",
    priorityTest.priorityScore === 53.0 &&
    priorityTest.demandScore === 50.0 &&
    priorityTest.unaddressedGap === 30.0,
    `calculated score: ${priorityTest.priorityScore}, demand: ${priorityTest.demandScore}`
  );

  console.log("\n==================================================");
  console.log(`  AI PROVIDER TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runAiProviderTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
