# Design Specification

## Visual Direction

**Style adjectives:** Civic, calm, analytical

The interface is intentionally designed as an authoritative, public-sector planning and decision-support tool rather than a generic consumer AI chatbot. Visual hierarchy emphasizes analytical clarity, geographic context, and transparent metric derivation.

```mermaid
flowchart TD
    subgraph UI_Navigation [UI Navigation & Screen Flow]
        DASH["/dashboard<br/><b>Demand Intelligence</b>"]
        SUBMIT["/submit<br/><b>Citizen Intake</b>"]
        
        DASH -->|"Submit Request Action"| SUBMIT
        SUBMIT -->|"View Planning Signal"| DASH
        
        subgraph Dashboard_Components [Dashboard Screen Components]
            KPI["3 KPI Cards<br/>(Citizen Demand, Districts Monitored, High-Need Areas)"]
            TABLE["High-Need Areas Table<br/>(Rank, District, Category, Gap, Score)"]
            DETAIL["Selected Hotspot Detail<br/>(Demand, Need, People Affected, Current Coverage, Budget)"]
            FORMULA["Formula Breakdown Card<br/>(Transparent 40/30/15/15 weights)"]
            ALL_REQS["All Citizen Requests Table<br/>(Complete 52+ request log with In/Outside Pilot badges)"]
        end
        
        subgraph Submit_Components [Intake Screen Components]
            PRESETS["1-Click Multilingual Presets<br/>(English, Hindi, Kannada, Tamil)"]
            FORM["Direct Citizen Intake Textarea<br/>(Clean civic flow, no AI explainer box)"]
            GEO["India-Wide State & District Selectors<br/>(28 States + 8 UTs with static validation)"]
            PREVIEW["Extraction Preview & Review<br/>(Category, Need, Severity, Location confirmation)"]
            CONFIRM["Confirm & Submit<br/>(Server persistence → UUID)"]
        end
        
        DASH --- Dashboard_Components
        SUBMIT --- Submit_Components
    end
```

## Design Tokens

| Token | Value | Semantic Use |
|---|---|---|
| Primary | `#1D4ED8` | Primary brand actions, active tabs, progress bars |
| Primary Hover | `#1E40AF` | Hover state for primary buttons |
| Background | `#F8FAFC` | App shell slate background |
| Surface / Card | `#FFFFFF` | Analytical card containers and tables |
| Text | `#0F172A` | High-contrast body and heading text |
| Muted Text | `#64748B` | Secondary labels, descriptions, and timestamps |
| Border | `#E2E8F0` | Subtle structural dividing lines and card borders |
| Success | `#15803D` | Successful persistence confirmation, low severity |
| Warning | `#B45309` | Medium severity badge, partial confidence alert |
| Error | `#B91C1C` | High severity badge, validation rejection banner |
| High-Priority Bg | `#FEE2E2` | Priority score $\ge 70$ indicator badge |
| Medium-Priority Bg | `#FEF3C7` | Priority score $50 - 69$ indicator badge |
| Neutral Badge Bg | `#E2E8F0` | Sector tags and language identifiers |
| Demo Data Badge Bg | `#DBEAFE` | `demo_synthetic` data disclaimer badges |

## Typography

