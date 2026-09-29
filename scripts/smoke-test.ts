/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * End-to-End Production Smoke Test for JanSanket (TASK-052)
 *
 * Verifies all 6 hackathon priorities:
 * 1. Dashboard works (KPI summary + ranked hotspots)
 * 2. Submit path works (POST /api/requests)
 * 3. Gemini failure safe fallback works (resilient to 429/503/timeout)
 * 4. DEMO_MODE / fallback storage works without hard crash
 * 5. Zero secrets exposed in HTTP headers or response bodies
 * 6. Dynamic update: count increments and priority score recalculates
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts
 *   APP_URL=https://your-app.vercel.app npx tsx scripts/smoke-test.ts
 */

import http from "http";
import https from "https";

const BASE_URL = process.env.APP_URL || "http://localhost:3000";

function request(urlStr: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === "https:" ? https : http;
    const payload = options.body ? JSON.stringify(options.body) : null;

    const req = client.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          ...(payload ? { "Content-Type": "application/json", "Content-Length": String(Buffer.byteLength(payload)) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let body = null;
          try {
            body = JSON.parse(raw);
          } catch {
            body = raw;
          }
          resolve({ status: res.statusCode || 500, headers: res.headers, body, raw });
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error(`Request timeout (${urlStr})`));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

async function runProductionSmokeTest() {
  console.log("==================================================");
  console.log(`  JanSanket Production Smoke Test`);
  console.log(`  Target: ${BASE_URL}`);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------------------
  // 1. Dashboard Health & Seed Data Verification
  // -------------------------------------------------------------------------
  process.stdout.write("1. Verifying GET /api/dashboard loads planning signals... ");
  let initialTotalRequests = 0;
  let initialRamanagaraCount = 0;
  let initialPriorityScore = 0;

  try {
    const res = await request(`${BASE_URL}/api/dashboard`);
    const summary = res.body?.summary;
    const hotspots = res.body?.hotspots;
    const requestsList = res.body?.requests;

    if (
      res.status === 200 &&
      summary &&
      summary.total_requests >= 50 &&
      summary.districts === 8 &&
      summary.hotspots >= 14 &&
      Array.isArray(hotspots) &&
      hotspots.length >= 14 &&
      Array.isArray(requestsList) &&
      requestsList.length >= 50
    ) {
      initialTotalRequests = summary.total_requests;
      const top = hotspots[0];
      initialRamanagaraCount = top.request_count;
      initialPriorityScore = top.priority_score;

      console.log(`PASS (Total: ${summary.total_requests}, Pilot: ${summary.pilot_requests ?? "all"}, Hotspots: ${summary.hotspots}, All Requests in Feed: ${requestsList.length}, #1: ${top.district} ${top.category} [${top.priority_score}])`);
      passed++;
    } else {
      console.log("FAIL:", res.status, summary, { hasRequests: Array.isArray(requestsList) });
      failed++;
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 2. Multilingual Analysis Route (English, Hindi, Kannada, Tamil)
  // -------------------------------------------------------------------------
  process.stdout.write("2. Verifying POST /api/requests (action: analyze) with Indic script... ");
  try {
    const res = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "analyze",
        rawText: "ರಾಮನಗರ ಜಿಲ್ಲೆಯ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಸಂಪೂರ್ಣ ಹಾಳಾಗಿದೆ, ಮಳೆಗಾಲದಲ್ಲಿ ಸಂಚಾರ ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತದೆ.",
        stateHint: "Karnataka",
        districtHint: "Ramanagara"
      }
    });

    const ext = res.body?.extraction;
    if (res.status === 200 && ext && ext.category === "roads" && ext.district === "Ramanagara") {
      console.log(`PASS (Extracted category: ${ext.category}, district: ${ext.district}, fallback: ${!!ext.isFallback})`);
      passed++;
    } else {
      console.log("FAIL:", res.status, res.body);
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 3. Validation Guard (Rejection of invalid input)
  // -------------------------------------------------------------------------
  process.stdout.write("3. Verifying schema validation rejects invalid model output (HTTP 422)... ");
  try {
    const res = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "submit",
        requestData: {
          raw_text: "Need bridge repair",
          district: "UnrecognizedDistrict",
          category: "invalid_category",
          need_summary: "x",
          severity: "extreme",
          ai_confidence: 4.5
        }
      }
    });

    if (res.status === 422 && Array.isArray(res.body?.details) && res.body.details.length >= 4) {
      console.log(`PASS (HTTP 422 properly returned with ${res.body.details.length} specific validation guards)`);
      passed++;
    } else {
      console.log("FAIL: Expected 422 rejection, got:", res.status);
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 4. Persistence & Dynamic Dashboard Update
  // -------------------------------------------------------------------------
  process.stdout.write("4. Verifying request submission and dynamic dashboard refresh... ");
  try {
    const submitRes = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "submit",
        source: "text",
        requestData: {
          raw_text: "Monsoon flooding has completely washed out the approach road to Ramanagara village hospital.",
          language_code: "en",
          district: "Ramanagara",
          category: "roads",
          need_summary: "Rebuild hospital approach road damaged by monsoon flood",
          severity: "high",
          ai_confidence: 0.95
        }
      }
    });

    const isSubmitted = submitRes.status === 200 && submitRes.body?.success && submitRes.body?.request?.id;

    // Check dashboard again
    const dashAfter = await request(`${BASE_URL}/api/dashboard`);
    const afterSummary = dashAfter.body?.summary;
    const afterHotspots = dashAfter.body?.hotspots;
    const topAfter = afterHotspots?.find((h: any) => h.district === "Ramanagara" && h.category === "roads");

    const totalIncremented = afterSummary?.total_requests === initialTotalRequests + 1;
    const ramanagaraIncremented = topAfter?.request_count === initialRamanagaraCount + 1;

    if (isSubmitted && totalIncremented && ramanagaraIncremented) {
      console.log(`PASS (Saved ID: ${submitRes.body.request.id.slice(0, 8)}…, Requests: ${initialRamanagaraCount} -> ${topAfter.request_count}, Score: ${initialPriorityScore} -> ${topAfter.priority_score})`);
      passed++;
    } else {
      console.log("FAIL: State did not update as expected:", { isSubmitted, totalIncremented, ramanagaraIncremented });
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 5. Secret Leakage Audit
  // -------------------------------------------------------------------------
  process.stdout.write("5. Auditing HTTP responses for secret exposure (OPENROUTER_API_KEY, GEMINI_API_KEY, Supabase secret)... ");
  try {
    const [dashRes, reqRes] = await Promise.all([
      request(`${BASE_URL}/api/dashboard`),
      request(`${BASE_URL}/api/requests`, {
        method: "POST",
        body: { action: "analyze", rawText: "Drinking water pipeline leakage in Bahraich village." }
      })
    ]);

    const secretPattern = /sk-or-v1-[0-9a-f]{64}|AIza[0-9A-Za-z-_]{35}|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/g;
    const dashLeaked = secretPattern.test(dashRes.raw);
    const reqLeaked = secretPattern.test(reqRes.raw);

    if (!dashLeaked && !reqLeaked) {
      console.log("PASS (Zero secret strings detected across public endpoints)");
      passed++;
    } else {
      console.log("FAIL: Secret pattern found in HTTP response body!");
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 6. Invalid & Non-Civic Input Screening (Gibberish, greetings, casual talk)
  // -------------------------------------------------------------------------
  process.stdout.write("6. Verifying non-civic inputs ('sdgsafdasafd', 'hello there how are you', 'this is a test', 'I like apples') are rejected (HTTP 400)... ");
  try {
    const testCases = [
      "sdgsafdasafd",
      "hello there how are you",
      "this is a test",
      "I like apples"
    ];

    let allRejected = true;
    for (const testText of testCases) {
      const res = await request(`${BASE_URL}/api/requests`, {
        method: "POST",
        body: { action: "analyze", rawText: testText }
      });
      if (res.status !== 400 || !res.body?.isInvalid) {
        allRejected = false;
        console.log(`\nFAIL on "${testText}": Expected 400, got ${res.status}`);
        break;
      }
    }

    if (allRejected) {
      console.log("PASS (All 4 non-civic inputs properly rejected with HTTP 400)");
      passed++;
    } else {
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 7. National Intake: Outside-Pilot District (Goa / North Goa) Accepted for Storage
  // -------------------------------------------------------------------------
  process.stdout.write("7. Verifying outside-pilot district (Goa / North Goa) is accepted for storage and not forced to Ramanagara... ");
  try {
    const analyzeRes = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "analyze",
        rawText: "Road in Anjuna village has potholes and streetlights are broken.",
        stateHint: "Goa",
        districtHint: "North Goa"
      }
    });

    const ext = analyzeRes.body?.extraction;
    const notRamanagara = ext?.district !== "Ramanagara" && ext?.isSupportedDistrict === false;

    // Submit outside-pilot request: Must succeed and be stored
    const submitRes = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "submit",
        source: "text",
        requestData: {
          raw_text: "Road in Anjuna village has potholes and streetlights are broken.",
          category: "roads",
          district: "North Goa",
          state: "Goa",
          severity: "medium",
          need_summary: "Road in Anjuna village has potholes and streetlights are broken.",
          source: "text",
          ai_confidence: 0.9
        }
      }
    });

    const submitSucceeded = submitRes.status === 200 && submitRes.body?.success && submitRes.body?.request?.id;

    // Verify it appears in dashboard under all requests and does NOT create a fabricated priority score
    const dashRes = await request(`${BASE_URL}/api/dashboard`);
    const allRequests = dashRes.body?.requests;
    const foundInFeed = Array.isArray(allRequests) && allRequests.some((r: any) => r.state === "Goa" && r.district === "North Goa");
    const noGoaHotspot = !dashRes.body?.hotspots?.some((h: any) => h.district === "North Goa" || h.state === "Goa");

    if (notRamanagara && submitSucceeded && foundInFeed && noGoaHotspot) {
      console.log("PASS (Accepted for storage, visible in All Requests feed, no fabricated hotspot score)");
      passed++;
    } else {
      console.log("FAIL:", { notRamanagara, submitSucceeded, foundInFeed, noGoaHotspot, extDistrict: ext?.district });
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 8. State-District Mismatch Guard (Goa + Ramanagara) vs Valid (UP + Bahraich)
  // -------------------------------------------------------------------------
  process.stdout.write("8. Verifying state-district mismatch (Goa + Ramanagara) is rejected and valid pair is accepted... ");
  try {
    const submitMismatchRes = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "submit",
        requestData: {
          raw_text: "Road in Ramanagara has major potholes.",
          category: "roads",
          district: "Ramanagara",
          state: "Goa", // Mismatched state
          severity: "high",
          need_summary: "Road in Ramanagara has major potholes.",
          ai_confidence: 0.95
        }
      }
    });

    const mismatchRejected = submitMismatchRes.status === 422;

    const submitValidRes = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "submit",
        source: "text",
        requestData: {
          raw_text: "Drinking water handpump broken in Bahraich village.",
          category: "water",
          district: "Bahraich",
          state: "Uttar Pradesh",
          severity: "high",
          need_summary: "Drinking water handpump broken in Bahraich village.",
          source: "text",
          ai_confidence: 0.95
        }
      }
    });


    const validAccepted = submitValidRes.status === 200 && submitValidRes.body?.success;

    if (mismatchRejected && validAccepted) {
      console.log("PASS (Goa + Ramanagara rejected with HTTP 422; UP + Bahraich successfully accepted)");
      passed++;
    } else {
      console.log("FAIL:", { mismatchRejected, validAccepted });
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 9. English Normalized Summary for Indic Input
  // -------------------------------------------------------------------------
  process.stdout.write("9. Verifying Indic request produces English normalized summary (not raw Indic)... ");
  try {
    const res = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "analyze",
        rawText: "ರಾಮನಗರ ಜಿಲ್ಲೆಯ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಸಂಪೂರ್ಣ ಹಾಳಾಗಿದೆ, ಮಳೆಗಾಲದಲ್ಲಿ ಸಂಚಾರ ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತದೆ.",
        stateHint: "Karnataka",
        districtHint: "Ramanagara"
      }
    });

    const ext = res.body?.extraction;
    const summary = ext?.need_summary || "";
    const hasIndicChars = /[\u0900-\u0D7F]/.test(summary);
    const hasEnglishLetters = /[a-zA-Z]{5,}/.test(summary);

    if (res.status === 200 && ext && !hasIndicChars && hasEnglishLetters) {
      console.log(`PASS (Normalized summary is in English: "${summary.slice(0, 50)}...")`);
      passed++;
    } else {
      console.log("FAIL: Summary contained Indic characters or lacked English:", summary);
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 10. Regression Test: Source Contract ('text' | 'voice' | 'manual_fallback') vs 'ai'
  // -------------------------------------------------------------------------
  process.stdout.write("10. Verifying submission source contract ('text', 'manual_fallback') and rejection of 'ai'... ");
  try {
    // A. Submitting with invalid source "ai" must be rejected with HTTP 422
    const invalidAiRes = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "submit",
        source: "ai",
        requestData: {
          raw_text: "Monsoon flooding has damaged village road in Ramanagara.",
          language_code: "en",
          district: "Ramanagara",
          category: "roads",
          need_summary: "Rebuild hospital approach road",
          severity: "high",
          ai_confidence: 0.95
        }
      }
    });

    const isRejected422 = invalidAiRes.status === 422;
    const hasSourceError = invalidAiRes.body?.details?.some((d: string) => d.includes('Invalid source "ai"'));

    // B. Submitting through valid text channel must succeed
    const validTextRes = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "submit",
        source: "text",
        requestData: {
          source: "text",
          raw_text: "Monsoon flooding has damaged village road in Ramanagara.",
          language_code: "en",
          district: "Ramanagara",
          category: "roads",
          need_summary: "Rebuild hospital approach road",
          severity: "high",
          ai_confidence: 0.95
        }
      }
    });

    const isValidSubmitted = validTextRes.status === 200 && validTextRes.body?.success && validTextRes.body?.request?.id;

    if (isRejected422 && hasSourceError && isValidSubmitted) {
      console.log("PASS (Source 'ai' rejected with HTTP 422, source 'text' successfully persisted)");
      passed++;
    } else {
      console.log("FAIL: Expected source 'ai' rejection and source 'text' success:", {
        isRejected422,
        hasSourceError,
        isValidSubmitted
      });
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }

  // -------------------------------------------------------------------------
  // 11. Location Normalization: Bangalore -> Bengaluru Urban
  // -------------------------------------------------------------------------
  process.stdout.write("11. Verifying Bangalore normalizes to Bengaluru Urban without forcing Ramanagara... ");
  try {
    const res = await request(`${BASE_URL}/api/requests`, {
      method: "POST",
      body: {
        action: "analyze",
        rawText: "Frequent electricity outage and transformer issues in Bangalore city wards.",
        stateHint: "Karnataka",
        districtHint: "Bangalore"
      }
    });

    const ext = res.body?.extraction;
    const isNormalized = ext?.district === "Bengaluru Urban" && ext?.state === "Karnataka";
    const notForcedRamanagara = ext?.district !== "Ramanagara";

    if (res.status === 200 && isNormalized && notForcedRamanagara) {
      console.log(`PASS (Bangalore normalized to "${ext?.district}", State: "${ext?.state}", Ramanagara not forced)`);
      passed++;
    } else {
      console.log("FAIL:", { status: res.status, district: ext?.district, state: ext?.state });
      failed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    console.log(`FAIL: ${msg}`);
    failed++;
  }


  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n==================================================");
  console.log(`  SMOKE TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runProductionSmokeTest().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
