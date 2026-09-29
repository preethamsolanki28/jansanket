/**
 * Seed & Demo Data Fixtures for JanSanket
 * Exactly reflects the Supabase schema and migrations for:
 * - 48 district_context rows (8 districts across 4 states x 6 core categories)
 * - 52 realistic natural-language citizen_requests rows
 *
 * Used for:
 * 1. DEMO_MODE=true dashboard operations when Supabase is offline/unreachable
 * 2. Type definitions for citizen_requests and district_context
 */

export type InfrastructureCategory =
  | "roads"
  | "water"
  | "sanitation"
  | "healthcare"
  | "education"
  | "power"
  | "transport"
  | "other";

export type Severity = "low" | "medium" | "high";

export type RequestSource = "text" | "voice" | "manual_fallback";

export interface CitizenRequest {
  id: string;
  source: RequestSource;
  raw_text: string;
  language_code: string;
  state: string;
  district: string;
  category: InfrastructureCategory;
  need_summary: string;
  severity: Severity;
  ai_confidence: number;
  created_at: string;
}

export interface DistrictContext {
  id: string;
  state: string;
  district: string;
  category: InfrastructureCategory;
  population: number;
  infrastructure_gap_index: number;
  planned_coverage_pct: number;
  population_impact_score: number;
  source_status: "demo_synthetic";
  source_url: string;
  updated_at: string;
}

