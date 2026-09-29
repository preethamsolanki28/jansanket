# JanSanket (जनसंकेत)
> **AI-Powered Digital Public Good for Transparent Infrastructure Planning Intelligence**

JanSanket converts unstructured multilingual citizen development requests into normalized district-level demand signals and explainable infrastructure-planning priority evidence.

---

## The Problem
State and national infrastructure planning teams across India struggle to consolidate fragmented citizen requests arriving via diverse linguistic regions and formats. Existing grievance portals (like CPGRAMS) log individual tickets for dispute resolution, but planning departments lack an aggregated demand signal to compare citizen needs against baseline infrastructure deficits and committed investments.

## What the MVP Actually Does
1. **Multilingual Citizen Intake (`/submit`):** Accepts citizen requests in English, Hindi, Kannada, or Tamil with safe, clearly badged demo examples (*"Try an example"*).
2. **Defensive Input Screening:** Rejects meaningless text and keyboard mashing (e.g. `sdgsafdasafd`) with HTTP 400 (*"Please describe a real infrastructure or public-service problem."*).
3. **Three Distinct Intake States:**
   - **Valid AI Result:** Gemini 3.8 Flash extracts structured fields, genuine AI confidence, and an English translation.
   - **Valid Manual Fallback:** Engages on HTTP 429 quota exhaustion; shows zero fake confidence, synthesizes English summaries, and requires explicit user confirmation.
   - **Invalid Request:** Gibberish is rejected; zero confidence, zero district default, zero database writes.
4. **Honest Pilot Scope:** Covers strictly 8 pilot districts across 4 states. Locations outside coverage (e.g. Goa / Anjuna) are never silently converted to Ramanagara.
5. **Deterministic Priority Scoring:** Pure TypeScript logic computes transparent priority scores ($0.40 \times \text{Demand} + 0.30 \times \text{Need} + 0.15 \times \text{People Affected} + 0.15 \times \text{Unaddressed Need}$) and maps sector categories to standard public project interventions.
6. **Plain-Language Planner Dashboard (`/dashboard`):** Displays live summaries (*Citizen Demand*, *Districts Monitored*, *High-Need Areas*), a ranked hotspot table, and an interactive **"Why this area is highlighted"** breakdown.

---

## Architectural Data Flow

```mermaid
flowchart TD
    subgraph Client ["Client Browser (/submit & /dashboard)"]
        A[Citizen Intake /submit]
        DASH[Planner Dashboard /dashboard]
    end

    subgraph Server ["Next.js Server Runtime"]
        API_REQ[POST /api/requests]
        API_DASH[GET /api/dashboard]
        SCREEN{isMeaningfulRequest?<br/>lib/validation.ts}
        VAL[Strict Schema & Coverage Validation<br/>lib/validation.ts]
        PERSIST[Persistence Layer<br/>lib/db.ts]
        ENGINE[Deterministic Priority Engine<br/>lib/priority.ts]
    end

    subgraph ThreeStates ["3 Distinct Intake States"]
        S1["<b>1. VALID AI RESULT</b><br/>Gemini extracted, AI confidence shown,<br/>English translation verified"]
        S2["<b>2. VALID MANUAL FALLBACK</b><br/>HTTP 429 quota fallback, zero fake confidence,<br/>user explicitly confirms fields"]
        S3["<b>3. INVALID REQUEST</b><br/>Gibberish rejected, zero confidence,<br/>no district assigned, no save allowed"]
    end

    subgraph External ["External Services & Data"]
        GEMINI[Gemini 3.8 Flash<br/>Google Generative AI]
        FALLBACK[Manual Fallback Engine<br/>lib/gemini.ts]
        DB[(Supabase Postgres<br/>or In-Memory Fallback)]
        SEEDS[Bundled Demo Fixtures<br/>48 Contexts / 52 Requests]
    end

    A -->|Raw Text + Hints| API_REQ
    API_REQ --> SCREEN
    SCREEN -->|Meaningless / Gibberish| S3
    SCREEN -->|Valid Citizen Problem| GEMINI

    GEMINI -->|Success: Structured JSON| S1 --> VAL
    GEMINI -.->|Quota Exceeded / 429| FALLBACK --> S2 --> VAL
    VAL -->|Validated Request| PERSIST
    PERSIST -->|PostgREST Write| DB
    PERSIST -.->|Offline / DEMO_MODE| SEEDS

    DASH -->|Fetch Signals| API_DASH
    API_DASH --> PERSIST
    PERSIST -->|Read Requests & Context| DB
    DB --> ENGINE
    ENGINE -->|Ranked Hotspots + Plain-Language Breakdown| API_DASH
    API_DASH -->|Live Updates| DASH
```

