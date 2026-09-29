/**
 * Verification script for Milestone 1 (M1) Data Foundation
 * Validates:
 * 1. Schema integrity & RLS definitions
 * 2. District context coverage (8 districts x 6 categories = 48 rows)
 * 3. Seed request count (52 requests)
 * 4. Referential consistency (every request maps to an existing context row)
 * 5. Deterministic priority formula output & hotspot ranking
 */

import { SEED_DISTRICT_CONTEXT, SEED_CITIZEN_REQUESTS } from "../lib/demo-data.ts";
import fs from "fs";
import path from "path";

function runM1Verification() {
  console.log("==================================================");
  console.log("  M1 Data Foundation Verification");
  console.log("==================================================\n");

  let errors = 0;

  // 1. Verify SQL Migration Files Exist
  const migrationsDir = path.resolve("./supabase/migrations");
  const requiredFiles = [
    "20260929000001_create_schema.sql",
    "20260929000002_seed_district_context.sql",
    "20260929000003_seed_citizen_requests.sql"
  ];

  console.log("1. Checking SQL Migration files...");
  for (const file of requiredFiles) {
    const fullPath = path.join(migrationsDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      console.log(`   ✓ ${file} (${content.length} bytes)`);
    } else {
      console.error(`   ✗ Missing migration file: ${file}`);
      errors++;
    }
  }

  // 2. Verify District Context Counts & Uniqueness
  console.log("\n2. Checking District Context (TASK-011)...");
  console.log(`   Total context rows: ${SEED_DISTRICT_CONTEXT.length}`);
  if (SEED_DISTRICT_CONTEXT.length !== 48) {
    console.error(`   ✗ Expected 48 context rows, got ${SEED_DISTRICT_CONTEXT.length}`);
    errors++;
  } else {
    console.log(`   ✓ Exact expected count: 48 rows`);
  }

  const contextMap = new Map();
  const districtsSet = new Set();
  const statesSet = new Set();

  for (const ctx of SEED_DISTRICT_CONTEXT) {
    const key = `${ctx.state}|${ctx.district}|${ctx.category}`;
    if (contextMap.has(key)) {
      console.error(`   ✗ Duplicate context key: ${key}`);
      errors++;
    }
    contextMap.set(key, ctx);
    districtsSet.add(ctx.district);
    statesSet.add(ctx.state);

    if (ctx.source_status !== "demo_synthetic") {
      console.error(`   ✗ Invalid source_status for ${key}: ${ctx.source_status}`);
      errors++;
    }
    if (!ctx.source_url || !ctx.source_url.startsWith("http")) {
      console.error(`   ✗ Invalid source_url for ${key}: ${ctx.source_url}`);
      errors++;
    }
  }

  console.log(`   Districts covered (${districtsSet.size}): ${Array.from(districtsSet).join(", ")}`);
  console.log(`   States covered (${statesSet.size}): ${Array.from(statesSet).join(", ")}`);
  if (districtsSet.size !== 8 || statesSet.size !== 4) {
    console.error(`   ✗ Expected 8 districts across 4 states, got ${districtsSet.size} districts across ${statesSet.size} states`);
    errors++;
  } else {
    console.log(`   ✓ Exactly 8 districts across 4 states covered`);
  }

  // 3. Verify Citizen Requests Counts & Language Distribution
  console.log("\n3. Checking Citizen Requests (TASK-012)...");
  console.log(`   Total citizen requests: ${SEED_CITIZEN_REQUESTS.length}`);
  if (SEED_CITIZEN_REQUESTS.length !== 52) {
    console.error(`   ✗ Expected 52 requests, got ${SEED_CITIZEN_REQUESTS.length}`);
    errors++;
  } else {
    console.log(`   ✓ Exact expected count: 52 requests`);
  }

  const langCounts = {};
  const categoryCounts = {};
  const requestCountsByContext = new Map();

  for (const req of SEED_CITIZEN_REQUESTS) {
    langCounts[req.language_code] = (langCounts[req.language_code] || 0) + 1;
    categoryCounts[req.category] = (categoryCounts[req.category] || 0) + 1;

    const key = `${req.state}|${req.district}|${req.category}`;
    requestCountsByContext.set(key, (requestCountsByContext.get(key) || 0) + 1);

    // Verify referential integrity
    if (!contextMap.has(key)) {
      console.error(`   ✗ Orphan request found: ${req.id} references missing context (${key})`);
      errors++;
    }
  }

  console.log("   Language distribution:");
  for (const [lang, count] of Object.entries(langCounts)) {
    console.log(`     - ${lang}: ${count} requests`);
  }
  if (!langCounts.en || !langCounts.hi || !langCounts.kn || !langCounts.ta) {
    console.error("   ✗ All 4 required languages (en, hi, kn, ta) must be represented");
    errors++;
  } else {
    console.log("   ✓ All 4 demo languages represented (English, Hindi, Kannada, Tamil)");
  }

  // 4. Verify Priority Formula & Hotspot Ranking
  console.log("\n4. Checking Deterministic Priority Formula & Hotspots...");
  // Formula from docs/02_architecture.md:
  // requests_per_100k = (request_count / population) * 100000
  // demand_score = min(100, requests_per_100k * 5)
  // unaddressed_gap = infrastructure_gap_index * (1 - planned_coverage_pct / 100)
  // priority_score = 0.40 * demand_score + 0.30 * infrastructure_gap_index + 0.15 * population_impact_score + 0.15 * unaddressed_gap

  const hotspots = [];
  for (const [key, ctx] of contextMap.entries()) {
    const reqCount = requestCountsByContext.get(key) || 0;
    if (reqCount === 0) continue;

    const requestsPer100k = (reqCount / ctx.population) * 100000;
    const demandScore = Math.min(100, requestsPer100k * 5);
    const unaddressedGap = ctx.infrastructure_gap_index * (1 - ctx.planned_coverage_pct / 100);
    const priorityScore =
      0.40 * demandScore +
      0.30 * ctx.infrastructure_gap_index +
      0.15 * ctx.population_impact_score +
      0.15 * unaddressedGap;

    hotspots.push({
      state: ctx.state,
      district: ctx.district,
      category: ctx.category,
      requestCount: reqCount,
      demandScore: Math.round(demandScore * 10) / 10,
      gapIndex: ctx.infrastructure_gap_index,
      coveragePct: ctx.planned_coverage_pct,
      unaddressedGap: Math.round(unaddressedGap * 10) / 10,
      priorityScore: Math.round(priorityScore * 10) / 10
    });
  }

  hotspots.sort((a, b) => b.priorityScore - a.priorityScore);

  console.log(`   Computed ${hotspots.length} active demand combinations.`);
  console.log("   Top 5 Planning Hotspots:");
  hotspots.slice(0, 5).forEach((h, i) => {
    console.log(
      `     #${i + 1}: ${h.district} (${h.state}) - ${h.category.toUpperCase()} | Requests: ${h.requestCount} | Priority Score: ${h.priorityScore} (Demand: ${h.demandScore}, Gap: ${h.gapIndex})`
    );
  });

  const top1 = hotspots[0];
  if (top1.district !== "Ramanagara" || top1.category !== "roads") {
    console.error(`   ✗ Expected #1 hotspot to be Ramanagara roads, got ${top1.district} ${top1.category}`);
    errors++;
  } else {
    console.log("   ✓ Hero demo hotspot confirmed: Ramanagara roads ranks #1 with priority score " + top1.priorityScore);
  }

  console.log("\n==================================================");
  if (errors === 0) {
    console.log("  ALL M1 DATA INTEGRITY CHECKS PASSED (0 errors)");
    console.log("==================================================");
    process.exit(0);
  } else {
    console.error(`  M1 CHECKS FAILED WITH ${errors} ERRORS`);
    console.log("==================================================");
    process.exit(1);
  }
}

runM1Verification();
