# Design Specification

## Visual direction

**Style adjectives:** Civic, calm, analytical

The interface should look like a serious public-sector planning tool, not a generic AI chatbot.

## Design tokens

| Token | Value |
|---|---|
| Primary | `#1D4ED8` |
| Primary hover | `#1E40AF` |
| Background | `#F8FAFC` |
| Surface/card | `#FFFFFF` |
| Text | `#0F172A` |
| Muted text | `#64748B` |
| Border | `#E2E8F0` |
| Success | `#15803D` |
| Warning | `#B45309` |
| Error | `#B91C1C` |
| High-priority background | `#FEE2E2` |
| Medium-priority background | `#FEF3C7` |
| Neutral badge background | `#E2E8F0` |
| Demo-data badge background | `#DBEAFE` |

## Font

**Inter** using Next.js `next/font`, with `ui-sans-serif, system-ui, sans-serif` fallback.

## MVP layout principles

- Max-width around 1200px.
- One primary action per screen.
- Data first, decoration second.
- No animated dashboards or decorative maps.
- Every synthetic value has an obvious `Demo data` label.
- The dashboard visually emphasizes **why a hotspot surfaced**.

## Buttons

- Primary: solid primary button, `rounded-md`.
- Secondary: outline button.
- Voice: same primary/secondary system with clear recording state.
- No custom button component beyond shadcn/ui unless required.

## Cards

Use shadcn `Card` for:

- KPI summary
- AI extraction preview
- selected hotspot detail
- priority explanation

Avoid deeply nested cards.

## shadcn/ui components to use

- `Button`
- `Card`
- `Badge`
- `Textarea`
- `Select`
- `Tabs`
- `Progress`
- `Table`
- `Alert`
- `Separator`
- `Tooltip`

Do not add a chart or map library.

## Screens and navigation

### `/dashboard` — Development Demand Intelligence

Order:

1. Header: **Citizen demand intelligence** + `Demo data` badge.
2. Three KPI cards:
   - total requests
   - districts covered
   - active hotspots
3. Hotspot table sorted by priority signal.
4. Selected hotspot detail:
   - district/category
   - request count
   - demand score
   - infrastructure gap
   - population impact
   - investment-coverage proxy
   - unaddressed gap
   - priority signal
   - recommended project type
5. Small explanation block: “How this signal is calculated”.

### `/submit` — Citizen Request

1. Short instruction.
2. `Text` tab is always available.
3. `Voice` tab appears only if the voice viability test passes.
4. Text mode:
   - textarea
   - optional state hint
   - optional district hint
   - Analyze button
5. Voice mode (optional):
   - record/stop
   - duration
   - Analyze button
6. AI extraction preview:
   - language
   - district
   - category
   - need
   - severity
   - confidence
7. Confirm & Submit.
8. Success: request ID + **View planning signal** action.

### `/`

Redirect to `/dashboard` for the demo.

## Mobile-responsive requirements

Only implement the obvious essentials:

- one-column submit form;
- no horizontal overflow;
- KPI cards wrap;
- hotspot detail moves below the table/cards;
- buttons remain touch-friendly.

Do not spend a milestone on perfect mobile behavior.

## Loading states

- Analyze button: `Analyzing with Gemini…`
- Voice: `Transcribing and classifying…`
- Dashboard: lightweight skeleton or spinner.

Never freeze the full page.

## Empty states

Dashboard:

> **No citizen signals yet.** Submit the first request to start building the demand signal.

## Error states

Gemini failure:

> **AI analysis is unavailable right now. Continue with the fallback input path.**

Microphone unavailable:

> **Voice input is unavailable on this device. Use text instead.**

Unknown district:

> **We could not verify this district. Please select a supported district.**

Database failure:

> **The request could not be saved. Demo data is still available.**

Never expose SQL errors, API keys, stack traces, or internal prompts.

## Demo/seed data plan

Use approximately **50 realistic synthetic citizen requests** across:

- **4 states:** Karnataka, Uttar Pradesh, Rajasthan, Tamil Nadu.
- **8 districts:** Ramanagara, Tumakuru, Bahraich, Varanasi, Barmer, Dausa, Dharmapuri, Madurai.
- **6 primary categories:** Roads, Water, Sanitation, Healthcare, Education, Power.
- **4 example languages:** English, Hindi, Kannada, Tamil.

The context table must be keyed by **district + category**.

Every context row uses:

```text
source_status = demo_synthetic
```

and includes a public source-family/reference URL.

The seed requests should deliberately contain varied wording so Gemini has a real normalization task:

- monsoon road access;
- drinking-water access;
- school toilets/water;
- distance to primary healthcare;
- unreliable local power;
- sanitation gaps.

Do not create fake citizen names, phone numbers, exact addresses, Aadhaar numbers, or other personal details.