### Responsibility Boundary
| Component | Responsibility |
| :--- | :--- |
| **OpenRouter (openai/gpt-4o-mini)** | Unstructured language understanding $\rightarrow$ structured field extraction (`language`, `district`, `category`, `need_summary`, `severity`, `confidence`). |
| **Application Logic** | Input screening, strict schema validation, canonical district mapping, database persistence, and **deterministic priority calculation**. |
| **Strict Boundary Rule** | **AI NEVER calculates priority scores, allocates budgets, or approves projects.** |

---

## Tech Stack
- **Framework:** Next.js 16.3.6 (App Router, Turbopack)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS v4, Inter Typography (`next/font/google`), Civic design tokens
- **UI Components:** shadcn/ui primitives (`Button`, `Card`, `Badge`, `Textarea`, `Alert`, `Table`)
- **AI Integration:** OpenRouter API (`openai/gpt-4o-mini`) via server-side chat completions with structured JSON output
- **Database:** Supabase Postgres (via PostgREST HTTP queries) with active fallback storage for local demonstration
- **Deployment:** Vercel

---

## Getting Started Locally

### Prerequisites
- Node.js 18.18+ (tested on Node v20 and v24)
- OpenRouter API Key ([Get one here](https://openrouter.ai/))

### 1. Clone & Install
```bash
cd code-for-communities
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
# OpenRouter AI Configuration (Server Only — Never exposed to browser)
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_MODEL=openai/gpt-4o-mini

# Optional: Supabase Postgres (If omitted, app runs smoothly in active demo store mode)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mode Configuration
DEMO_MODE=true
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The root URL redirects directly to `/dashboard`.

---

## Running Verification & Smoke Tests

JanSanket includes automated end-to-end verification suites covering all 7 correctness and stability priorities:

```bash
# 1. Typecheck and Lint
npm run lint
npm run typecheck

# 2. Production Build
npm run build

# 3. Comprehensive End-to-End Production Smoke Test (9/9 Passed)
npx tsx scripts/smoke-test.ts
```

The automated smoke test verifies:
1. `GET /api/dashboard` loads planning signals and seed data.
2. `POST /api/requests` (action: analyze) processes multilingual Indic scripts.
3. Schema validation guards reject malformed requests with HTTP 422.
4. Request persistence dynamically recalculates total requests and hotspot priority scores.
5. Zero secrets (`GEMINI_API_KEY`, Supabase keys) exposed in HTTP response bodies.
6. Meaningless and non-civic input (`sdgsafdasafd`, `hello there how are you`, `this is a test`, `I like apples`) is screened and rejected with HTTP 400.
7. Outside-scope locations (`Goa / Anjuna`) are never converted to Ramanagara and rejected on submit.
8. State-district mismatches (`Goa + Ramanagara`) are rejected with HTTP 422.
9. Indic requests produce genuine English normalized summaries (never copying raw Indic script into English fields).

---

## 60-Second Demo Walkthrough

1. **Dashboard Overview (0–8s):** Open `/dashboard`. Observe 52+ seeded requests across 8 pilot districts. Point out Rank #1 hotspot: **Ramanagara Roads** with priority score **79.7**.
2. **Citizen Submission (8–20s):** Click **"Submit Request"**. In the **"Try an example"** section, click **"ಕನ್ನಡ (Roads - Ramanagara)"**:
   > *“ಮಳೆ ಬಂದಾಗ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ, ರಾಮನಗರ ಜಿಲ್ಲೆಯ ಶಾಲೆಗೆ ಹೋಗಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ.”*
3. **AI Normalization & Purpose (20–32s):** Click **"Analyze Request"**. Point to the banner: *"AI converts the citizen's message into structured information so requests can be grouped and compared across districts."* Observe that Kannada was translated into a concise English need summary.
4. **Validation & Confirmation (32–42s):** Acknowledge the demo submission checkbox and click **"Confirm & Submit Request"**. A unique UUID is assigned and persisted. Click **"View Planning Signals"**.
5. **Explain the Hotspot (42–60s):** On `/dashboard`, observe that **Ramanagara Roads** has updated dynamically (score jumps to **83.3**). Click the row to inspect **"Why This Area Needs Attention"**:
   $$0.40(100) + 0.30(78.0) + 0.15(72.0) + 0.15(60.8) = \mathbf{83.3}$$
   Point out that AI structured the evidence, while pure deterministic code calculated the priority score.

---

## Project Structure
```text
code-for-communities/
├── app/
│   ├── page.tsx                     # Redirects to /dashboard
│   ├── layout.tsx                   # Global layout with Inter font & navigation
│   ├── dashboard/page.tsx           # Planner dashboard page
│   ├── submit/page.tsx              # Citizen intake page
│   └── api/
│       ├── requests/route.ts        # POST: analyze (Gemini) & submit (persistence)
│       └── dashboard/route.ts       # GET: aggregated planning signals & KPIs
├── components/
│   ├── dashboard-view.tsx           # Interactive dashboard, KPI cards & detail panel
│   ├── request-form.tsx             # Multilingual form with Try-an-example presets
│   ├── navigation.tsx               # Top header with demo_synthetic badge
│   └── ui/                          # shadcn primitives (button, card, alert, table)
├── lib/
│   ├── gemini.ts                    # Server-side Gemini client + 429/503 manual fallback
│   ├── validation.ts                # Meaningfulness screening, schema & coverage rules
│   ├── priority.ts                  # Deterministic priority formula & project mapping
│   ├── db.ts                        # Supabase PostgREST client & demo store fallback
│   └── demo-data.ts                 # 48 district context rows & 52 citizen requests
├── scripts/
│   ├── smoke-test.ts                # End-to-end production smoke test (7/7 checks)
│   ├── test-m3-pipeline.ts          # M3 verification suite
│   ├── test-m4-dashboard.ts         # M4 dashboard verification suite
│   ├── test-m2-intake.mjs           # M2 intake test suite
│   └── verify-m1-data.mjs           # M1 data integrity checks
├── supabase/
│   ├── migrations/                  # Schema, RLS policies, and seed migrations
│   └── seed.sql                     # Combined seed script
└── docs/
    ├── 00_problem.md                # Problem definition & user persona
    ├── 01_prd.md                    # Product requirements & boundary rules
    ├── 02_architecture.md           # Architecture design & formula specification
    ├── 03_design.md                 # Design tokens & UI specifications
    ├── 04_implementation_plan.md   # Implementation plan (M0–M5 + Stabilization)
    ├── 05_demo_and_pitch.md         # Demo pitch script & slide deck outline
    └── DEMO_CHEATSHEET.md           # 60s demo cheatsheet & judge defense Q&A
```

---

## Disclaimers & Known Limitations
- **`demo_synthetic` Baseline:** District baseline metrics (population, infrastructure need index, investment coverage) are realistic simulated proxies structured after open government data formats (data.gov.in, India Investment Grid). They are labeled `demo_synthetic` and must not be used as official government statistics.
- **8-District Pilot Scope:** The prototype covers strictly 8 pilot districts across Karnataka, Uttar Pradesh, Rajasthan, and Tamil Nadu. Outside districts are flagged honestly rather than hallucinating context.
- **Decision Support Only:** JanSanket does not automatically disburse public funds, approve projects, or replace administrative officers. It is a Digital Public Good planning intelligence prototype.
- **Privacy:** No Aadhaar numbers, phone numbers, personal names, or exact home addresses are collected or stored.
