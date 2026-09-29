import fs from "fs";
import path from "path";
import { checkDistrictCoverage, validateCitizenRequest } from "../lib/validation";
import { normalizeCitizenRequest } from "../lib/ai";
import { getAllCitizenRequests, getAllDistrictContexts } from "../lib/db";
import { computePlanningSignals } from "../lib/priority";

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


async function verifyAll() {
  console.log("==================================================");
  console.log("  MANUAL VERIFICATION OF USER REQUIREMENTS");
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

  // A. /submit with "Electricity outage in Bangalore" initially unset
  console.log("--- A. Verify 'Electricity outage in Bangalore' without pre-set district ---");
  const extBangalore = await normalizeCitizenRequest("Electricity outage in Bangalore");
  assert(
    "Bangalore does NOT force Ramanagara",
    extBangalore.district !== "Ramanagara",
    `extracted district: ${extBangalore.district}`
  );
  assert(
    "Bangalore resolves to Bengaluru Urban in Karnataka",
    extBangalore.district === "Bengaluru Urban" && extBangalore.state === "Karnataka",
    `state: ${extBangalore.state}, district: ${extBangalore.district}`
  );
  assert(
    "Bengaluru Urban is recognized as outside-pilot (not in 8 pilot districts)",
    extBangalore.isSupportedDistrict === false
  );

  const bangaloreCoverage = checkDistrictCoverage("Bengaluru Urban", "Karnataka");
  assert(
    "Bengaluru Urban in Karnataka is geographically valid",
    bangaloreCoverage.isGeographicallyValid === true && bangaloreCoverage.canonical?.district === "Bengaluru Urban"
  );
  assert(
    "Bengaluru Urban in Karnataka is flagged as outside pilot coverage",
    bangaloreCoverage.isSupported === false
  );

  // User can submit outside-pilot district
  const submitOutside = validateCitizenRequest({
    source: "text",
    raw_text: "Electricity outage in Bangalore",
    language_code: "en",
    state: "Karnataka",
    district: "Bengaluru Urban",
    category: "power",
    need_summary: "Electricity outage in Bangalore",
    severity: "medium",
    ai_confidence: 0.95
  });
  assert(
    "User can submit an outside-pilot district (Bengaluru Urban)",
    submitOutside.isValid === true
  );

  // B. /submit with State = Goa and District = Ramanagara
  console.log("\n--- B. Verify State = Goa and District = Ramanagara Mismatch ---");
  const mismatch = checkDistrictCoverage("Ramanagara", "Goa");
  assert(
    "Goa + Ramanagara is geographically invalid (mismatch rejected)",
    mismatch.isGeographicallyValid === false && mismatch.isSupported === false
  );
  assert(
    "Mismatch error clearly mentions mismatch or correct state",
    mismatch.message?.includes("Karnataka") === true || mismatch.message?.includes("does not match") === true,
    `message: "${mismatch.message}"`
  );

  const submitMismatch = validateCitizenRequest({
    source: "text",
    raw_text: "Road repair needed in Ramanagara",
    language_code: "en",
    state: "Goa",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Road repair needed",
    severity: "high",
    ai_confidence: 0.95
  });
  assert(
    "State = Goa + District = Ramanagara is rejected by submission validator",
    submitMismatch.isValid === false
  );

  // C. /submit with State = Karnataka and District = Ramanagara
  console.log("\n--- C. Verify State = Karnataka and District = Ramanagara ---");
  const validPair = checkDistrictCoverage("Ramanagara", "Karnataka");
  assert(
    "Karnataka + Ramanagara is geographically valid",
    validPair.isGeographicallyValid === true && validPair.canonical?.district === "Ramanagara"
  );
  assert(
    "Karnataka + Ramanagara is recognized in pilot coverage",
    validPair.isSupported === true
  );

  const submitValid = validateCitizenRequest({
    source: "text",
    raw_text: "Road repair needed in Ramanagara village",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Road repair needed in Ramanagara village",
    severity: "high",
    ai_confidence: 0.95
  });
  assert(
    "State = Karnataka + District = Ramanagara is valid and accepted",
    submitValid.isValid === true
  );

  // D. Dashboard analytics separation
  console.log("\n--- D. Dashboard: Separate Citizen Intake from Pilot Analytics ---");
  const [allReqs, allContexts] = await Promise.all([
    getAllCitizenRequests(),
    getAllDistrictContexts()
  ]);

  // Compute planning signals with all requests + simulated outside-pilot request
  const testRequests = [
    ...allReqs,
    {
      id: "test-outside-pilot-id",
      source: "text" as const,
      raw_text: "Road potholes in Panaji, Goa",
      language_code: "en",
      state: "Goa",
      district: "North Goa",
      category: "roads" as const,
      need_summary: "Road potholes in Panaji",
      severity: "medium" as const,
      ai_confidence: 0.95,
      created_at: new Date().toISOString()
    }
  ];

  const signals = computePlanningSignals(testRequests, allContexts);
  assert(
    "Hotspots still cover exactly 8 pilot districts (no fake hotspot for Goa)",
    signals.summary.districts === 8 && !signals.hotspots.some((h) => h.state === "Goa" || h.district === "North Goa")
  );
  assert(
    "Outside-pilot request does not receive a fabricated priority score",
    !signals.hotspots.some((h) => h.district === "North Goa")
  );
  assert(
    "Existing hotspot count remains stable and unchanged",
    signals.hotspots.length >= 14
  );

  console.log("\n==================================================");
  console.log(`  VERIFICATION RESULT: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

verifyAll().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
