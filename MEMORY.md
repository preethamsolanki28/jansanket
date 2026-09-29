# Project Memory — JanSanket

## Project Purpose
JanSanket is an AI-powered Digital Public Good prototype that converts multilingual citizen development requests into district/category demand signals and transparent infrastructure-planning priority evidence. It addresses the gap between fragmented citizen feedback and macro-level public infrastructure planning in India.

---

## Current Implemented MVP (Milestone 5 + Post-M5 Stabilization Complete)

### Implemented Workflow
```mermaid
flowchart TD
    Citizen[Citizen Intake /submit] --> IntakeAI[Google Gemini gemini-3.5-flash-lite<br/>Language & Field Extraction]
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

### 1. Three Distinct Intake States
- **State 1: VALID AI RESULT**
  - Trigger: Successful Google Gemini (`gemini-3.5-flash-lite`) analysis via native structured JSON schema enforcement (`generationConfig.responseSchema`).
  - UI: Displays clean citizen-friendly *"What We Understood"* panel with genuine AI confidence (e.g. 94%), original citizen text, and an English normalized summary. AI provider and model names are intentionally hidden from the citizen interface.
- **State 2: VALID MANUAL FALLBACK**
  - Trigger: HTTP 429 quota exhaustion or backend timeout.
  - UI: Displays *Manual Fallback Review (AI Unavailable)* badge and *AI Confidence: Not Available* (**zero fake confidence**).
  - Synthesizes a genuine English category summary (never copies raw Indic text into English fields).
  - Never defaults to Ramanagara; user explicitly verifies and selects valid State and District.
  - Requires explicit user checkbox confirmation before submission.
- **State 3: INVALID REQUEST**
  - Trigger: Meaningless text, keyboard mash (`sdgsafdasafd`), greetings, test spam, casual statements (`hello there how are you`, `this is a test`, `I like apples`).
  - Screened by `isMeaningfulRequest()` in `lib/validation.ts`.
  - Blocked with HTTP 400: *"Please describe a real infrastructure or public-service problem."*
  - Zero AI confidence, zero district default, zero database write.

### 2. Geographic Scope & Pilot Analytics Separation
- **Citizen Intake Scope:** India-wide. A citizen from any of India's 28 States and 8 Union Territories can submit a complaint.
- **Planning Analytics Scope:** Scored only for the 8 pilot districts across 4 states with baseline infrastructure context (`demo_synthetic`).
- **State-District Pair Matching:** Strictly deterministic static validation (`lib/india-locations.ts`).
  - Example: `State = Goa, District = Ramanagara` is rejected (Ramanagara belongs to Karnataka, not Goa).
  - Example: `State = Karnataka, District = Ramanagara` is valid and scored in pilot hotspots.
  - Example: `State = Goa, District = North Goa` is accepted and stored as *"Outside Pilot Coverage"* without a fake priority score.
  - Normalizes common aliases (e.g. `Bangalore` $\rightarrow$ `Bengaluru Urban`).
  - Never uses LLM tokens to validate static geography.
  - Never defaults or forces to Ramanagara when district is unspecified.

### 3. Safe Multilingual Demo Examples
- Renamed to *"Try an example (Demo content)"* with 4 diverse cases:
  1. `ಕನ್ನಡ (Roads - Ramanagara)`: Village road monsoon washout.
  2. `हिन्दी (Water - Bahraich)`: Drinking water shortage and broken handpumps.
  3. `தமிழ் (Healthcare - Dharmapuri)`: Primary health center doctor shortage.
  4. `English (Sanitation - Varanasi)`: Open drainage overflow and health risks.
- Clearly marked with a demo badge; requires clicking *Analyze Request* and checking an explicit demo submission acknowledgment checkbox before submission (prevents accidental submission traps).

### 4. Plain-Language Planner Dashboard (`/dashboard`)
- Replaced technical jargon with plain civic terms:
  - Total Citizen Requests $\rightarrow$ **Citizen Demand**
  - Districts Covered $\rightarrow$ **Districts Monitored** (8 pilot districts)
  - Active Hotspots $\rightarrow$ **High-Need Areas**
  - Demand Score (40%) $\rightarrow$ **Citizen Demand (40%)**
  - Infrastructure Gap (30%) $\rightarrow$ **Infrastructure Need (30%)**
  - Population Impact (15%) $\rightarrow$ **People Affected (15%)**
  - Planned Coverage $\rightarrow$ **Current Coverage**
  - Unaddressed Gap (15%) $\rightarrow$ **Unaddressed Need (15%)**
  - Hotspot Evidence Breakdown $\rightarrow$ **Why This Area Needs Attention**
- Mathematical integrity preserved:
  $$\text{Priority Score} = 0.40 \times \text{Demand} + 0.30 \times \text{Need} + 0.15 \times \text{People Affected} + 0.15 \times \text{Unaddressed Need}$$
- **All Citizen Requests Table:** Comprehensive, horizontally scrollable log of all requests (52+ seed requests + newly submitted), displaying ID, State, District, Category, English summary, Severity, Language, Source, Pilot Status badge (*In Pilot Coverage* vs *Outside Pilot Coverage*), and Timestamp.

### 5. Database Write Security & Supabase Fallback Hardening
- **RLS Write Security:** `citizen_requests` INSERT access is restricted strictly to `service_role` via `supabase/migrations/20260929000004_fix_write_security.sql`. Browser/client anonymous direct inserts are completely blocked.
- **Fail-Safe Persistence:** `lib/db.ts` throws an explicit error when Supabase is configured but a write fails (returning HTTP 503), preventing false success reports.
- **Provider Status:** UI indicates whether requests were saved to *Supabase Postgres* or the *Active Demo Store*.

---

## Current Stack
- **Framework:** Next.js 16.3.6 (App Router, Turbopack)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS v4, Inter font (`next/font/google`), civic tokens from `docs/03_design.md`
- **UI Components:** shadcn/ui primitives (`Button`, `Card`, `Badge`, `Textarea`, `Alert`, `Table`)
- **AI Model:** `gemini-3.5-flash-lite` via Google Gemini REST API (`lib/ai.ts` with structured `responseSchema`)
- **Database:** Supabase Postgres (with PostgREST HTTP queries and active demo store fallback)
- **Testing:** Standalone verification suites (`scripts/smoke-test.ts` with 9/9 automated checks, `scripts/test-ai-provider.ts` with 30/30 checks)

---

## Important Architectural Decisions
- **D001:** Next.js Route Handlers instead of Python/FastAPI backend (simplifies deployment to 1 Vercel project).
- **D002:** Multilingual text is the guaranteed intake path with 1-click test examples; voice was tested in TASK-003 and CUT due to 4.2s latency, mobile mic permissions, and audio transcoding risks.
- **D003:** Strict separation of responsibilities:
  - **AI Responsibility:** Unstructured citizen input $\rightarrow$ structured fields.
  - **Application Responsibility:** Validation $\rightarrow$ Persistence $\rightarrow$ Deterministic Priority Calculation $\rightarrow$ Category Project Mapping.
- **D004:** Context key is strictly `state + district + category` across 8 pilot districts.
- **D005:** Synthetic data is explicitly labeled `demo_synthetic`. Baseline values are simulated proxies based on public data formats (OGD/IIG).
- **D006:** `DEMO_MODE=true` and unconfigured Supabase mode gracefully fall back to active memory fixtures without throwing unhandled exceptions.
- **D007 (Post-M5):** 3-state pipeline guarantees: invalid input is rejected with HTTP 400; manual fallback shows zero fake confidence; unsupported districts and mismatched state-district pairs are never silently altered.
- **D008 (Post-M5):** Database security: client writes must traverse server route; anon INSERT policy removed; Supabase write failure returns HTTP 503 instead of false success.
- **D009 (AI Abstraction):** AI extraction is abstracted into `normalizeCitizenRequest(...)` in `lib/ai.ts` with strict structured outputs, falling back to clean manual review on provider rate limits or errors.
- **D010 (Post-M5 UX & Data-Scope Expansion):**
  - Removed "How JanSanket uses AI" box from `/submit` to keep the citizen flow focused strictly on civic intake.
  - Expanded citizen intake to **all 28 States and 8 UTs** across India.
  - Implemented deterministic static geographic validation (`lib/india-locations.ts`) avoiding unnecessary LLM calls for state-district lookups.
  - Separated intake from pilot analytics: non-pilot requests are stored faithfully as *"Outside Pilot Coverage"* without fabricating context metrics or priority scores.
  - Expanded `/dashboard` and `/api/dashboard` with an **All Citizen Requests** section providing complete visibility across all 52+ recorded requests alongside the 8-district pilot hotspot ranking.
- **D011 (Google AI Requirement & Gemini Migration):**
  - Migrated JanSanket to Google Gemini (`gemini-3.5-flash-lite`) as the sole and primary AI extraction provider to satisfy the official hackathon mandate ("All solutions must integrate Google AI").
  - Model: `gemini-3.5-flash-lite` optimized for high-volume, cost-efficient multilingual extraction.
  - Removed OpenRouter from the active request flow.
  - AI provider details and model names are strictly hidden from the citizen `/submit` UI.
  - On Gemini HTTP 429 quota exhaustion or temporary failure, the system transparently engages `manual_fallback` with zero fake confidence or hallucinated locations.

---

## What is NOT Implemented (By Design for Hackathon Scope)
- **NO Authentication:** Public access for MVP demo; Supabase Auth is intentionally excluded.
- **NO pgvector / Embeddings:** Semantic similarity is off the critical path.
- **NO Voice Recording / Audio Storage:** Cut after viability evaluation; raw audio is never persisted.
- **NO WhatsApp / Telegram APIs:** Simulated or live messaging bots are out of scope.
- **NO Live Government API Ingestion:** All baseline metrics are simulated proxies to prevent external API downtime from breaking judging.
- **NO Automated Budget Allocation:** Platform is decision support only; human planners retain final authority.
- **NO Maps or Chart Libraries:** Clean tabular and card-based analytics per `docs/03_design.md`.
- **NO PII Collection:** Zero Aadhaar numbers, phone numbers, personal names, or exact home addresses.

---

## Guidelines for Future Coding Agents
1. **Never expose secrets:** `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_` or passed to client components.
2. **Never let AI compute priority scores:** Priority calculation must remain pure, deterministic TypeScript in `lib/priority.ts`.
3. **Preserve Fallbacks:** Always keep `getPreparedFallback()` in `lib/ai.ts` and `localRequestStore` in `lib/db.ts` so rate-limited API keys never break user flows or automated tests.
4. **Before committing changes, run:**
   ```bash
   npm run lint && npm run typecheck && npm run build
   npx tsx scripts/test-ai-provider.ts
   npx tsx scripts/smoke-test.ts
   ```
