# Architecture

## Stack

| Layer | Choice | Implemented MVP Use |
|---|---|---|
| Web app | Next.js 16 (App Router) + TypeScript 5 | UI, server routes, static optimization in one codebase. |
| UI | shadcn/ui + Tailwind CSS v4 | Civic design tokens, accessible components (`Button`, `Card`, `Badge`, `Textarea`, `Select`, `Alert`, `Table`). |
| Database | Supabase Postgres | Schema for `citizen_requests` and `district_context` with PostgREST server integration. |
| Fallback Store | Active In-Memory / Seed Store | Seamless fallback for local demonstration when Supabase is offline or unconfigured (`DEMO_MODE=true`). |
| AI Normalization | OpenRouter API (`openai/gpt-4o-mini` via `lib/ai.ts`) | Server-side OpenAI-compatible REST API integration for structured JSON extraction from multilingual text. |
| Deployment | Vercel | Production Next.js serverless deployment. |
| Backend | Next.js Route Handlers | Serverless API routes (`/api/requests`, `/api/dashboard`); avoids Python/FastAPI complexity. |
| Voice | Cut during viability test | Evaluated in TASK-003 and cut due to mobile latency/permissions; text is the guaranteed path. |
| Authentication | Excluded from MVP | Fixed-stack capability, not required for hackathon MVP judging. |
| pgvector / Embeddings | Excluded from MVP | Fixed-stack capability, not required for demand aggregation. |

The MVP uses the fixed stack without adding unnecessary external libraries. The key simplification is **not using every Supabase or cloud capability** just because it exists.

---

## System Component & Data-Flow Diagram

```mermaid
flowchart TD
    Citizen[Citizen Intake /submit] --> IntakeAI[OpenRouter GPT-4o-mini<br/>Language & Field Extraction]
    IntakeAI --> Identification[State + District Identification<br/>Auto-detected or User Input]
    Identification --> GeoVal[Deterministic Geographic Validation<br/>lib/india-locations.ts]
    GeoVal -->|Valid State + District| Stored[Citizen Request Stored in Database<br/>lib/db.ts]
    GeoVal -->|State/District Mismatch| Reject[HTTP 422 Rejection<br/>Clear Mismatch Message]
    
    Stored --> IsPilot{"Is district in pilot set?<br/>(8 Pilot Districts)"}
    IsPilot -- Yes --> Priority[Deterministic Priority Engine<br/>lib/priority.ts]
    Priority --> Hotspot[High-Need Areas Hotspots Table<br/>lib/priority.ts]
    
    IsPilot -- No --> Outside[Stored as Outside Pilot Coverage<br/>No Fabricated Score]
    
    Hotspot --> DASH[/dashboard<br/>Planner Dashboard]
    Outside --> DASH_ALL[All Citizen Requests Section<br/>Complete Request Visibility]
    Stored --> DASH_ALL
    DASH_ALL --> DASH
```

---

## Folder Structure

```text
code-for-communities/
├── app/
│   ├── page.tsx                     # Redirects to /dashboard
│   ├── layout.tsx                   # Root layout with Inter font & navigation
│   ├── globals.css                  # Tailwind CSS v4 & civic design tokens
│   ├── dashboard/
│   │   └── page.tsx                 # Planner Dashboard page entry
│   ├── submit/
│   │   └── page.tsx                 # Citizen Intake page entry
│   └── api/
│       ├── requests/
│       │   └── route.ts             # POST: analyze (OpenRouter) & submit (persistence)
│       └── dashboard/
│           └── route.ts             # GET: aggregated planning signals & KPIs
├── components/
│   ├── dashboard-view.tsx           # Interactive dashboard, KPI cards & detail panel
│   ├── request-form.tsx             # Multilingual form with quick-fill presets
│   ├── navigation.tsx               # Top header with demo_synthetic badge
│   └── ui/                          # shadcn primitives (button, card, table, etc.)
├── lib/
│   ├── ai.ts                        # Provider-neutral AI client (OpenRouter GPT-4o-mini) + fallback
│   ├── india-locations.ts           # 28 States, 8 UTs, static district validation & aliases
│   ├── gemini.ts                    # Backward-compatibility alias re-exporting lib/ai.ts
│   ├── validation.ts                # Strict schema & semantic validation rules
│   ├── priority.ts                  # Deterministic priority formula & project mapping
│   ├── db.ts                        # Supabase PostgREST client & demo store fallback
│   ├── demo-data.ts                 # 48 district context rows & 52 citizen requests
│   └── utils.ts                     # Class name helper (cn)
├── scripts/
│   ├── smoke-test.ts                # End-to-end production smoke test (11/11 checks)
│   ├── test-ai-provider.ts          # Comprehensive AI provider test suite
│   ├── verify-ux-data-scope.ts      # UX + Data-scope verification script
│   ├── test-m3-pipeline.ts          # M3 verification suite
│   ├── test-m4-dashboard.ts         # M4 dashboard verification suite
│   ├── test-m2-intake.mjs           # M2 intake test suite
│   └── verify-m1-data.mjs           # M1 data integrity checks
├── supabase/
│   ├── migrations/                  # Schema, RLS policies, and seed migrations
│   │   ├── 20260929000001_create_schema.sql
│   │   ├── 20260929000002_seed_district_context.sql
│   │   ├── 20260929000003_seed_citizen_requests.sql
│   │   └── 20260929000004_fix_write_security.sql
│   └── seed.sql                     # Combined seed migration
├── public/
└── docs/
```