**Inter** font loaded via Next.js `next/font/google`, with a fallback to `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. Monospace elements (UUIDs, formulas, code snippets) use standard system monospace fonts.

## MVP Layout Principles

- **Max Container Width:** Centered container at `max-w-7xl` (1280px) with responsive horizontal padding.
- **Data First, Decoration Second:** Tables, metric bars, and structured evidence take priority over decorative imagery.
- **No Heavy Chart Libraries:** Component score bars are rendered via lightweight, performant native HTML/Tailwind progress meters.
- **Zero Ambiguity on Synthetic Data:** Every baseline metric, district context row, and seeded request bears an explicit `demo_synthetic` or `Demo data` badge.
- **Deep Explainability:** The UI never displays an opaque score; it displays the formula and all constituent sub-scores.

## Buttons & Interactive Controls

- **Primary Actions:** Solid blue button (`bg-blue-600 hover:bg-blue-700 text-white rounded-md`).
- **Secondary Actions:** Crisp outline button (`border border-slate-200 bg-white hover:bg-slate-100 text-slate-900`).
- **Preset Quick-Fills:** Small outline pills allowing one-click population of realistic multilingual test cases.
- **Status Badges:** Compact rounded pills with strict semantic color coding for severity and priority tiers.

## Input Methods: Text vs. Voice Decision

| Input Method | Status | Decision Rationale |
|---|---|---|
| **Multilingual Text** | **GUARANTEED CORE** | Proven with 100% test pass rate across English, Hindi, Kannada, and Tamil. Extremely fast (~1.1s), zero browser permission traps, deterministic structured extraction. |
| **Voice Input** | **CUT (TASK-003)** | Viability testing in TASK-003 identified 4.2s end-to-end latency, browser microphone permission failures on untrusted origins, and audio transcoding complexity. To eliminate demo-day failure vectors, voice was cut in favor of guaranteed multilingual text with 1-click sample presets. |

## Screens and Detailed Specifications

### 1. `/dashboard` — Development Demand Intelligence

**Header Section:**
- Application Title: `JanSanket` with subtitle `Citizen Demand Intelligence & District Planning Evidence`.
- Status Indicator: `DEMO_MODE` / `demo_synthetic` badge with tooltip detailing synthetic dataset boundaries.
- Global Actions: Direct link to `/submit` ("Submit New Request") and a manual "Refresh Signals" trigger.

**Three KPI Cards (Plain Civic Language):**
1. **Citizen Demand:** Total validated citizen requests recorded in the database (e.g., 52+ baseline).
2. **Districts Monitored:** Count of active pilot districts across monitored states (8 districts across 4 states).
3. **High-Need Areas:** Count of aggregated district-category clusters requiring priority planning intervention.

**Hotspot Priority Table:**
- Columns:
  1. `Rank`: Sequential integer (1 to $N$), sorted strictly descending by Priority Score.
  2. `Location`: Geographic identifier with state tag (e.g., `Ramanagara, Karnataka`).
  3. `Category`: Civic sector badge (`Roads`, `Water`, `Sanitation`, `Healthcare`, `Education`, `Power`).
  4. `Citizen Demand`: Citizen request volume.
  5. `Priority Score`: Composite score ($0 - 100$) with color-coded progress bar and status badge (`High`, `Medium`).
  6. `Action`: Interactive row selection to load transparent metric breakdown into detail view.

**Why this area is highlighted (Selected Hotspot Detail Panel):**
- Contextual header showing the selected location, sector, and calculated priority rank.
- **Component Metric Scorecards:**
  - `Citizen Demand (40% weight)`: Normalized per-capita demand signal ($0 - 100$).
  - `Infrastructure Need (30% weight)`: Baseline deficit benchmark ($0 - 100$).
  - `People Affected (15% weight)`: Scale and vulnerability impact factor ($0 - 100$).
  - `Current Coverage`: Existing planned scheme expenditure coverage percentage ($0 - 100\%$).
  - `Unaddressed Need (15% weight)`: Residual deficit accounting for uninvested areas.
- **Recommended Project:** Standard public project mapped deterministically from validated citizen sector demand (e.g., *"Rural road rehabilitation"*).
- **Benchmark Source Reference:** Official baseline attribution link and `demo_synthetic` calibration note.

**"How this signal is calculated" Explainer Card:**
- Full transparent mathematical formula in plain language:
  $$\text{Priority Score} = 0.40 \times \text{Demand} + 0.30 \times \text{Need} + 0.15 \times \text{People Affected} + 0.15 \times \text{Unaddressed Need}$$
- Explicit separation note explaining that Google Gemini extracts citizen facts, while deterministic TypeScript calculates policy priority.

**All Citizen Requests Section:**
- **Title:** *"All Citizen Requests"*
- **Subtitle:** *"Complete list of recorded citizen requests, including requests that are not currently part of the pilot hotspot ranking."*
- **Scope:** Complete visibility over all recorded requests (~52+ seeded records + user submissions).
- **Table Columns:**
  1. `#`: Sequential index.
  2. `State`: Indian State or Union Territory.
  3. `District`: Validated District name.
  4. `Category`: Infrastructure sector badge.
  5. `Citizen Need / English Summary`: One-sentence English synthesis.
  6. `Severity`: Controlled badge (`High`, `Medium`, `Low`).
  7. `Language`: Input language code (`kn`, `hi`, `ta`, `en`).
  8. `Source`: Citizen channel (`text`, `voice`, `manual_fallback`).
  9. `Analytics Coverage`: Distinct status badge:
     - **In Pilot Coverage** (`bg-emerald-50 text-emerald-800 border-emerald-200`): District has baseline context and contributes to hotspot scoring.
     - **Outside Pilot Coverage** (`bg-amber-50 text-amber-800 border-amber-200`): Request is saved faithfully without a fabricated priority score.
  10. `Created At`: Relative or formatted submission timestamp.
- **Responsive Layout:** Contained inside an `overflow-x-auto` wrapper ensuring clean scrolling on mobile and tablet devices.

---

### 2. `/submit` — Citizen Request Intake

**Header & Instructions:**
- Focused civic intake: *"Submit a local infrastructure or public service demand in your own language."*
- Technical AI pipeline explanations removed from citizen flow to keep the interface simple and focused.

**Try an Example (Demo Content):**
- Four distinct sample buttons clearly labelled as demo content to prevent accidental submission:
  - `ಕನ್ನಡ (Roads - Ramanagara)`: Monsoon road access issues.
  - `हिन्दी (Water - Bahraich)`: Drinking water shortage and broken handpumps.
  - `தமிழ் (Healthcare - Dharmapuri)`: Primary health center staff shortages.
  - `English (Sanitation - Varanasi)`: Overflowing village open drains.
- When clicked, displays a visual demo badge and requires explicit click of *Analyze Request* before submission.

