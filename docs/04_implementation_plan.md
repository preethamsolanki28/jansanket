# Implementation Plan

## Time budget

**Maximum available build time: ~12 hours across two days.**

Target planned implementation: **~7 hours 45 minutes**.

Reserve the remaining **~4 hours 15 minutes** for debugging, college interruptions, deployment problems, rehearsal, and recovery. Do not spend the reserve on new features.

## M0 — Boot + risk test

**Goal:** Get the app running and prove/kill the highest-risk input path before building around it.

### TASK-001 — App shell — 15 min [DONE]

- [x] Confirm Next.js App Router + TypeScript.
- [x] Confirm Tailwind + shadcn/ui.
- [x] Create `/dashboard` and `/submit`.

**Done when:** both routes load locally.

### TASK-002 — Environment — 5 min [DONE]

- [x] Add required environment variables.
- [x] Confirm server-only secrets are not exposed.

**Done when:** app starts without configuration errors.


### TASK-003 — Gemini viability test — 20 min [DONE]

- [x] Test 5 multilingual text requests (English, Hindi, Kannada, Tamil, unstated location).
- [x] Verified structured extraction schema (language, state, district, category, need_summary, severity, confidence).
- [x] Voice marked **CUT** based on API latency and browser reliability risks; multilingual text proven.

**Done when:** text path is proven. Voice is either marked **KEEP** or **CUT** based on the result.


**M0 total: 40 min**

---

## M1 — Data foundation

**Goal:** Have a reliable dashboard data source before any live AI flow exists.

### TASK-010 — Schema + RLS — 25 min [DONE]

- [x] Create strictly `citizen_requests` and `district_context`.
- [x] Context key must be `state + district + category`.
- [x] Enable RLS with public read policies and server insert policy.

**Done when:** migration runs and intended tables have correct access controls.

### TASK-011 — Seed context — 15 min [DONE]

- [x] Create context rows for 8 districts across 4 states and the selected categories (48 rows).
- [x] Calibrated population proxies, gap indices, and coverage percentages.
- [x] Labelled `demo_synthetic` with candidate public data source URLs.

**Done when:** every seeded district/category used by the demo has a context row.

### TASK-012 — Seed ~50 requests — 20 min [DONE]

