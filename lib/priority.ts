/**
 * Deterministic Priority Scoring and Category-to-Project Mapping for JanSanket
 * Implements TASK-033 per docs/02_architecture.md.
 *
 * Core rule:
 * Gemini converts unstructured input into structured fields.
 * Deterministic application logic computes the planning signal and priority score.
 * AI NEVER calculates the priority score.
 */

import { InfrastructureCategory } from "./validation";
import { CitizenRequest, DistrictContext } from "./demo-data";

/**
 * Deterministic category-to-project recommendation mapping.
 * Specified in docs/02_architecture.md: lines 151-163.
 */
export const CATEGORY_PROJECT_MAPPING: Record<InfrastructureCategory, string> = {
  roads: "Rural road rehabilitation",
  water: "Drinking-water network expansion",
  sanitation: "Community sanitation infrastructure",
  healthcare: "Primary healthcare access upgrade",
  education: "School infrastructure upgrade",
  power: "Rural power distribution upgrade",
  transport: "Local public-transport access upgrade",
  other: "Further planning review required"
};

/**
 * Returns the deterministic recommended project for a given infrastructure category.
 */
export function getRecommendedProject(category: InfrastructureCategory): string {
  return CATEGORY_PROJECT_MAPPING[category] || "Further planning review required";
}

export interface PriorityInputs {
  requestCount: number;
  population: number;
  infrastructureGapIndex: number;
  plannedCoveragePct: number;
  populationImpactScore: number;
}

export interface PriorityScoreBreakdown {
  requestsPer100k: number;
  demandScore: number;
  unaddressedGap: number;
  priorityScore: number;
}

/**
 * Computes deterministic priority score for a single state/district/category combination.
 * Formula from docs/02_architecture.md:
 *
 * requests_per_100k = (request_count / population) * 100000
 * demand_score = min(100, requests_per_100k * 5)
 * unaddressed_gap = infrastructure_gap_index * (1 - planned_coverage_pct / 100)
 * priority_score =
 *     0.40 * demand_score
 *   + 0.30 * infrastructure_gap_index
 *   + 0.15 * population_impact_score
 *   + 0.15 * unaddressed_gap
 */
export function calculatePriorityScore(inputs: PriorityInputs): PriorityScoreBreakdown {
  const {
    requestCount,
    population,
    infrastructureGapIndex,
    plannedCoveragePct,
    populationImpactScore
  } = inputs;

  const safePopulation = Math.max(1, population);
  const requestsPer100k = (requestCount / safePopulation) * 100000;
  const demandScore = Math.min(100, requestsPer100k * 5);
  const unaddressedGap = infrastructureGapIndex * (1 - plannedCoveragePct / 100);

  const rawPriorityScore =
    0.40 * demandScore +
    0.30 * infrastructureGapIndex +
    0.15 * populationImpactScore +
    0.15 * unaddressedGap;

  return {
    requestsPer100k: Math.round(requestsPer100k * 10) / 10,
    demandScore: Math.round(demandScore * 10) / 10,
    unaddressedGap: Math.round(unaddressedGap * 10) / 10,
    priorityScore: Math.round(rawPriorityScore * 10) / 10
  };
}

export interface PlanningHotspot {
  state: string;
  district: string;
  category: InfrastructureCategory;
  request_count: number;
  demand_score: number;
  infrastructure_gap_index: number;
  population_impact_score: number;
  planned_coverage_pct: number;
  unaddressed_gap: number;
  priority_score: number;
  recommended_project: string;
  source_status: "demo_synthetic";
}

export interface AggregationSummary {
  total_requests: number;
  districts: number;
  hotspots: number;
}

export interface PlanningSignalResult {
  summary: AggregationSummary;
  hotspots: PlanningHotspot[];
}

/**
 * Aggregates citizen requests against district context to produce deterministic planning hotspots.
 * Pure deterministic calculation: identical input state strictly produces identical output.
 */
export function computePlanningSignals(
  requests: CitizenRequest[],
  contexts: DistrictContext[]
): PlanningSignalResult {
  // 1. Build context lookup map keyed by `state:district:category`
  const contextMap = new Map<string, DistrictContext>();
  for (const ctx of contexts) {
    const key = `${ctx.state}:${ctx.district}:${ctx.category}`.toLowerCase();
    contextMap.set(key, ctx);
  }

  // 2. Count requests per (state, district, category)
  const countMap = new Map<string, number>();
  const activePilotDistricts = new Set<string>();

  // Monitored pilot districts keys
  const pilotDistrictKeys = new Set<string>();
  for (const ctx of contexts) {
    pilotDistrictKeys.add(`${ctx.state}:${ctx.district}`.toLowerCase());
  }

  for (const req of requests) {
    const key = `${req.state}:${req.district}:${req.category}`.toLowerCase();
    countMap.set(key, (countMap.get(key) || 0) + 1);

    const distKey = `${req.state}:${req.district}`.toLowerCase();
    if (pilotDistrictKeys.has(distKey)) {
      activePilotDistricts.add(distKey);
    }
  }


  // 3. Compute priority scores for each context
  const hotspots: PlanningHotspot[] = [];

  for (const [key, ctx] of contextMap.entries()) {
    const reqCount = countMap.get(key) || 0;
    // Include all contexts that have at least 1 citizen request
    if (reqCount === 0) continue;

    const breakdown = calculatePriorityScore({
      requestCount: reqCount,
      population: ctx.population,
      infrastructureGapIndex: ctx.infrastructure_gap_index,
      plannedCoveragePct: ctx.planned_coverage_pct,
      populationImpactScore: ctx.population_impact_score
    });

    hotspots.push({
      state: ctx.state,
      district: ctx.district,
      category: ctx.category as InfrastructureCategory,
      request_count: reqCount,
      demand_score: breakdown.demandScore,
      infrastructure_gap_index: ctx.infrastructure_gap_index,
      population_impact_score: ctx.population_impact_score,
      planned_coverage_pct: ctx.planned_coverage_pct,
      unaddressed_gap: breakdown.unaddressedGap,
      priority_score: breakdown.priorityScore,
      recommended_project: getRecommendedProject(ctx.category as InfrastructureCategory),
      source_status: "demo_synthetic"
    });
  }

  // 4. Deterministic sort: descending by priority_score, then descending by request_count, then alphabetical
  hotspots.sort((a, b) => {
    if (b.priority_score !== a.priority_score) {
      return b.priority_score - a.priority_score;
    }
    if (b.request_count !== a.request_count) {
      return b.request_count - a.request_count;
    }
    return `${a.state}:${a.district}:${a.category}`.localeCompare(`${b.state}:${b.district}:${b.category}`);
  });

  return {
    summary: {
      total_requests: requests.length,
      districts: activePilotDistricts.size > 0 ? activePilotDistricts.size : pilotDistrictKeys.size,
      hotspots: hotspots.length
    },

    hotspots
  };
}
