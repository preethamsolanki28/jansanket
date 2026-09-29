/**
 * Comprehensive Automated Verification Script for Milestone 4 (M4):
 * TASK-040 — KPI summary (total requests, districts covered, active hotspots)
 * TASK-041 — Hotspot view (hotspot table sorted strictly descending by priority score)
 * TASK-042 — Why this hotspot? (demand score, gap, impact, coverage, unaddressed gap, priority signal, demo_synthetic)
 * TASK-043 — Refresh after submission (submitting new request visibly increments counts & recalculates score)
 */

import http from "http";
import { spawn, ChildProcess } from "child_process";

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/dashboard`, () => resolve(true));
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
  summary?: {
    total_requests: number;
    districts: number;
    hotspots: number;
  };
  hotspots?: Array<{
    state: string;
    district: string;
    category: string;
    request_count: number;
    demand_score: number;
    infrastructure_gap_index: number;
    population_impact_score: number;
    planned_coverage_pct: number;
    unaddressed_gap: number;
    priority_score: number;
    recommended_project: string;
    source_status: string;
  }>;
  meta?: {
    provider: string;
    is_database_online: boolean;
    updated_at: string;
  };
  request?: {
    id: string;
    category: string;
    district: string;
  };
  success?: boolean;
}

interface HttpResponse {
  status: number;
  body?: ApiResponse;
  raw?: string;
}

function fetchJson(port: number, path: string): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 500, raw: data });
        }
      });
    });
    req.on("error", reject);
  });
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

async function runM4Verification() {
  console.log("==================================================");
  console.log("  M4 PLANNER DASHBOARD VERIFICATION");
  console.log("==================================================\n");

  const PORT = Number(process.env.PORT) || 3033;
  let serverProcess: ChildProcess | null = null;
  let passed = 0;
  let failed = 0;

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

    // -------------------------------------------------------------------------
    // 1. TASK-040: KPI Summary
    // -------------------------------------------------------------------------
    console.log("--- TASK-040: KPI Summary Cards ---");
    process.stdout.write("1. Testing GET /api/dashboard KPI summary... ");
    const dashRes = await fetchJson(PORT, "/api/dashboard");

    const summary = dashRes.body?.summary;
    if (
      dashRes.status === 200 &&
      summary &&
      summary.total_requests >= 52 &&
      summary.districts === 8 &&
      summary.hotspots >= 14
    ) {
      console.log(`PASS (Total requests: ${summary.total_requests}, Districts: ${summary.districts}, Hotspots: ${summary.hotspots})`);
      passed++;
    } else {
      console.log("FAIL:", dashRes);
      failed++;
    }

    // -------------------------------------------------------------------------
    // 2. TASK-041: Hotspot View (Ranking & Sorting)
    // -------------------------------------------------------------------------
    console.log("\n--- TASK-041: Hotspot View & Ranking ---");
    process.stdout.write("2a. Testing hotspot list sorted strictly descending by priority score... ");
    const hotspots = dashRes.body?.hotspots || [];

    let isSorted = hotspots.length > 0;
    for (let i = 1; i < hotspots.length; i++) {
      if (hotspots[i].priority_score > hotspots[i - 1].priority_score) {
        isSorted = false;
        break;
      }
    }

    if (isSorted && hotspots.length >= 14) {
      console.log(`PASS (${hotspots.length} hotspots properly ordered)`);
      passed++;
    } else {
      console.log("FAIL: Hotspots not sorted descending by priority score");
      failed++;
    }

    process.stdout.write("2b. Testing Hero Hotspot #1 is Ramanagara Roads... ");
    const topHotspot = hotspots[0];
    if (
      topHotspot &&
      topHotspot.district === "Ramanagara" &&
      topHotspot.category === "roads" &&
      topHotspot.priority_score === 79.7
    ) {
      console.log(`PASS (Rank #1: ${topHotspot.district} ${topHotspot.category}, Score: ${topHotspot.priority_score})`);
      passed++;
    } else {
      console.log("FAIL: Top hotspot mismatch:", topHotspot);
      failed++;
    }

    // -------------------------------------------------------------------------
    // 3. TASK-042: "Why this hotspot?" Breakdown & Transparency
    // -------------------------------------------------------------------------
    console.log("\n--- TASK-042: 'Why this hotspot?' Mathematical Evidence ---");
    process.stdout.write("3a. Testing complete metric breakdown on selected hotspot... ");
    const hasAllMetrics =
      typeof topHotspot.demand_score === "number" &&
      typeof topHotspot.infrastructure_gap_index === "number" &&
      typeof topHotspot.population_impact_score === "number" &&
      typeof topHotspot.planned_coverage_pct === "number" &&
      typeof topHotspot.unaddressed_gap === "number" &&
      typeof topHotspot.priority_score === "number" &&
      typeof topHotspot.recommended_project === "string" &&
      topHotspot.source_status === "demo_synthetic";

    if (hasAllMetrics && topHotspot.recommended_project === "Rural road rehabilitation") {
      console.log(`PASS (Demand: ${topHotspot.demand_score}, Gap: ${topHotspot.infrastructure_gap_index}, Impact: ${topHotspot.population_impact_score}, Coverage: ${topHotspot.planned_coverage_pct}%, Unaddressed: ${topHotspot.unaddressed_gap})`);
      passed++;
    } else {
      console.log("FAIL: Missing metrics or wrong project mapping:", topHotspot);
      failed++;
    }

    process.stdout.write("3b. Testing mathematical integrity of the priority formula... ");
    // Formula: 0.40 * demand + 0.30 * gap + 0.15 * impact + 0.15 * unaddressed
    const calculatedMath =
      0.40 * topHotspot.demand_score +
      0.30 * topHotspot.infrastructure_gap_index +
      0.15 * topHotspot.population_impact_score +
      0.15 * topHotspot.unaddressed_gap;
    const roundedExpected = Math.round(calculatedMath * 10) / 10;

    if (Math.abs(roundedExpected - topHotspot.priority_score) <= 0.1) {
      console.log(`PASS (Verified: 0.40(${topHotspot.demand_score}) + 0.30(${topHotspot.infrastructure_gap_index}) + 0.15(${topHotspot.population_impact_score}) + 0.15(${topHotspot.unaddressed_gap}) = ${topHotspot.priority_score})`);
      passed++;
    } else {
      console.log(`FAIL (Expected ${roundedExpected}, got ${topHotspot.priority_score})`);
      failed++;
    }

    // -------------------------------------------------------------------------
    // 4. TASK-043: Refresh After Submission
    // -------------------------------------------------------------------------
    console.log("\n--- TASK-043: Dynamic Refresh After Submission ---");
    process.stdout.write("4a. Submitting a new citizen request for Ramanagara roads... ");

    const initialTotal = summary!.total_requests;
    const initialRamanagaraCount = topHotspot.request_count;

    const postRes = await postJson(PORT, "/api/requests", {
      action: "submit",
      source: "text",
      requestData: {
        raw_text: "Monsoon flood washed away the road culvert in Ramanagara village connecting to highway.",
        district: "Ramanagara",
        category: "roads",
        need_summary: "Rebuild washed away road culvert",
        severity: "high",
        ai_confidence: 0.96
      }
    });

    if (postRes.status === 200 && postRes.body?.success) {
      console.log(`PASS (Created request ${postRes.body.request?.id})`);
      passed++;
    } else {
      console.log("FAIL to create request:", postRes);
      failed++;
    }

    process.stdout.write("4b. Verifying dashboard visibly updates with new request... ");
    const updatedDash = await fetchJson(PORT, "/api/dashboard");
    const updatedSummary = updatedDash.body?.summary;
    const updatedTopHotspot = updatedDash.body?.hotspots?.find(
      (h) => h.district === "Ramanagara" && h.category === "roads"
    );

    const totalIncremented = updatedSummary?.total_requests === initialTotal + 1;
    const ramanagaraIncremented = updatedTopHotspot?.request_count === initialRamanagaraCount + 1;
    // With 11 requests: requestsPer100k = (11/55000)*100000 = 20. DemandScore = min(100, 20*5) = 100!
    // PriorityScore = 0.40(100) + 0.30(78) + 0.15(72) + 0.15(60.84) = 40 + 23.4 + 10.8 + 9.126 = 83.3!
    const scoreUpdated = (updatedTopHotspot?.priority_score || 0) > topHotspot.priority_score;

    if (totalIncremented && ramanagaraIncremented && scoreUpdated) {
      console.log(
        `PASS (Total: ${initialTotal} -> ${updatedSummary?.total_requests}, Ramanagara requests: ${initialRamanagaraCount} -> ${updatedTopHotspot?.request_count}, Score: ${topHotspot.priority_score} -> ${updatedTopHotspot?.priority_score})`
      );
      passed++;
    } else {
      console.log("FAIL: Dashboard did not update after submission:", {
        totalIncremented,
        ramanagaraIncremented,
        scoreUpdated,
        before: { total: initialTotal, reqs: initialRamanagaraCount, score: topHotspot.priority_score },
        after: { total: updatedSummary?.total_requests, reqs: updatedTopHotspot?.request_count, score: updatedTopHotspot?.priority_score }
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log("\n==================================================");
    console.log(`  M4 DASHBOARD RESULTS: ${passed} passed, ${failed} failed`);
    console.log("==================================================");

    if (failed > 0) process.exit(1);
  } finally {
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }
}

runM4Verification().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