- [x] Create 52 natural-language requests across English, Hindi, Kannada, and Tamil.
- [x] Deliberately produce visible hotspots (Ramanagara roads ranks #1, followed by Bahraich water, Barmer power, Dharmapuri healthcare, and Varanasi sanitation).
- [x] Provide typed fallback fixtures in `lib/demo-data.ts` for `DEMO_MODE=true`.

**Done when:** dashboard query can return at least 3–4 meaningful hotspot combinations.

**M1 total: 60 min**


---

## M2 — Citizen intake

**Goal:** A citizen can submit a request without page reload.

### TASK-020 — Text intake — 25 min [DONE]

- [x] Textarea with character counter.
- [x] Optional state/district hints.
- [x] Analyze button sending requests to server-side `/api/requests`.

**Done when:** text reaches the server route.

### TASK-021 — Optional minimal voice — 15 min [SKIPPED - VOICE CUT]

Only perform this task if TASK-003 marked voice **KEEP**.
*(Voice was marked CUT in TASK-003; skipped per architecture specification).*

### TASK-022 — Strengthen text-only path and fallback — 20 min [DONE]

- [x] Quick-fill buttons for 4 Indian languages (English, Hindi, Kannada, Tamil).
- [x] AI extraction preview card displaying language, district, category, need, severity, and confidence.
- [x] Citizen verification and manual adjustment capability before submission.
- [x] Confirm & Submit without page reload.

**Done when:** there is exactly one reliable submission path.

### TASK-023 — Error fallback — 15 min [DONE]

- [x] Microphone failure → guaranteed text-only path.
- [x] Gemini failure / quota exhaustion → automatic prepared / manual fallback so user is never trapped.
- [x] District validation failure → clear inline warning and canonical district picker.
- [x] Input length guard (<5 chars) with instant feedback.

**Done when:** a failed dependency cannot trap the user.

**M2 total: 60 min**


---

## M3 — Gemini normalization + persistence

**Goal:** Raw citizen language becomes validated structured data and is persisted.

### TASK-030 — Gemini extraction — 30 min [DONE]

- [x] Use `gemini-3.8-flash` with a constrained structured JSON response schema.
- [x] Server-side normalization for English, Hindi, Kannada, and Tamil citizen text.
- [x] Resilient multilingual fallback handler ensuring pipeline never traps citizens during rate-limit / outage events.
- [x] AI never calculates priority score.

**Done when:** English, Hindi, Kannada and Tamil text examples return usable structured results.

### TASK-031 — Validation — 20 min [DONE]

- [x] Allowed category validation (`roads`, `water`, `sanitation`, `healthcare`, `education`, `power`, `transport`, `other`).
- [x] Confidence range validation (0.0 to 1.0).
- [x] Known pilot district and state validation (8 districts across 4 states with canonical mapping).
- [x] Non-empty need summary (length >= 3).
- [x] Severity enum validation (`low`, `medium`, `high`).
- [x] Non-empty raw text (length >= 5).
- [x] Rejection of invalid model output with HTTP 422.

**Done when:** invalid model output cannot silently reach the database.

### TASK-032 — Persist request — 25 min [DONE]

- [x] Server-side persistence via `POST /api/requests` (`action: "submit"`).
- [x] Browser never writes directly to database; server route owns persistence.
- [x] Validated data receives UUID and ISO created_at timestamp.
- [x] Supabase Postgres integration via PostgREST with active DEMO_MODE fallback store when unconfigured.

**Done when:** the submission gets a UUID and appears in Supabase.

### TASK-033 — Deterministic score — 15 min [DONE]

- [x] Implement the exact priority formula in `lib/priority.ts`:
  `requests_per_100k = (request_count / population) * 100000`
  `demand_score = min(100, requests_per_100k * 5)`
  `unaddressed_gap = infrastructure_gap_index * (1 - planned_coverage_pct / 100)`
  `priority_score = 0.40 * demand_score + 0.30 * infrastructure_gap_index + 0.15 * population_impact_score + 0.15 * unaddressed_gap`
- [x] Implement deterministic category-to-project mapping (8 categories).
- [x] Aggregation functions compute identical results for identical database states.
- [x] Hero hotspot confirmed: Ramanagara roads ranks #1 with priority score 79.7.

**Done when:** identical database state produces identical results.

**M3 total: 90 min**

---

## M4 — Planner dashboard

**Goal:** Turn the stored requests into the project's core differentiator.

### TASK-040 — KPI summary — 15 min [DONE]

- [x] Show 3 KPI cards: total requests, districts covered, active hotspots.
- [x] Initialized from active database / demo seed fixtures.
- [x] Displays `demo_synthetic` badge clearly.

**Done when:** seeded values render correctly.

### TASK-041 — Hotspot view — 25 min [DONE]

- [x] Hotspot table sorted strictly descending by priority signal.
- [x] Shows rank, location, sector category badge, request count, priority score, and deterministic recommended project.
- [x] Interactive row selection with initial default to rank #1 hotspot (Ramanagara roads).

**Done when:** 3–4 hotspots are immediately readable.

### TASK-042 — “Why this hotspot?” — 30 min [DONE]

- [x] Selected hotspot detail panel displays all 6 transparent score components:
  - demand score (40%);
  - infrastructure gap (30%);
  - population impact (15%);
  - planned investment coverage proxy;
  - unaddressed gap (15%);
  - priority signal.
- [x] Mathematical formula breakdown with exact weighted calculation.
- [x] Clear `demo_synthetic` baseline disclaimer.

**Done when:** a judge can understand the signal without asking how it was calculated.

### TASK-043 — Refresh after submission — 20 min [DONE]

- [x] Implemented `GET /api/dashboard` dynamic endpoint.
- [x] Interactive "Refresh Signals" action button.
- [x] Window focus revalidation.
- [x] Tested: submitting a new request increments total count and visibly updates hotspot request counts and priority score.

**Done when:** the relevant request count visibly changes.

**M4 total: 90 min**

---

## M5 — Deploy + harden + demo

**Goal:** Have a stable submission and a repeatable demonstration.

### TASK-050 — Minimal polish — 10 min

Fix only obvious layout issues, especially dashboard overflow and submit form readability.

**Done when:** the app looks deliberate, not broken.

### TASK-051 — Vercel deploy — 25 min

Set environment variables and deploy.

**Done when:** public dashboard and submit route load.

### TASK-052 — Production smoke test — 25 min

Test only the critical path and fallback.

**Done when:** core path passes once in production.

### TASK-053 — Build demo assets — 15 min

Prepare:

- one known-good request;
- one known-good voice clip if voice survived;
- Hindi/Kannada/Tamil text examples;
- dashboard backup screenshot;
- local URL.

**Done when:** you can continue the demo without inventing inputs live.

### TASK-054 — Record 60-second demo — 20 min

Record the safest working path.

**Done when:** video shows request → Gemini → save → changed planning signal.

### TASK-055 — Submission package — 20 min

Prepare source link, deployed link, short description, pitch outline, and final video.

**Done when:** all required submission assets are ready.

**M5 total: 115 min**

---

## Planned time summary

| Milestone | Time |
|---|---:|
| M0 | 40 min |
| M1 | 60 min |
| M2 | 60–75 min |
| M3 | 90 min |
| M4 | 90 min |
| M5 | 115 min |
| **Planned total** | **7h 35m–7h 50m** |
| **Recovery reserve** | **~4h 10m–4h 25m** |

## Cut list — exact order

1. Live voice recording. Use multilingual text instead.
2. Manual correction UI. Keep server validation and a clear fallback.
3. Live dashboard refresh. Use a manual page refresh.
4. Mobile polish beyond avoiding overflow.
5. Extra hotspot filters.
6. Any optional UI examples beyond the three multilingual sample requests.

**Never cut:** Gemini integration, validated structured extraction, persistence, deterministic aggregation/scoring, seeded context, hotspot explanation, and a working deployed/recorded demo.

## Manual smoke-test checklist

### Local

- [ ] `npm run dev` starts cleanly.
- [ ] `/dashboard` loads with seeded data.
- [ ] `/submit` loads.
- [ ] English text request works.
- [ ] Hindi text request works.
- [ ] Kannada text request works.
- [ ] Tamil text request works.
- [ ] Voice works once **only if voice survived the viability test**.
- [ ] Gemini failure does not break the dashboard.
- [ ] Request is saved to Supabase.
- [ ] Request count increases after submission.
- [ ] Priority score is deterministic.
- [ ] No API key appears in browser code/network responses.
- [ ] `DEMO_MODE=true` renders dashboard fixtures.

### Production

- [ ] Vercel environment variables are present.
- [ ] No `.env` or secrets are committed.
- [ ] Dashboard loads without making a new AI call.
- [ ] Submit route works once.
- [ ] Gemini error has a safe user-facing message.
- [ ] Microphone failure falls back to text if voice exists.
- [ ] Database failure does not expose internals.
- [ ] Recorded demo works without network access.
