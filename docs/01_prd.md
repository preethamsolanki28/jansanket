# Product Requirements Document

## Product

**JanSanket — AI-powered citizen demand intelligence for infrastructure planning.**

## Must-have features

### MUST-1 — Multilingual citizen intake: text + short voice

A citizen can submit a development request as text or record a short browser audio clip. Gemini converts the input into a structured request containing:

- transcript / normalized text
- detected language
- state and district, when stated clearly
- infrastructure category
- concise need summary
- severity
- extraction confidence

Supported demo languages: English, Hindi, Kannada and Tamil. The interface itself may remain primarily English to save time.

### MUST-2 — AI normalization + district demand aggregation

Every accepted request is normalized into a fixed schema and stored. The dashboard aggregates requests by **district + category**, producing demand counts and demand intensity rather than displaying only individual complaints.

The critical design choice: Gemini is used for **unstructured-to-structured understanding**, while aggregation and scoring are deterministic application logic. Do not let an LLM invent the priority score.

### MUST-3 — Transparent infrastructure-priority dashboard

The policymaker view shows:

- demand hotspots by district/category
- infrastructure-gap indicator
- population-impact indicator
- existing/planned-investment coverage
- a deterministic priority signal with component breakdown
- a plain-language project recommendation such as “rural road rehabilitation” or “drinking-water network expansion”
- a visible label stating whether context values are demo-synthetic or official-source-derived

The dashboard is decision support. It does not automatically allocate money, approve a project, or claim causal impact.

## Should-have features

1. Manual correction of Gemini extraction before saving when district/category is uncertain.
2. A WhatsApp-like **message simulation screen** showing how an eventual messaging adapter would send the same normalized request into the pipeline. This is only a UI simulation, not a WhatsApp API integration.
3. Semantic similarity using Gemini embeddings + Supabase pgvector to show “similar requests” for a selected request. This is explicitly off the critical path.
4. Simple export of the current hotspot table as CSV.
5. Planner authentication using Supabase Auth.

## Explicit Won't-do list

- No WhatsApp Business API, Telegram API or other messaging-platform integration in the MVP.
- No live ingestion pipeline from national government APIs within the 12-hour build.
- No Google Maps/GIS map layer.
- No predictive model, ML training, or forecasting model.
- No automatic budget allocation or project approval.
- No citizen profiles, Aadhaar, phone-number collection, precise home address, or other unnecessary PII.
- No image analysis or citizen-photo workflow.
- No full multilingual UI translation.
- No complex agent architecture.
- No RAG over policy documents.
- No claim that synthetic demo indicators are official statistics.

## User flow

1. Citizen opens **Submit Request**.
2. Citizen chooses **Text** or **Voice**.
3. Citizen enters or records a short development request and mentions a district/state.
4. Next.js sends the input to a server route; the Gemini API key never reaches the browser.
5. Gemini returns structured normalized fields.
6. The app validates the fields. If location/category is missing or invalid, the citizen can correct the fields manually.
7. The request is stored in Supabase Postgres.
8. The dashboard queries aggregated requests and district context.
9. The deterministic priority formula recalculates for each district/category.
10. Planner opens the hotspot details and sees the evidence behind the priority signal.

## Wow moment

**Speak one sentence in Hindi/Kannada/Tamil, watch Gemini turn it into a clean district-level infrastructure signal, submit it, and watch that signal increase on the planning dashboard.**

That is the demo. Do not replace it with a slideshow of architecture diagrams.

## Assumptions being made

- Citizens can mention at least a district/state or choose it manually if Gemini cannot extract it.
- District is an acceptable MVP geographic unit; village/ward-level geospatial accuracy is intentionally excluded.
- A short voice clip is sufficient to demonstrate voice-first intake.
- Gemini can reliably return the required structured fields when given a strict schema and constrained category list.
- 120 synthetic requests are sufficient to visually demonstrate aggregation and hotspots.
- District context values can be realistically structured from public-source variables even when the actual values are synthetic.
- Planned-investment coverage is represented as a simple district/category coverage field in the demo, not a full government project ledger.
- Human planners will review signals before taking action.
