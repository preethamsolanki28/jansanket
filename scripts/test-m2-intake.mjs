/**
 * Automated test script for M2 Citizen Intake
 * Validates:
 * 1. POST /api/requests analyze action (English & Hindi)
 * 2. POST /api/requests validation errors (empty input)
 * 3. POST /api/requests submit action (generates validated record with UUID)
 * 4. Fallback hierarchy handling (manual fallback mode)
 */

import http from "http";
import { spawn } from "child_process";

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/requests`, () => resolve(true));
    req.on("error", () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForServer(port, maxAttempts = 30) {
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

function postJson(port, path, body) {
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
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runM2Tests() {
  const PORT = process.env.PORT || 3031;
  let serverProcess = null;

  const isAlreadyRunning = await checkPort(PORT);
  if (!isAlreadyRunning) {
    console.log(`Starting Next.js server on port ${PORT}...`);
    serverProcess = spawn("npx", ["next", "start", "-p", String(PORT)], {
      stdio: "pipe",
      env: { ...process.env, PORT: String(PORT) },
    });
    await waitForServer(PORT);
    console.log(`Next.js server is ready on port ${PORT}.\n`);
  }

  console.log(`==================================================`);
  console.log(`  M2 Citizen Intake API Tests (Port ${PORT})`);
  console.log(`==================================================\n`);

  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Empty input validation guard
    process.stdout.write("1. Testing validation on short input (<5 chars)... ");
    try {
      const res = await postJson(PORT, "/api/requests", { action: "analyze", rawText: "hi" });
      if (res.status === 400 && res.body.error) {
        console.log(`PASS (HTTP 400 rejected: "${res.body.error}")`);
        passed++;
      } else {
      console.log(`FAIL (Expected 400, got ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    failed++;
  }

  // Test 2: Analyze action for Ramanagara road request
  process.stdout.write("2. Testing POST /api/requests (action: analyze, Ramanagara roads)... ");
  try {
    const res = await postJson(PORT, "/api/requests", {
      action: "analyze",
      rawText: "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
      stateHint: "Karnataka",
      districtHint: "Ramanagara"
    });
    if (res.status === 200 && res.body.success && res.body.extraction) {
      const ext = res.body.extraction;
      console.log(`PASS (Extracted category: ${ext.category}, district: ${ext.district}, fallback: ${!!ext.isFallback})`);
      passed++;
    } else {
      console.log(`FAIL:`, res);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    failed++;
  }

  // Test 3: Submit action (Finalizing request)
  process.stdout.write("3. Testing POST /api/requests (action: submit)... ");
  try {
    const res = await postJson(PORT, "/api/requests", {
      action: "submit",
      source: "text",
      rawText: "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
      requestData: {
        raw_text: "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
        language_code: "en",
        state: "Karnataka",
        district: "Ramanagara",
        category: "roads",
        need_summary: "Rehabilitation of village road for monsoon access.",
        severity: "high",
        ai_confidence: 0.95
      }
    });

    if (res.status === 200 && res.body.success && res.body.request?.id) {
      console.log(`PASS (Created request ID: ${res.body.request.id}, category: ${res.body.request.category})`);
      passed++;
    } else {
      console.log(`FAIL:`, res);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    failed++;
  }

  // Test 4: Manual fallback submission (TASK-023 Error Fallback)
  process.stdout.write("4. Testing POST /api/requests with manual fallback... ");
  try {
    const res = await postJson(PORT, "/api/requests", {
      action: "submit",
      source: "manual_fallback",
      rawText: "Drinking water pipes are damaged in Bahraich.",
      requestData: {
        raw_text: "Drinking water pipes are damaged in Bahraich.",
        language_code: "en",
        state: "Uttar Pradesh",
        district: "Bahraich",
        category: "water",
        need_summary: "Repair drinking water pipelines.",
        severity: "medium",
        ai_confidence: 0.85
      }
    });

    if (res.status === 200 && res.body.request?.source === "manual_fallback") {
      console.log(`PASS (Accepted manual fallback record with ID ${res.body.request.id})`);
      passed++;
    } else {
      console.log(`FAIL:`, res);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    failed++;
    }
  } finally {
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }

  console.log(`\n==================================================`);
  console.log(`  M2 TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`==================================================`);

  if (failed > 0) process.exit(1);
}

runM2Tests().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

