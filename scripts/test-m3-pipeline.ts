/**
 * Comprehensive Verification Script for M3 Tasks:
 * TASK-030 — Gemini extraction (multilingual structured output, no priority score)
 * TASK-031 — Validation (category, confidence, district, need_summary, severity)
 * TASK-032 — Persist request (server route, UUID, database/store persistence)
 * TASK-033 — Deterministic score (exact formula, category-to-project mapping)
 */

import http from "http";
import { spawn, ChildProcess } from "child_process";
import { validateCitizenRequest, ALLOWED_CATEGORIES } from "../lib/validation";
import { calculatePriorityScore, getRecommendedProject, computePlanningSignals, CATEGORY_PROJECT_MAPPING } from "../lib/priority";
import { SEED_CITIZEN_REQUESTS, SEED_DISTRICT_CONTEXT } from "../lib/demo-data";
import { normalizeRequestWithGemini } from "../lib/gemini";

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/requests`, () => resolve(true));
    req.on("error", () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForServer(port: number, maxAttempts = 30): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const isUp = await checkPort(port);
      if (isUp) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error(`Server did not respond on port ${port} within timeout`));
      }
    }, 400);
  });
}

interface ApiResponse {
  success?: boolean;
  request?: {
    id: string;
    category: string;
    district: string;
    [key: string]: unknown;
  };
  provider?: string;
  error?: string;
  details?: string[];
  [key: string]: unknown;
}

interface HttpResponse {
  status: number;
  body?: ApiResponse;
  raw?: string;
}

function postJson(port: number, path: string, body: Record<string, unknown>): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "localhost",
        port,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode || 500, raw: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runM3Verification() {
  console.log("==================================================");
  console.log("  M3 PIPELINE VERIFICATION");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------------------
  // 1. TASK-030: Gemini Extraction Test (English, Hindi, Kannada, Tamil)
  // -------------------------------------------------------------------------
  console.log("--- TASK-030: Gemini Structured Extraction ---");

  const multilingualSamples = [
    {
      lang: "English",
      text: "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
      state: "Karnataka",
      district: "Ramanagara",
      expectedCategory: "roads"
    },
    {
      lang: "Hindi",
      text: "बहराइच के प्राथमिक स्वास्थ्य केंद्र में जीवन रक्षक दवाएं और एम्बुलेंस की तत्काल आवश्यकता है।",
      state: "Uttar Pradesh",
      district: "Bahraich",
      expectedCategory: "healthcare"
    },
    {
      lang: "Kannada",
      text: "ರಾಮನಗರ ತಾಲೂಕಿನ ನಮ್ಮ ಗ್ರಾಮದ ಮುಖ್ಯ ರಸ್ತೆ ಸಂಪೂರ್ಣವಾಗಿ ಹಾಳಾಗಿದೆ ಮತ್ತು ಮಳೆಗಾಲದಲ್ಲಿ ಸಂಚಾರ ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತದೆ.",
      state: "Karnataka",
      district: "Ramanagara",
      expectedCategory: "roads"
    },
    {
      lang: "Tamil",
      text: "தருமபுரி மாவட்டத்தில் உள்ள அரசு ஆரம்ப சுகாதார நிலையத்தில் அவசர சிகிச்சை பிரிவு தேவை.",
      state: "Tamil Nadu",
      district: "Dharmapuri",
      expectedCategory: "healthcare"
    }
  ];

  for (const sample of multilingualSamples) {
    process.stdout.write(`1. Testing extraction for ${sample.lang}... `);
    try {
      const result = await normalizeRequestWithGemini(sample.text, sample.state, sample.district);
      const hasRequiredFields =
        typeof result.language === "string" &&
        typeof result.category === "string" &&
        typeof result.need_summary === "string" &&
        typeof result.severity === "string" &&
        typeof result.confidence === "number";

      // Verify AI does NOT calculate priority score
      const hasPriorityScore = "priority_score" in result || "priorityScore" in result;

      if (hasRequiredFields && !hasPriorityScore && result.category === sample.expectedCategory) {
        console.log(`PASS (Extracted ${result.category}, lang: ${result.language}, district: ${result.district}, fallback: ${!!result.isFallback})`);
        passed++;
      } else {
        console.log(`FAIL (Fields invalid or unexpected category: ${result.category})`);
        failed++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.log(`FAIL: ${msg}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 2. TASK-031: Strict Semantic & Schema Validation
  // -------------------------------------------------------------------------
  console.log("\n--- TASK-031: Strict Validation Rules ---");

  // Test 2a: Invalid category
  process.stdout.write("2a. Testing invalid category rejection... ");
  const invalidCategoryRes = validateCitizenRequest({
    raw_text: "Need a new crypto exchange in Ramanagara.",
    district: "Ramanagara",
    category: "cryptocurrency",
    need_summary: "Build crypto hub",
    severity: "medium",
    ai_confidence: 0.9
  });
  if (!invalidCategoryRes.isValid && invalidCategoryRes.errors.some((e: string) => e.includes("Invalid category"))) {
    console.log(`PASS (Rejected: "${invalidCategoryRes.errors[0]}")`);
    passed++;
  } else {
    console.log("FAIL (Allowed invalid category)");
    failed++;
  }

  // Test 2b: Invalid confidence score
  process.stdout.write("2b. Testing invalid confidence range rejection... ");
  const invalidConfRes = validateCitizenRequest({
    raw_text: "Fix broken road in Ramanagara.",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Fix broken road",
    severity: "medium",
    ai_confidence: 2.5
  });
  if (!invalidConfRes.isValid && invalidConfRes.errors.some((e: string) => e.includes("Confidence score"))) {
    console.log(`PASS (Rejected: "${invalidConfRes.errors[0]}")`);
    passed++;
  } else {
    console.log("FAIL (Allowed out-of-range confidence)");
    failed++;
  }

  // Test 2c: Unknown district
  process.stdout.write("2c. Testing unknown district rejection... ");
  const unknownDistrictRes = validateCitizenRequest({
    raw_text: "Fix roads in Wonderland city.",
    district: "Wonderland",
    category: "roads",
    need_summary: "Roads need repair",
    severity: "medium",
    ai_confidence: 0.9
  });
  if (!unknownDistrictRes.isValid && unknownDistrictRes.errors.some((e: string) => e.includes("is not recognized"))) {
    console.log(`PASS (Rejected: "${unknownDistrictRes.errors[0]}")`);
    passed++;
  } else {
    console.log("FAIL (Allowed unknown district)");
    failed++;
  }

  // Test 2d: Empty/too short summary
  process.stdout.write("2d. Testing short need_summary rejection... ");
  const shortSummaryRes = validateCitizenRequest({
    raw_text: "Fix road in Ramanagara village.",
    district: "Ramanagara",
    category: "roads",
    need_summary: "no",
    severity: "medium",
    ai_confidence: 0.9
  });
  if (!shortSummaryRes.isValid && shortSummaryRes.errors.some((e: string) => e.includes("Need summary"))) {
    console.log(`PASS (Rejected: "${shortSummaryRes.errors[0]}")`);
    passed++;
  } else {
    console.log("FAIL (Allowed too short summary)");
    failed++;
  }

  // Test 2e: Valid request passes and canonicalizes state/district
  process.stdout.write("2e. Testing valid request passes with canonical state... ");
  const validRes = validateCitizenRequest({
    raw_text: "The main village bridge connecting to Ramanagara highway collapsed.",
    district: "ramanagara",
    category: "roads",
    need_summary: "Repair collapsed village bridge",
    severity: "high",
    ai_confidence: 0.95
  });
  if (validRes.isValid && validRes.validated?.district === "Ramanagara" && validRes.validated?.state === "Karnataka") {
    console.log(`PASS (Canonical district: ${validRes.validated.district}, State: ${validRes.validated.state})`);
    passed++;
  } else {
    console.log("FAIL:", validRes.errors);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 3. TASK-032: Persist Request Through Server Route
  // -------------------------------------------------------------------------
  console.log("\n--- TASK-032: Persistence Layer via Server Route ---");

  const PORT = Number(process.env.PORT) || 3032;
  let serverProcess: ChildProcess | null = null;

  try {
    const isAlreadyRunning = await checkPort(PORT);
    if (!isAlreadyRunning) {
      console.log(`Starting Next.js production server on port ${PORT}...`);
      serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
        stdio: "pipe",
        env: { ...process.env, PORT: String(PORT) },
      });
      await waitForServer(PORT);
      console.log(`Server ready on port ${PORT}.\n`);
    }

    // Test 3a: Submit valid request
    process.stdout.write("3a. Testing POST /api/requests submit valid record... ");
    const submitRes = await postJson(PORT, "/api/requests", {
      action: "submit",
      source: "text",
      requestData: {
        raw_text: "Drinking water pipeline in Bahraich is leaking continuously.",
        language_code: "en",
        district: "Bahraich",
        category: "water",
        need_summary: "Fix leaking drinking water pipe",
        severity: "high",
        ai_confidence: 0.92
      }
    });

    const submitBody = submitRes.body;
    if (
      submitRes.status === 200 &&
      submitBody?.success &&
      submitBody.request?.id &&
      /^[0-9a-f-]{36}$/i.test(submitBody.request.id) &&
      submitBody.request.category === "water" &&
      submitBody.request.district === "Bahraich"
    ) {
      console.log(`PASS (Saved record UUID: ${submitBody.request.id}, provider: ${submitBody.provider})`);
      passed++;
    } else {
      console.log("FAIL:", submitRes);
      failed++;
    }

    // Test 3b: Submit invalid data rejected with 422
    process.stdout.write("3b. Testing POST /api/requests reject invalid data with 422... ");
    const rejectRes = await postJson(PORT, "/api/requests", {
      action: "submit",
      requestData: {
        raw_text: "Valid text here",
        district: "UnknownDistrict",
        category: "invalid_category",
        need_summary: "",
        severity: "extreme",
        ai_confidence: 5.0
      }
    });

    const rejectBody = rejectRes.body;
    if (rejectRes.status === 422 && rejectBody?.details && rejectBody.details.length > 0) {
      console.log(`PASS (HTTP 422 with ${rejectBody.details.length} validation errors)`);
      passed++;
    } else {
      console.log(`FAIL (Expected 422, got ${rejectRes.status})`);
      failed++;
    }
  } finally {
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }

  // -------------------------------------------------------------------------
  // 4. TASK-033: Deterministic Score & Category Mapping
  // -------------------------------------------------------------------------
  console.log("\n--- TASK-033: Deterministic Scoring & Category Mapping ---");

  // Test 4a: Category to project mapping
  process.stdout.write("4a. Testing deterministic category-to-project mappings... ");
  let mappingsCorrect = true;
  for (const cat of ALLOWED_CATEGORIES) {
    const project = getRecommendedProject(cat);
    if (!project || (project === "Further planning review required" && cat !== "other")) {
      mappingsCorrect = false;
      break;
    }
  }
  if (mappingsCorrect && CATEGORY_PROJECT_MAPPING.roads === "Rural road rehabilitation") {
    console.log(`PASS (All 8 categories mapped deterministically)`);
    passed++;
  } else {
    console.log("FAIL (Mapping error)");
    failed++;
  }

  // Test 4b: Priority formula determinism
  process.stdout.write("4b. Testing priority formula calculation determinism... ");
  const inputs = {
    requestCount: 10,
    population: 55000,
    infrastructureGapIndex: 78,
    plannedCoveragePct: 22,
    populationImpactScore: 72
  };
  const score1 = calculatePriorityScore(inputs);
  const score2 = calculatePriorityScore(inputs);

  // Exact math:
  // requestsPer100k = (10/55000)*100000 = 18.1818... -> 18.2
  // demandScore = min(100, 18.1818... * 5) = 90.909... -> 90.9
  // unaddressedGap = 78 * (1 - 0.22) = 60.84 -> 60.8
  // priorityScore = 0.40 * 90.909... + 0.30 * 78 + 0.15 * 72 + 0.15 * 60.84 = 79.7
  if (
    score1.priorityScore === score2.priorityScore &&
    score1.demandScore === 90.9 &&
    score1.unaddressedGap === 60.8 &&
    score1.priorityScore === 79.7
  ) {
    console.log(`PASS (Score: ${score1.priorityScore}, Demand: ${score1.demandScore}, UnaddressedGap: ${score1.unaddressedGap})`);
    passed++;
  } else {
    console.log(`FAIL:`, score1);
    failed++;
  }

  // Test 4c: Aggregation hotspot calculation
  process.stdout.write("4c. Testing aggregation planning signals on seed data... ");
  const signals = computePlanningSignals(SEED_CITIZEN_REQUESTS, SEED_DISTRICT_CONTEXT);
  const topHotspot = signals.hotspots[0];

  if (
    signals.summary.total_requests === SEED_CITIZEN_REQUESTS.length &&
    topHotspot.district === "Ramanagara" &&
    topHotspot.category === "roads" &&
    topHotspot.priority_score === 79.7 &&
    topHotspot.recommended_project === "Rural road rehabilitation"
  ) {
    console.log(`PASS (Rank #1 Hotspot: ${topHotspot.district} ${topHotspot.category}, Score: ${topHotspot.priority_score})`);
    passed++;
  } else {
    console.log("FAIL:", topHotspot);
    failed++;
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n==================================================");
  console.log(`  M3 PIPELINE RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runM3Verification().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