---

## Architecture Rules & Security

1. **AI is server-side only:** Never expose `OPENROUTER_API_KEY` to the browser.
2. **AI interprets; deterministic code calculates:** The AI model must never decide the priority score, budget, or project approval.
3. **No unnecessary PII:** Zero Aadhaar numbers, phone numbers, personal names, or exact home addresses are stored.
4. **Server-side validation mandatory:** Client-side validation is for UX; `validateCitizenRequest()` enforces schema and semantic constraints on all incoming requests.
5. **Intake Scope vs. Analytics Scope:**
   - **Citizen Intake:** India-wide (all 28 States and 8 Union Territories). State-district validation is strictly deterministic using static registry (`lib/india-locations.ts`). No LLM calls are spent on static geography.
   - **Planning Analytics:** Scoped strictly to the 8 pilot districts (`Ramanagara`, `Tumakuru`, `Bahraich`, `Varanasi`, `Barmer`, `Dausa`, `Dharmapuri`, `Madurai`) where baseline infrastructure context rows exist (`demo_synthetic`).
   - **Outside-pilot requests:** Stored faithfully as *"Outside Pilot Coverage"*; never assigned fake priority scores or fabricated metrics.
6. **Explicit data labeling:** Baseline metrics are explicitly tagged `demo_synthetic`.
7. **No live government API on critical path:** A public source failure cannot break the evaluation.
8. **Browser does not write directly to Supabase:** Next.js server routes own database persistence.
9. **DEMO_MODE resilience:** If Supabase is unconfigured or unreachable, the application uses bundled fixtures seamlessly.

---

## Data Model

### Table 1: `citizen_requests`

| Field | Type | Description |
|---|---|---|
| `id` | uuid | Primary key (UUID v4). |
| `source` | text | `text` or `manual_fallback` (voice cut). |
| `raw_text` | text | Original citizen request text. |
| `language_code` | text | ISO short code (`en`, `hi`, `kn`, `ta`). |
| `state` | text | Normalized Indian State. |
| `district` | text | Normalized Indian District. |
| `category` | text | Controlled enum: `roads`, `water`, `sanitation`, `healthcare`, `education`, `power`, `transport`, `other`. |
| `need_summary` | text | Concise one-sentence need summary in English. |
| `severity` | text | Controlled enum: `low`, `medium`, `high`. |
| `ai_confidence` | numeric | Model confidence score between 0.00 and 1.00. |
| `created_at` | timestamptz | Timestamp of record creation. |

### Table 2: `district_context`

Keyed strictly by **state + district + category** (unique composite constraint).

| Field | Type | Description |
|---|---|---|
| `id` | uuid | Primary key. |
| `state` | text | State/UT name. |
| `district` | text | District name. |
| `category` | text | Matching infrastructure category. |
| `population` | integer | Demographic population proxy. |
| `infrastructure_gap_index` | numeric | 0–100 baseline deficit index (higher = greater gap). |
| `planned_coverage_pct` | numeric | 0–100 committed planned investment coverage proxy. |
| `population_impact_score` | numeric | 0–100 vulnerability/impact proxy. |
| `source_status` | text | Explicitly `demo_synthetic`. |
| `source_url` | text | Reference public source (e.g. data.gov.in, indiainvestmentgrid.gov.in). |
| `updated_at` | timestamptz | Timestamp. |

---

## Priority Formula & Deterministic Mapping

### Mathematical Formula
For each state/district/category combination:

$$\text{requests\_per\_100k} = \left(\frac{\text{request\_count}}{\text{population}}\right) \times 100000$$

$$\text{demand\_score} = \min(100, \text{requests\_per\_100k} \times 5)$$

$$\text{unaddressed\_gap} = \text{infrastructure\_gap\_index} \times \left(1 - \frac{\text{planned\_coverage\_pct}}{100}\right)$$

$$\text{priority\_score} = 0.40 \times \text{demand\_score} + 0.30 \times \text{infrastructure\_gap\_index} + 0.15 \times \text{population\_impact\_score} + 0.15 \times \text{unaddressed\_gap}$$

### Deterministic Project Recommendations
The project recommendation is **not generated by an AI call**. It is a pure category mapping:

```text
roads      -> Rural road rehabilitation
water      -> Drinking-water network expansion
sanitation -> Community sanitation infrastructure
healthcare -> Primary healthcare access upgrade
education  -> School infrastructure upgrade
power      -> Rural power distribution upgrade
transport  -> Local public-transport access upgrade
other      -> Further planning review required
```