export const SEED_DISTRICT_CONTEXT: DistrictContext[] = [
  // 1. Karnataka - Ramanagara (Hero demo district: Ramanagara roads)
  {
    id: "dc-kn-ram-01",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    population: 55000,
    infrastructure_gap_index: 78.0,
    planned_coverage_pct: 22.0,
    population_impact_score: 72.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-ram-02",
    state: "Karnataka",
    district: "Ramanagara",
    category: "water",
    population: 55000,
    infrastructure_gap_index: 42.0,
    planned_coverage_pct: 68.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-ram-03",
    state: "Karnataka",
    district: "Ramanagara",
    category: "sanitation",
    population: 55000,
    infrastructure_gap_index: 38.0,
    planned_coverage_pct: 72.0,
    population_impact_score: 45.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-ram-04",
    state: "Karnataka",
    district: "Ramanagara",
    category: "healthcare",
    population: 55000,
    infrastructure_gap_index: 46.0,
    planned_coverage_pct: 60.0,
    population_impact_score: 55.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-ram-05",
    state: "Karnataka",
    district: "Ramanagara",
    category: "education",
    population: 55000,
    infrastructure_gap_index: 32.0,
    planned_coverage_pct: 78.0,
    population_impact_score: 40.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-ram-06",
    state: "Karnataka",
    district: "Ramanagara",
    category: "power",
    population: 55000,
    infrastructure_gap_index: 28.0,
    planned_coverage_pct: 85.0,
    population_impact_score: 38.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },

  // 2. Karnataka - Tumakuru
  {
    id: "dc-kn-tum-01",
    state: "Karnataka",
    district: "Tumakuru",
    category: "roads",
    population: 70000,
    infrastructure_gap_index: 40.0,
    planned_coverage_pct: 65.0,
    population_impact_score: 48.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-tum-02",
    state: "Karnataka",
    district: "Tumakuru",
    category: "water",
    population: 70000,
    infrastructure_gap_index: 44.0,
    planned_coverage_pct: 62.0,
    population_impact_score: 52.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-tum-03",
    state: "Karnataka",
    district: "Tumakuru",
    category: "sanitation",
    population: 70000,
    infrastructure_gap_index: 34.0,
    planned_coverage_pct: 70.0,
    population_impact_score: 46.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-tum-04",
    state: "Karnataka",
    district: "Tumakuru",
    category: "healthcare",
    population: 70000,
    infrastructure_gap_index: 48.0,
    planned_coverage_pct: 58.0,
    population_impact_score: 52.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-tum-05",
    state: "Karnataka",
    district: "Tumakuru",
    category: "education",
    population: 70000,
    infrastructure_gap_index: 66.0,
    planned_coverage_pct: 38.0,
    population_impact_score: 70.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-kn-tum-06",
    state: "Karnataka",
    district: "Tumakuru",
    category: "power",
    population: 70000,
    infrastructure_gap_index: 34.0,
    planned_coverage_pct: 75.0,
    population_impact_score: 42.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },

  // 3. Uttar Pradesh - Bahraich (Hotspot: Bahraich water)
  {
    id: "dc-up-bah-01",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "roads",
    population: 75000,
    infrastructure_gap_index: 50.0,
    planned_coverage_pct: 50.0,
    population_impact_score: 52.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-bah-02",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    population: 75000,
    infrastructure_gap_index: 84.0,
    planned_coverage_pct: 18.0,
    population_impact_score: 82.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-bah-03",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "sanitation",
    population: 75000,
    infrastructure_gap_index: 56.0,
    planned_coverage_pct: 48.0,
    population_impact_score: 55.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-bah-04",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "healthcare",
    population: 75000,
    infrastructure_gap_index: 60.0,
    planned_coverage_pct: 42.0,
    population_impact_score: 58.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-bah-05",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "education",
    population: 75000,
    infrastructure_gap_index: 52.0,
    planned_coverage_pct: 52.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://jk.data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-bah-06",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "power",
    population: 75000,
    infrastructure_gap_index: 42.0,
    planned_coverage_pct: 60.0,
    population_impact_score: 45.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },

  // 4. Uttar Pradesh - Varanasi (Hotspot: Varanasi sanitation)
  {
    id: "dc-up-var-01",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "roads",
    population: 80000,
    infrastructure_gap_index: 45.0,
    planned_coverage_pct: 70.0,
    population_impact_score: 52.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-var-02",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "water",
    population: 80000,
    infrastructure_gap_index: 42.0,
    planned_coverage_pct: 68.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-var-03",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "sanitation",
    population: 80000,
    infrastructure_gap_index: 74.0,
    planned_coverage_pct: 32.0,
    population_impact_score: 75.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-var-04",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "healthcare",
    population: 80000,
    infrastructure_gap_index: 42.0,
    planned_coverage_pct: 75.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-var-05",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "education",
    population: 80000,
    infrastructure_gap_index: 38.0,
    planned_coverage_pct: 72.0,
    population_impact_score: 46.0,
    source_status: "demo_synthetic",
    source_url: "https://jk.data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-up-var-06",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "power",
    population: 80000,
    infrastructure_gap_index: 36.0,
    planned_coverage_pct: 80.0,
    population_impact_score: 44.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },

  // 5. Rajasthan - Barmer (Hotspot: Barmer power)
  {
    id: "dc-rj-bar-01",
    state: "Rajasthan",
    district: "Barmer",
    category: "roads",
    population: 65000,
    infrastructure_gap_index: 48.0,
    planned_coverage_pct: 56.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-bar-02",
    state: "Rajasthan",
    district: "Barmer",
    category: "water",
    population: 65000,
    infrastructure_gap_index: 56.0,
    planned_coverage_pct: 45.0,
    population_impact_score: 55.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-bar-03",
    state: "Rajasthan",
    district: "Barmer",
    category: "sanitation",
    population: 65000,
    infrastructure_gap_index: 45.0,
    planned_coverage_pct: 55.0,
    population_impact_score: 48.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-bar-04",
    state: "Rajasthan",
    district: "Barmer",
    category: "healthcare",
    population: 65000,
    infrastructure_gap_index: 54.0,
    planned_coverage_pct: 48.0,
    population_impact_score: 52.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-bar-05",
    state: "Rajasthan",
    district: "Barmer",
    category: "education",
    population: 65000,
    infrastructure_gap_index: 48.0,
    planned_coverage_pct: 55.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-bar-06",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    population: 65000,
    infrastructure_gap_index: 82.0,
    planned_coverage_pct: 20.0,
    population_impact_score: 78.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },

  // 6. Rajasthan - Dausa (Hotspot: Dausa roads)
  {
    id: "dc-rj-dau-01",
    state: "Rajasthan",
    district: "Dausa",
    category: "roads",
    population: 60000,
    infrastructure_gap_index: 66.0,
    planned_coverage_pct: 38.0,
    population_impact_score: 64.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-dau-02",
    state: "Rajasthan",
    district: "Dausa",
    category: "water",
    population: 60000,
    infrastructure_gap_index: 48.0,
    planned_coverage_pct: 55.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-dau-03",
    state: "Rajasthan",
    district: "Dausa",
    category: "sanitation",
    population: 60000,
    infrastructure_gap_index: 38.0,
    planned_coverage_pct: 68.0,
    population_impact_score: 42.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-dau-04",
    state: "Rajasthan",
    district: "Dausa",
    category: "healthcare",
    population: 60000,
    infrastructure_gap_index: 44.0,
    planned_coverage_pct: 60.0,
    population_impact_score: 48.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-dau-05",
    state: "Rajasthan",
    district: "Dausa",
    category: "education",
    population: 60000,
    infrastructure_gap_index: 42.0,
    planned_coverage_pct: 62.0,
    population_impact_score: 46.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-rj-dau-06",
    state: "Rajasthan",
    district: "Dausa",
    category: "power",
    population: 60000,
    infrastructure_gap_index: 44.0,
    planned_coverage_pct: 65.0,
    population_impact_score: 48.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },

  // 7. Tamil Nadu - Dharmapuri (Hotspot: Dharmapuri healthcare)
  {
    id: "dc-tn-dha-01",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "roads",
    population: 60000,
    infrastructure_gap_index: 46.0,
    planned_coverage_pct: 62.0,
    population_impact_score: 48.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-dha-02",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "water",
    population: 60000,
    infrastructure_gap_index: 52.0,
    planned_coverage_pct: 55.0,
    population_impact_score: 52.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-dha-03",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "sanitation",
    population: 60000,
    infrastructure_gap_index: 42.0,
    planned_coverage_pct: 65.0,
    population_impact_score: 45.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-dha-04",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare",
    population: 60000,
    infrastructure_gap_index: 76.0,
    planned_coverage_pct: 26.0,
    population_impact_score: 74.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-dha-05",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "education",
    population: 60000,
    infrastructure_gap_index: 36.0,
    planned_coverage_pct: 74.0,
    population_impact_score: 42.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-dha-06",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "power",
    population: 60000,
    infrastructure_gap_index: 30.0,
    planned_coverage_pct: 82.0,
    population_impact_score: 38.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },

  // 8. Tamil Nadu - Madurai
  {
    id: "dc-tn-mad-01",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "roads",
    population: 75000,
    infrastructure_gap_index: 45.0,
    planned_coverage_pct: 68.0,
    population_impact_score: 55.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-mad-02",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "water",
    population: 75000,
    infrastructure_gap_index: 55.0,
    planned_coverage_pct: 55.0,
    population_impact_score: 62.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-mad-03",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "sanitation",
    population: 75000,
    infrastructure_gap_index: 50.0,
    planned_coverage_pct: 62.0,
    population_impact_score: 58.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-mad-04",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "healthcare",
    population: 75000,
    infrastructure_gap_index: 42.0,
    planned_coverage_pct: 72.0,
    population_impact_score: 54.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/catalog/rural-health-statistics-2017",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-mad-05",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "education",
    population: 75000,
    infrastructure_gap_index: 38.0,
    planned_coverage_pct: 76.0,
    population_impact_score: 50.0,
    source_status: "demo_synthetic",
    source_url: "https://data.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  },
  {
    id: "dc-tn-mad-06",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "power",
    population: 75000,
    infrastructure_gap_index: 36.0,
    planned_coverage_pct: 78.0,
    population_impact_score: 46.0,
    source_status: "demo_synthetic",
    source_url: "https://indiainvestmentgrid.gov.in/",
    updated_at: "2026-09-29T00:00:00Z"
  }
];

export const SEED_CITIZEN_REQUESTS: CitizenRequest[] = [
  // Ramanagara - roads (10 requests - Primary Demo Hotspot)
  {
    id: "cr-ram-rd-01",
    source: "text",
    raw_text: "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon and ambulances cannot enter.",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Rehabilitation and all-weather surfacing of village link road for emergency vehicle access.",
    severity: "high",
    ai_confidence: 0.96,
    created_at: "2026-09-27T08:30:00Z"
  },
  {
    id: "cr-ram-rd-02",
    source: "voice",
    raw_text: "ಮಳೆಗಾಲದಲ್ಲಿ ರಾಮನಗರ ಜಿಲ್ಲೆಯ ನಮ್ಮ ಹಳ್ಳಿಯ ಮುಖ್ಯ ರಸ್ತೆ ಸಂಪೂರ್ಣವಾಗಿ ಕೊಚ್ಚಿಹೋಗಿ ವಾಹನ ಸಂಚಾರ ಅಸಾಧ್ಯವಾಗಿದೆ.",
    language_code: "kn",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Reconstruction of flood-damaged village access road.",
    severity: "high",
    ai_confidence: 0.94,
    created_at: "2026-09-26T11:15:00Z"
  },
  {
    id: "cr-ram-rd-03",
    source: "text",
    raw_text: "ರಾಮನಗರ ತಾಲೂಕಿನ ಗ್ರಾಮೀಣ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಹಳ್ಳಗಳು ಬಿದ್ದಿದ್ದು ಶಾಲಾ ಬಸ್ ಬರಲು ನಿರಾಕರಿಸುತ್ತಿದ್ದಾರೆ.",
    language_code: "kn",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Repair of hazardous potholes on rural bus route.",
    severity: "high",
    ai_confidence: 0.92,
    created_at: "2026-09-25T14:40:00Z"
  },
  {
    id: "cr-ram-rd-04",
    source: "text",
    raw_text: "The culvert on the Ramanagara rural link road collapsed during heavy rains, cutting off 3 villages.",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Urgent reconstruction of collapsed culvert connecting three villages.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-24T09:20:00Z"
  },
  {
    id: "cr-ram-rd-05",
    source: "voice",
    raw_text: "In Ramanagara taluk, farmers are unable to transport silk cocoons to market due to unpaved mud road.",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Paving of agricultural transport corridor for silk producers.",
    severity: "medium",
    ai_confidence: 0.91,
    created_at: "2026-09-23T16:05:00Z"
  },
  {
    id: "cr-ram-rd-06",
    source: "text",
    raw_text: "ನಮ್ಮ ಊರಿನ ರಸ್ತೆಗೆ ಕಲ್ಲಿನ ಜಲ್ಲಿ ಮಾತ್ರ ಹಾಕಿದ್ದಾರೆ, ಡಾಂಬರೀಕರಣ ಮಾಡದೆ ಬಿಟ್ಟಿದ್ದಾರೆ.",
    language_code: "kn",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Completion of asphalt surfacing on gravel road.",
    severity: "medium",
    ai_confidence: 0.89,
    created_at: "2026-09-22T10:10:00Z"
  },
  {
    id: "cr-ram-rd-07",
    source: "text",
    raw_text: "Heavy soil erosion has narrowed the approach road to Ramanagara village bypass to single lane.",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Widening and embankment strengthening of village bypass road.",
    severity: "medium",
    ai_confidence: 0.93,
    created_at: "2026-09-21T13:45:00Z"
  },
  {
    id: "cr-ram-rd-08",
    source: "text",
    raw_text: "ರಾಮನಗರ ರಸ್ತೆಯಲ್ಲಿ ಮಳೆಗಾಲದಲ್ಲಿ ನೀರು ನಿಂತು ದ್ವಿಚಕ್ರ ವಾಹನಗಳು ಅಪಘಾತಕ್ಕೀಡಾಗುತ್ತಿವೆ.",
    language_code: "kn",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Stormwater drainage and road resurfacing to prevent accidents.",
    severity: "high",
    ai_confidence: 0.90,
    created_at: "2026-09-19T07:50:00Z"
  },
  {
    id: "cr-ram-rd-09",
    source: "text",
    raw_text: "Missing bridge over storm stream isolates our village during monsoon in Ramanagara.",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Construction of small bridge across seasonal stream.",
    severity: "high",
    ai_confidence: 0.97,
    created_at: "2026-09-17T15:30:00Z"
  },
  {
    id: "cr-ram-rd-10",
    source: "text",
    raw_text: "School children walk 4 km along broken road because transport stopped coming to Ramanagara hamlet.",
    language_code: "en",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads",
    need_summary: "Road rehabilitation to restore public transportation for school students.",
    severity: "high",
    ai_confidence: 0.94,
    created_at: "2026-09-15T08:15:00Z"
  },

  // Bahraich - water (8 requests - Hotspot #2)
  {
    id: "cr-bah-wt-01",
    source: "text",
    raw_text: "बहराइच जिले के हमारे गांव में हैंडपंप से गंदा और पीला पानी आ रहा है, जिससे लोग बीमार पड़ रहे हैं।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Replacement of contaminated shallow handpumps with safe drinking water network.",
    severity: "high",
    ai_confidence: 0.96,
    created_at: "2026-09-28T09:00:00Z"
  },
  {
    id: "cr-bah-wt-02",
    source: "text",
    raw_text: "In Bahraich rural blocks, groundwater arsenic levels are high and there is no piped tap water supply.",
    language_code: "en",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Provision of piped drinking water supply with arsenic filtration in rural blocks.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-27T12:20:00Z"
  },
  {
    id: "cr-bah-wt-03",
    source: "voice",
    raw_text: "गांव में तीन में से दो नल सूख चुके हैं, महिलाओं को 2 किलोमीटर दूर से पानी लाना पड़ता है।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Drilling of deep borewells and piped distribution to reduce walking distance.",
    severity: "high",
    ai_confidence: 0.93,
    created_at: "2026-09-25T07:15:00Z"
  },
  {
    id: "cr-bah-wt-04",
    source: "text",
    raw_text: "Water tank installed two years ago in Bahraich village has no pump connection or distribution pipeline.",
    language_code: "en",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Operationalization and pipeline connection for existing overhead water tank.",
    severity: "medium",
    ai_confidence: 0.92,
    created_at: "2026-09-23T15:40:00Z"
  },
  {
    id: "cr-bah-wt-05",
    source: "text",
    raw_text: "बहराइच के प्राथमिक विद्यालय में पीने के पानी की कोई सुविधा नहीं है।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Installation of clean drinking water supply in government primary school.",
    severity: "high",
    ai_confidence: 0.94,
    created_at: "2026-09-22T11:05:00Z"
  },
  {
    id: "cr-bah-wt-06",
    source: "text",
    raw_text: "Severe water shortages during summer months require regular water tanker supply in Bahraich hamlets.",
    language_code: "en",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Long-term piped water infrastructure to resolve recurrent summer water crises.",
    severity: "high",
    ai_confidence: 0.91,
    created_at: "2026-09-20T17:30:00Z"
  },
  {
    id: "cr-bah-wt-07",
    source: "text",
    raw_text: "हमारे मोहल्ले की पाइपलाइन टूट गई है और 15 दिनों से पीने का पानी नहीं आ रहा।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Urgent repair of damaged distribution pipeline.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-18T14:10:00Z"
  },
  {
    id: "cr-bah-wt-08",
    source: "text",
    raw_text: "Community well in Bahraich village is open and unhygienic, need covered water filtration unit.",
    language_code: "en",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water",
    need_summary: "Installation of covered community filtration unit over open well.",
    severity: "medium",
    ai_confidence: 0.88,
    created_at: "2026-09-14T09:45:00Z"
  },

  // Barmer - power (7 requests - Hotspot #3)
  {
    id: "cr-bar-pw-01",
    source: "text",
    raw_text: "बाड़मेर जिले में हमारे गांव में दिन में 10-12 घंटे बिजली कटौती रहती है, भीषण गर्मी में जीना मुश्किल है।",
    language_code: "hi",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    need_summary: "Upgradation of rural feeder line to eliminate prolonged daily power outages.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-28T13:20:00Z"
  },
  {
    id: "cr-bar-pw-02",
    source: "text",
    raw_text: "In Barmer desert area, local transformer blew up 10 days ago and has not been replaced yet.",
    language_code: "en",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    need_summary: "Urgent replacement of blown 63 kVA community power transformer.",
    severity: "high",
    ai_confidence: 0.97,
    created_at: "2026-09-26T10:45:00Z"
  },
  {
    id: "cr-bar-pw-03",
    source: "voice",
    raw_text: "बार-बार वोल्टेज कम होने से ट्यूबवेल नहीं चल पा रहे हैं और फसलें सूख रही हैं।",
    language_code: "hi",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    need_summary: "Voltage stabilization and 3-phase agricultural power line enhancement.",
    severity: "high",
    ai_confidence: 0.93,
    created_at: "2026-09-24T06:50:00Z"
  },
  {
    id: "cr-bar-pw-04",
    source: "text",
    raw_text: "Loose high-tension electric wires hanging dangerously close to village roofs in Barmer.",
    language_code: "en",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    need_summary: "Restringing and elevation of hazardous sagging power cables.",
    severity: "high",
    ai_confidence: 0.96,
    created_at: "2026-09-22T16:15:00Z"
  },
  {
    id: "cr-bar-pw-05",
    source: "text",
    raw_text: "बाड़मेर के उप स्वास्थ्य केंद्र में बिजली न होने से दवाइयां और टीके खराब हो रहे हैं।",
    language_code: "hi",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    need_summary: "Dedicated continuous power supply and solar backup for rural health sub-center.",
    severity: "high",
    ai_confidence: 0.94,
    created_at: "2026-09-20T12:00:00Z"
  },
  {
    id: "cr-bar-pw-06",
    source: "text",
    raw_text: "Frequent unplanned blackouts disrupt nighttime study for high school board examinees.",
    language_code: "en",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    need_summary: "Stabilization of residential grid power during evening hours.",
    severity: "medium",
    ai_confidence: 0.90,
    created_at: "2026-09-17T20:30:00Z"
  },
  {
    id: "cr-bar-pw-07",
    source: "text",
    raw_text: "New residential settlement in Barmer outskirts is still waiting for electrification poles.",
    language_code: "en",
    state: "Rajasthan",
    district: "Barmer",
    category: "power",
    need_summary: "Extension of power distribution poles to un-electrified hamlet.",
    severity: "medium",
    ai_confidence: 0.92,
    created_at: "2026-09-13T11:10:00Z"
  },

  // Dharmapuri - healthcare (6 requests - Hotspot #4)
  {
    id: "cr-dha-hc-01",
    source: "text",
    raw_text: "தருமபுரி மாவட்டத்தில் எங்கள் கிராமத்திலிருந்து ஆரம்ப சுகாதார நிலையம் 18 கிமீ தொலைவில் உள்ளது, அவசர காலங்களில் செல்ல முடியாது.",
    language_code: "ta",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare",
    need_summary: "Establishment of local primary healthcare sub-center to reduce 18 km travel distance.",
    severity: "high",
    ai_confidence: 0.96,
    created_at: "2026-09-27T10:00:00Z"
  },
  {
    id: "cr-dha-hc-02",
    source: "text",
    raw_text: "Primary Health Centre in Dharmapuri rural block has no doctor after 2 PM and lacks maternity facilities.",
    language_code: "en",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare",
    need_summary: "Provision of 24/7 medical staffing and emergency maternity facilities at PHC.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-26T14:30:00Z"
  },
  {
    id: "cr-dha-hc-03",
    source: "voice",
    raw_text: "கிராமத்தில் ஆம்புலன்ஸ் சேவை வர 2 மணி நேரம் ஆகிறது, அவசர சிகிச்சை கிடைக்கவில்லை.",
    language_code: "ta",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare",
    need_summary: "Stationing of dedicated emergency response ambulance in tribal taluk.",
    severity: "high",
    ai_confidence: 0.94,
    created_at: "2026-09-24T08:15:00Z"
  },
  {
    id: "cr-dha-hc-04",
    source: "text",
    raw_text: "Dharmapuri community health centre lacks basic diagnostic equipment like X-ray and lab test kits.",
    language_code: "en",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare",
    need_summary: "Upgrading diagnostic laboratory and imaging equipment at community health centre.",
    severity: "medium",
    ai_confidence: 0.91,
    created_at: "2026-09-21T15:20:00Z"
  },
  {
    id: "cr-dha-hc-05",
    source: "text",
    raw_text: "தருமபுரி அரசு மருத்துவமனையில் பாம்புக்கடி மருந்து இருப்பு இல்லை.",
    language_code: "ta",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare",
    need_summary: "Emergency stocking of antivenom and critical life-saving drugs.",
    severity: "high",
    ai_confidence: 0.97,
    created_at: "2026-09-19T11:45:00Z"
  },
  {
    id: "cr-dha-hc-06",
    source: "text",
    raw_text: "Mobile medical unit has not visited our remote hill village in Dharmapuri for six months.",
    language_code: "en",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare",
    need_summary: "Resumption of regular fortnightly mobile health clinic visits.",
    severity: "medium",
    ai_confidence: 0.89,
    created_at: "2026-09-16T13:00:00Z"
  },

  // Varanasi - sanitation (5 requests - Hotspot #5)
  {
    id: "cr-var-sn-01",
    source: "text",
    raw_text: "वाराणसी के इस वार्ड में खुली नालियों का गंदा पानी सड़कों पर बह रहा है, बीमारी फैलने का खतरा है।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "sanitation",
    need_summary: "Construction of covered concrete drainage network to stop sewage street overflow.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-27T16:10:00Z"
  },
  {
    id: "cr-var-sn-02",
    source: "text",
    raw_text: "Community toilet block in peri-urban Varanasi has had no water connection or cleaning for two months.",
    language_code: "en",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "sanitation",
    need_summary: "Restoration of water supply and regular municipal maintenance of community toilets.",
    severity: "high",
    ai_confidence: 0.93,
    created_at: "2026-09-25T11:30:00Z"
  },
  {
    id: "cr-var-sn-03",
    source: "voice",
    raw_text: "कूड़ा उठाने वाली गाड़ी हमारे मोहल्ले में नहीं आती, सड़क किनारे कचरे का बड़ा ढेर लगा है।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "sanitation",
    need_summary: "Extension of door-to-door solid waste collection to unserved ward.",
    severity: "medium",
    ai_confidence: 0.90,
    created_at: "2026-09-23T09:40:00Z"
  },
  {
    id: "cr-var-sn-04",
    source: "text",
    raw_text: "Broken sewer manhole covers in Varanasi residential lane pose severe safety hazard to pedestrians.",
    language_code: "en",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "sanitation",
    need_summary: "Replacement of missing and damaged concrete sewer manhole covers.",
    severity: "high",
    ai_confidence: 0.94,
    created_at: "2026-09-20T14:15:00Z"
  },
  {
    id: "cr-var-sn-05",
    source: "text",
    raw_text: "जलभराव और सीवर ओवरफ्लो के कारण बाजार क्षेत्र में दुकानदारों को भारी परेशानी हो रही है।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "sanitation",
    need_summary: "Desilting of main trunk sewer line to eliminate commercial zone overflow.",
    severity: "medium",
    ai_confidence: 0.91,
    created_at: "2026-09-17T17:00:00Z"
  },

  // Tumakuru - education (4 requests)
  {
    id: "cr-tum-ed-01",
    source: "text",
    raw_text: "ತುಮಕೂರು ಜಿಲ್ಲೆಯ ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಾಲೆಯಲ್ಲಿ ಹೆಣ್ಣುಮಕ್ಕಳಿಗೆ ಶೌಚಾಲಯ ಮತ್ತು ನೀರಿನ ಸೌಲಭ್ಯವಿಲ್ಲ.",
    language_code: "kn",
    state: "Karnataka",
    district: "Tumakuru",
    category: "education",
    need_summary: "Construction of dedicated functional girls toilets and water supply in primary school.",
    severity: "high",
    ai_confidence: 0.96,
    created_at: "2026-09-26T12:00:00Z"
  },
  {
    id: "cr-tum-ed-02",
    source: "text",
    raw_text: "Government high school building in Tumakuru has leaking roofs and cracked walls in 4 classrooms.",
    language_code: "en",
    state: "Karnataka",
    district: "Tumakuru",
    category: "education",
    need_summary: "Structural renovation and waterproofing of school classroom building.",
    severity: "high",
    ai_confidence: 0.93,
    created_at: "2026-09-24T10:30:00Z"
  },
  {
    id: "cr-tum-ed-03",
    source: "text",
    raw_text: "ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್ ಸೌಲಭ್ಯವಿಲ್ಲದೆ ಗ್ರಾಮೀಣ ಮಕ್ಕಳು ಡಿಜಿಟಲ್ ಶಿಕ್ಷಣದಿಂದ ವಂಚಿತರಾಗಿದ್ದಾರೆ.",
    language_code: "kn",
    state: "Karnataka",
    district: "Tumakuru",
    category: "education",
    need_summary: "Setup of basic digital computer laboratory in rural secondary school.",
    severity: "medium",
    ai_confidence: 0.88,
    created_at: "2026-09-21T16:45:00Z"
  },
  {
    id: "cr-tum-ed-04",
    source: "text",
    raw_text: "No boundary wall in Tumakuru village school allows stray cattle to enter playground during classes.",
    language_code: "en",
    state: "Karnataka",
    district: "Tumakuru",
    category: "education",
    need_summary: "Construction of perimeter security wall for government school campus.",
    severity: "medium",
    ai_confidence: 0.91,
    created_at: "2026-09-15T11:20:00Z"
  },

  // Dausa - roads (4 requests)
  {
    id: "cr-dau-rd-01",
    source: "text",
    raw_text: "दौसा जिले में नेशनल हाईवे से जोड़ने वाली 5 किमी सड़क पूरी तरह गड्ढों में तब्दील हो चुकी है।",
    language_code: "hi",
    state: "Rajasthan",
    district: "Dausa",
    category: "roads",
    need_summary: "Complete resurfacing and blacktopping of 5 km link road to national highway.",
    severity: "high",
    ai_confidence: 0.94,
    created_at: "2026-09-26T09:10:00Z"
  },
  {
    id: "cr-dau-rd-02",
    source: "text",
    raw_text: "Agricultural tractors cannot transport wheat produce due to muddy unpaved road in Dausa block.",
    language_code: "en",
    state: "Rajasthan",
    district: "Dausa",
    category: "roads",
    need_summary: "Gravel and tarmac paving of agricultural market access road.",
    severity: "medium",
    ai_confidence: 0.90,
    created_at: "2026-09-23T14:00:00Z"
  },
  {
    id: "cr-dau-rd-03",
    source: "text",
    raw_text: "सड़क पर स्ट्रीट लाइट न होने के कारण रात में दुर्घटनाओं की आशंका बनी रहती है।",
    language_code: "hi",
    state: "Rajasthan",
    district: "Dausa",
    category: "roads",
    need_summary: "Installation of solar streetlighting along hazardous village curve.",
    severity: "medium",
    ai_confidence: 0.89,
    created_at: "2026-09-19T19:30:00Z"
  },
  {
    id: "cr-dau-rd-04",
    source: "text",
    raw_text: "Causeway washed out during last flash flood cutting off school van access in Dausa hamlet.",
    language_code: "en",
    state: "Rajasthan",
    district: "Dausa",
    category: "roads",
    need_summary: "Rebuilding of concrete causeway with adequate stormwater pipe openings.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-16T08:40:00Z"
  },

  // Madurai - roads & water (4 requests)
  {
    id: "cr-mad-rd-01",
    source: "text",
    raw_text: "மதுரை புறநகர் கிராமத்திற்கு அரசு பேருந்து செல்லும் இணைப்பு சாலை மிகவும் குறுகலாகவும் பழுதடைந்தும் உள்ளது.",
    language_code: "ta",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "roads",
    need_summary: "Widening and repaving of rural approach road for bus transit.",
    severity: "medium",
    ai_confidence: 0.92,
    created_at: "2026-09-25T08:00:00Z"
  },
  {
    id: "cr-mad-wt-02",
    source: "text",
    raw_text: "Main drinking water pipeline in Madurai residential area burst, thousands without water.",
    language_code: "en",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "water",
    need_summary: "Emergency repair and replacement of corroded distribution trunk line.",
    severity: "high",
    ai_confidence: 0.95,
    created_at: "2026-09-24T13:15:00Z"
  },
  {
    id: "cr-mad-rd-03",
    source: "text",
    raw_text: "மதுரை கிராமப்புற சாலையில் பஸ் நிழற்குடை இல்லாததால் வெயில் மற்றும் மழையில் நிற்க வேண்டியுள்ளது.",
    language_code: "ta",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "roads",
    need_summary: "Construction of roadside passenger waiting shelter.",
    severity: "low",
    ai_confidence: 0.87,
    created_at: "2026-09-20T10:45:00Z"
  },
  {
    id: "cr-mad-sn-04",
    source: "text",
    raw_text: "Underground drainage connection works left open and unfinished in Madurai residential ward.",
    language_code: "en",
    state: "Tamil Nadu",
    district: "Madurai",
    category: "sanitation",
    need_summary: "Expediting completion of underground drainage street piping and repaving.",
    severity: "medium",
    ai_confidence: 0.91,
    created_at: "2026-09-14T15:00:00Z"
  },

  // Other distributed categories (4 requests)
  {
    id: "cr-tum-pw-05",
    source: "text",
    raw_text: "Solar street lights installed in Tumakuru village center have dead batteries and need replacement.",
    language_code: "en",
    state: "Karnataka",
    district: "Tumakuru",
    category: "power",
    need_summary: "Maintenance and battery replacement for non-functional solar streetlights.",
    severity: "low",
    ai_confidence: 0.88,
    created_at: "2026-09-22T18:10:00Z"
  },
  {
    id: "cr-var-hc-06",
    source: "text",
    raw_text: "वाराणसी के ग्रामीण क्षेत्र में प्राथमिक विद्यालय के पास कोई प्राथमिक स्वास्थ्य केंद्र नहीं है।",
    language_code: "hi",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "healthcare",
    need_summary: "Establishment of primary health outpost near rural school cluster.",
    severity: "medium",
    ai_confidence: 0.90,
    created_at: "2026-09-21T09:30:00Z"
  },
  {
    id: "cr-bar-wt-08",
    source: "text",
    raw_text: "Barmer desert village needs rainwater harvesting tank installation for community use.",
    language_code: "en",
    state: "Rajasthan",
    district: "Barmer",
    category: "water",
    need_summary: "Construction of traditional covered rainwater harvesting tank (tanka).",
    severity: "medium",
    ai_confidence: 0.92,
    created_at: "2026-09-18T12:00:00Z"
  },
  {
    id: "cr-dha-sn-07",
    source: "text",
    raw_text: "தருமபுரி கிராமத்தில் குப்பை சேகரிப்பு தொட்டிகள் இல்லாததால் திறந்தவெளியில் குப்பை கொட்டப்படுகிறது.",
    language_code: "ta",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "sanitation",
    need_summary: "Placement of community waste bins and regular clearance schedule.",
    severity: "low",
    ai_confidence: 0.86,
    created_at: "2026-09-13T14:20:00Z"
  }
];
