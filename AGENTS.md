# AGENTS.md

## Project description

JanSanket is an AI-powered Digital Public Good prototype that converts multilingual citizen development requests into district/category demand signals and transparent infrastructure-planning priority evidence.

## Fixed stack

- Next.js (App Router, Turbopack)
- TypeScript
- shadcn/ui
- Tailwind CSS
- Supabase: Postgres (PostgREST HTTP queries)
- AI Provider: Google Gemini (`gemini-3.5-flash-lite`) via server-side REST API
- Vercel
- Python/FastAPI on Render only if a proven blocker makes it necessary; default is no Python backend

Read `docs/00_problem.md`, `docs/01_prd.md`, `docs/02_architecture.md`, `docs/03_design.md`, `docs/04_implementation_plan.md` and `docs/05_demo_and_pitch.md` before writing code.

Implement one milestone task at a time.

Tick off completed tasks in `docs/04_implementation_plan.md`.

Do not add new libraries without asking me.

Ask when anything is ambiguous.

## MVP non-negotiables

- Citizen intake is India-wide across all 28 States and 8 Union Territories.
- Planning analytics and hotspot rankings are restricted to the 8 pilot districts where `demo_synthetic` context baselines exist.
- Requests outside the pilot set are stored faithfully with valid state + district and marked "Outside Pilot Coverage" without fabricating priority scores.
- Geographic validation between State and District is deterministic via static dataset (`lib/india-locations.ts`). Never call LLMs for simple geographic validation.
- Missing district must be prompted for; never default or force to Ramanagara.
- Text is the guaranteed citizen-intake path with 1-click multilingual presets (voice was evaluated in TASK-003 and cut due to mobile latency/permissions).
- Voice is optional and must not block the text flow.
- AI interprets unstructured input; deterministic application logic computes the planning signal.
- AI never calculates priority scores, allocates budgets, or approves projects.
- The deterministic priority formula ($0.40 \times \text{Demand} + 0.30 \times \text{Need} + 0.15 \times \text{People Affected} + 0.15 \times \text{Unaddressed Need}$) must not be modified.
- District context is keyed by `state + district + category`.
- Demo context values are labelled synthetic.
- No authentication is required for the MVP.
- No pgvector is required for the MVP.
- No live government-data ingestion is required for the MVP.
- `DEMO_MODE` must remain available as a demo fallback.
- Dashboard provides two distinct views: High-Need Areas (pilot hotspots) and All Citizen Requests (complete dataset visibility).
- Do not turn JanSanket into a generic chatbot.
- Do not automatically allocate public money or approve projects.

## Commands

### Development

```bash
npm run dev
```

### Typecheck

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Production build

```bash
npm run build
```

### Production Smoke Test

```bash
npx tsx scripts/smoke-test.ts
```

Before committing, run at minimum:

```bash
npm run typecheck && npm run build && npx tsx scripts/smoke-test.ts
```

If one of these scripts does not exist in `package.json`, add the script rather than assuming it exists.

## Security rules

1. Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.
2. Never prefix server secrets with `NEXT_PUBLIC_`.
3. Enable RLS on Supabase tables that are exposed through the Data API/client.
4. Do not store Aadhaar numbers, phone numbers, names, exact home addresses, or other unnecessary PII.
5. Do not persist raw citizen audio in the MVP.
6. Validate all user input server-side; client-side validation is not sufficient.
7. Accept only intended audio types and enforce a strict size/duration limit when voice is enabled.
8. Never expose SQL errors, stack traces, prompts, API responses containing secrets, or internal configuration to users.
9. Do not store model chain-of-thought. Store only concise user-facing explanations/evidence.
10. Never present synthetic demo values as official statistics.
11. Sanitize and constrain user-controlled output rendered by the dashboard.
12. Do not add third-party analytics, tracking, or data brokers to the citizen flow.
13. Do not create a public browser-to-database write path for citizen requests; persist through controlled server routes.
14. Treat the deployed app as a hackathon prototype, not a production government service.

## Git rules

1. Never commit `.env`, `.env.local`, API keys, service-role keys, or credentials.
2. Prefer one small commit per completed implementation task where practical.
3. Prefer commit messages such as:

```text
feat(TASK-020): add text intake
feat(TASK-030): add Gemini normalization
feat(TASK-042): add hotspot explanation
```

4. Do not force-push shared branches.
5. Do not commit generated audio recordings, local database dumps, or secrets.
6. Before the final push, verify `git diff`, `git status`, and that no secrets are staged.
7. Keep the repository buildable after each milestone.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