---

## API Endpoints

### 1. `POST /api/requests`

#### Action A: Analyze Unstructured Request
```json
{
  "action": "analyze",
  "rawText": "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
  "stateHint": "Karnataka",
  "districtHint": "Ramanagara"
}
```
**Response on Valid AI Extraction (HTTP 200):**
```json
{
  "success": true,
  "extraction": {
    "isValidRequest": true,
    "source": "text",
    "provider": "openrouter",
    "modelUsed": "openai/gpt-4o-mini",
    "language": "en",
    "originalText": "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
    "state": "Karnataka",
    "district": "Ramanagara",
    "category": "roads",
    "need_summary": "Rebuild village connecting road damaged during monsoon.",
    "severity": "high",
    "confidence": 0.95,
    "isFallback": false,
    "isSupportedDistrict": true,
    "unsupportedDistrictName": null
  }
}
```

**Response on Meaningless / Gibberish Input (HTTP 400):**
```json
{
  "success": false,
  "isInvalid": true,
  "error": "Please describe a real infrastructure or public-service problem."
}
```

**Response on Manual Fallback / HTTP 429 Quota Limit (HTTP 200):**
```json
{
  "success": true,
  "extraction": {
    "isValidRequest": true,
    "source": "manual_fallback",
    "language": "kn",
    "originalText": "ಮಳೆ ಬಂದಾಗ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ, ರಾಮನಗರ ಜಿಲ್ಲೆಯ ಶಾಲೆಗೆ ಹೋಗಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ.",
    "state": "Karnataka",
    "district": "Ramanagara",
    "category": "roads",
    "need_summary": "Citizen reported village road access, damage, or connectivity issues.",
    "severity": "medium",
    "confidence": null,
    "isFallback": true,
    "fallbackReason": "AI analysis is temporarily unavailable (API quota limit reached). You can continue using the manual fallback.",
    "isSupportedDistrict": true,
    "unsupportedDistrictName": null
  }
}
```

#### Action B: Submit Validated Request
```json
{
  "action": "submit",
  "source": "text",
  "requestData": {
    "raw_text": "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
    "language_code": "en",
    "state": "Karnataka",
    "district": "Ramanagara",
    "category": "roads",
    "need_summary": "Rebuild village connecting road damaged during monsoon.",
    "severity": "high",
    "ai_confidence": 0.95
  }
}
```
**Response (HTTP 200 on valid, HTTP 422 on validation failure):**
```json
{
  "success": true,
  "request": {
    "id": "3aa7c3b2-8eda-4f6e-b7e2-e18f9cb02f18",
    "source": "text",
    "raw_text": "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon.",
    "language_code": "en",
    "state": "Karnataka",
    "district": "Ramanagara",
    "category": "roads",
    "need_summary": "Rebuild village connecting road damaged during monsoon.",
    "severity": "high",
    "ai_confidence": 0.95,
    "created_at": "2026-09-29T03:32:26.263Z"
  },
  "provider": "supabase"
}
```

---

### 2. `GET /api/dashboard`

**Response (HTTP 200):**
```json
{
  "summary": {
    "total_requests": 52,
    "districts": 8,
    "hotspots": 14,
    "pilot_requests": 52,
    "outside_pilot_requests": 0
  },
  "hotspots": [
    {
      "state": "Karnataka",
      "district": "Ramanagara",
      "category": "roads",
      "request_count": 10,
      "demand_score": 90.9,
      "infrastructure_gap_index": 78,
      "population_impact_score": 72,
      "planned_coverage_pct": 22,
      "unaddressed_gap": 60.8,
      "priority_score": 79.7,
      "recommended_project": "Rural road rehabilitation",
      "source_status": "demo_synthetic"
    }
  ],
  "requests": [
    {
      "id": "a1b2c3d4-0001-4000-8000-000000000001",
      "source": "text",
      "raw_text": "Road to school completely washed out in rains",
      "language_code": "en",
      "state": "Karnataka",
      "district": "Ramanagara",
      "category": "roads",
      "need_summary": "Rebuild school access road",
      "severity": "high",
      "ai_confidence": 0.95,
      "created_at": "2026-09-29T00:00:00.000Z"
    }
  ],
  "meta": {
    "provider": "supabase",
    "is_database_online": true,
    "updated_at": "2026-09-29T03:30:00.000Z"
  }
}
```

---

## Defensive Fallback Hierarchy

1. **AI API (OpenRouter) 429/503/Timeout:** Automatically invokes `getPreparedFallback()` with keyword classification and pilot location mapping; informs the citizen with an inline alert and allows manual adjustment.
2. **Supabase Postgres Offline / Missing Credentials:** Persistence layer switches to `localRequestStore` initialized from seed fixtures, maintaining full UUID generation and dynamic signal updates.
3. **Voice Input:** Cut after TASK-003 viability evaluation; text intake with 1-click multilingual test presets guarantees zero-latency execution.
