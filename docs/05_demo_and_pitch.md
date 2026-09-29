# Demo and Pitch

## 60-second demo script — click by click

### 0–8 sec — Dashboard

Open `/dashboard`.

Say:

> “JanSanket turns scattered citizen development requests into district-level planning signals.”

Point to the seeded request count, districts, and hotspots.

### 8–20 sec — Citizen request

Click **Submit Request**.

**Preferred path if voice survived the viability test:** record a short prepared request such as:

> “In Ramanagara, our village road becomes unusable during the monsoon and school buses cannot reach the village.”

**Backup:** paste the same request as text.

### 20–32 sec — Gemini normalization

Click **Analyze**.

Say:

> “Gemini converts messy citizen language into a validated structure: language, district, category, need, and severity.”

Show:

- Language
- Ramanagara
- Roads
- High
- Rural road access problem

### 32–42 sec — Save

Click **Confirm & Submit**.

Show the request ID.

Click **View planning signal**.

### 42–55 sec — Explain the hotspot

Show the affected district/category hotspot.

Point to:

- demand score;
- infrastructure gap;
- population impact;
- investment-coverage proxy;
- unaddressed gap;
- final priority signal.

Say:

> “Gemini does not decide public spending. It structures the evidence; deterministic application logic calculates the planning signal.”

### 55–60 sec — Distinction

Say:

> “This is not another grievance box. It is the planning layer that turns citizen demand into comparable infrastructure evidence.”

Stop.

## Demo rules

- Use a district already present in the seed data.
- Keep the request to one sentence.
- Do not experiment with new wording during judging.
- Have the exact same request ready as text.
- Have a known-good voice clip if voice is enabled.
- Never open Supabase or debug code live.
- Do not claim synthetic context is official data.

## Multilingual proof without extra scope

The demo needs only one live language. Keep three prepared text examples visible or ready to paste:

```text
Hindi    — सड़क की हालत बारिश में बहुत खराब हो जाती है।
Kannada  — ಮಳೆ ಬಂದಾಗ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ.
Tamil    — எங்கள் பகுதியில் குடிநீர் வசதி போதுமானதாக இல்லை.
```

The purpose is to demonstrate multilingual normalization without building a multilingual UI.

## 5-slide pitch outline

### Slide 1 — Problem

**Citizen feedback exists. Comparable planning demand does not.**

Show:

`Scattered requests → fragmented signals → weak district planning evidence`

Do not frame JanSanket as a replacement for grievance-redressal systems.

### Slide 2 — Solution

**JanSanket: citizen language → planning signal**

Three blocks:

1. Multilingual text / optional short voice.
2. Gemini normalization + district/category aggregation.
3. Infrastructure/investment context → transparent signal.

Key line:

> “AI interprets messy input; deterministic logic makes the signal explainable.”

### Slide 3 — Live demo

Show only:

`Citizen request → Gemini extraction → Save → hotspot changes → why hotspot?`

No architecture deep dive here.

### Slide 4 — Architecture + Google AI

```text
Next.js
   ↓
Gemini 3.8 Flash
   ↓
Validation
   ↓
Supabase Postgres
   ↓
Deterministic aggregation/scoring
   ↓
Planner dashboard
```

Call out Google AI clearly. Gemini 3.8 Flash is configured for the MVP; verify the current Gemini model documentation before deployment if capabilities change.

### Slide 5 — Impact + scale path

**MVP:** ~50 synthetic requests, 8 districts, 4 states.

**Production path:** official district-level data ingestion → more categories/districts → governed planner access → messaging adapters → evaluation and human review.

End with:

> “JanSanket does not automate public decisions. It makes citizen demand easier to compare with infrastructure need and existing investment coverage.”

## 10 likely judge questions with concise answers

### 1. “How is this different from a grievance portal?”

The MVP is not trying to replace grievance intake or redressal. It aggregates development demand by district/category and compares it with infrastructure and investment-context proxies.

### 2. “Why use AI?”

Citizen requests are unstructured and multilingual. Gemini converts them into a common schema so the application can aggregate them consistently.

### 3. “Why Gemini?”

The challenge requires Google AI, and Gemini provides the required text/audio understanding and structured-output capability in one integration.

### 4. “Is the priority score an AI prediction?”

No. Gemini extracts the evidence. A deterministic formula combines the evidence into a transparent demo signal.

### 5. “Where did the data come from?”

The demo requests and context values are realistic synthetic data. They are explicitly labelled. The schema is designed so official Indian datasets can replace the fixtures later.

### 6. “Why not use live government APIs?”

A reliable national ingestion pipeline is outside the risk budget of a solo 12-hour prototype. Keeping ingestion off the critical path makes the demo dependable while preserving a clear production path.

### 7. “What happens if Gemini gets the district wrong?”

The result is validated against the supported district/state set. Unknown or missing locations do not silently become trusted data.

### 8. “Why no WhatsApp integration?”

A real messaging integration requires credentials, webhooks, message handling and operational setup. The MVP proves the common normalization pipeline first; a future adapter can feed the same request schema.

### 9. “Can this scale across India?”

The core entities are state/district/category based and the aggregation is data-driven rather than hard-coded to one city. Production scale would primarily require stronger ingestion, data governance, monitoring, and evaluation.

### 10. “Can an officer trust this score?”

The MVP is explicit that the score is a demo policy signal, not an objective public-value ranking. Its components and synthetic-source status are visible so a human planner can review them.

## Fallback plan if the live demo breaks

### Level 1 — Voice fails

Immediately switch to text with the prepared request.

### Level 2 — Gemini fails

Use the prepared fallback request/manual path and continue to the dashboard. Do not invent a fake Gemini response.

### Level 3 — Supabase fails

Switch `DEMO_MODE=true` and render the same dashboard from bundled fixtures.

### Level 4 — Vercel/deployment fails

Use the local build for recording and submit the recorded demo while restoring the deployment.

### Level 5 — Everything live becomes unstable

Play the **recorded 60-second demo**. Then show the architecture and source repository rather than debugging in front of judges.

## Demo backup assets

Prepare before submission:

- one known-good multilingual text request;
- one known-good voice clip if voice is enabled;
- three copy-paste multilingual examples;
- dashboard screenshot;
- Gemini extraction screenshot;
- local URL;
- deployed URL;
- recorded 60-second walkthrough.