**Location Selection & Validation (India-Wide):**
- **State Selection:** Dropdown supporting all 28 Indian States and 8 Union Territories.
- **District Selection:** Dynamic dropdown populated based on selected State, with deterministic alias normalization (e.g., `Bangalore` $\rightarrow$ `Bengaluru Urban`).
- **Extraction Behavior:**
  - Auto-detected from complaint text if confidently identified.
  - If district is missing, user is prompted to select/enter it.
  - **Never defaults or forces to Ramanagara.**
- **Geographic Validation:** Deterministically verified via `lib/india-locations.ts` without spending LLM tokens. State-district mismatches (e.g. `Goa + Ramanagara`) are rejected with a clear user message.
- **Outside Pilot Notice:** When an outside-pilot district is selected, displays a clear informational note: *"This district is outside current pilot analytics coverage. Your request will be recorded and visible under All Citizen Requests, but will not receive a priority score."*

**The 3 Distinct Intake States:**

1. **VALID AI RESULT:**
   - Source: `text` (citizen channel), Provider: `gemini` (`gemini-3.5-flash-lite`).
   - Header: *What We Understood* (citizen UI intentionally hides AI provider/model badges to keep interface civic and clean).
   - Genuine AI Confidence badge (e.g., *Confidence: 94%*).
   - Shows original text in citizen's script and *What We Understood (English Summary)*.
   - User verifies category, severity, state, and district before confirming.

2. **VALID MANUAL FALLBACK:**
   - Source: `manual_fallback` (triggered on HTTP 429 quota exhaustion or provider outage).
   - Header: *Manual Fallback Review* with *Manual Fallback Mode* badge.
   - AI Confidence badge: *AI Confidence: Not Available* (zero fake confidence).
   - Alert Banner: *"AI analysis is temporarily unavailable (API quota limit reached). You can continue using the manual fallback. Please review and confirm the category and district below."*
   - District is never defaulted to Ramanagara; user must explicitly select valid State and District.
   - Need summary displays an English synthesis (never raw Indic script).

3. **INVALID REQUEST:**
   - Triggered on gibberish, single-word junk, casual chat, or non-civic input (e.g. `sdgsafdasafd`, `hello there`).
   - Red Alert Banner: *"Please describe a real infrastructure or public-service problem."*
   - Extraction preview is blocked; submission is prohibited.

**Confirm & Submit Action:**
- Writes the validated request directly through the server-side API route.
- On success, renders a confirmation banner displaying the generated Request UUID, a link to inspect the updated dashboard, and a reset button.

---

## Responsive Design Behavior

- **Mobile Viewports (< 768px):**
  - KPI cards stack vertically into a 1-column layout.
  - Hotspot table and All Requests table enable smooth horizontal scrolling.
  - Selected Hotspot Detail panel flows directly beneath the table rather than side-by-side.
  - Submit form fields maintain full width with 48px touch-friendly hit targets.
- **Desktop Viewports ($\ge 1024px$):**
  - 3-column KPI card grid.
  - Split dashboard layout pairing the Hotspot Table with the Selected Hotspot Detail side-by-side.
  - Full-width All Citizen Requests log at the base of the dashboard.

## Error Handling & Defensive Fallbacks

| Failure Scenario | User-Facing Feedback | Fallback Behavior |
|---|---|---|
| **Meaningless / Gibberish Input (`sdgsafdasafd`)** | Red Alert: *"Please describe a real infrastructure or public-service problem."* | Block analysis; zero AI confidence; zero district default; prevent DB save. |
| **State-District Mismatch (`Goa + Ramanagara`)** | Red Alert: *"District Ramanagara does not belong to Goa. Please select a valid district."* | Block submission with HTTP 422 until valid combination is selected. |
| **Outside-Pilot District (`North Goa, Goa`)** | Info Note: *"Outside current pilot analytics coverage."* | Allowed for submission; stored faithfully; displayed in All Requests table; no fake priority score calculated. |
| **AI Provider HTTP 429 Quota Exhaustion** | Amber Alert: *"AI analysis is temporarily unavailable (API quota limit reached). You can continue using the manual fallback."* | Switches to manual fallback; zero fake confidence; synthesizes English need summary; requires user confirmation. |
| **Supabase / Network Disconnection** | Badge: *"Active Demo Store"* | Data is persisted in-memory (`localRequestStore`) so dashboard recalculation continues uninterrupted. |

## Seed Data & Demo Footprint

- **Intake Reach:** All 28 States and 8 Union Territories across India
- **Monitored Pilot States:** 4 (Karnataka, Uttar Pradesh, Rajasthan, Tamil Nadu)
- **Total Pilot Districts:** 8 (Ramanagara, Tumakuru, Bahraich, Varanasi, Barmer, Dausa, Dharmapuri, Madurai)
- **District Context Benchmarks:** Exactly 48 rows ($8 \text{ districts} \times 6 \text{ categories}$)
- **Pre-Seeded Citizen Requests:** 52 realistic natural-language submissions across English, Hindi, Kannada, and Tamil
- **Demo Hero Cluster:** Ramanagara Roads (Rank #1, baseline priority 79.7, increases to 83.3 upon submitting the Ramanagara demo case)
