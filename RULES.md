# RULES.md — JanSanket Engineering & Contribution Rules

## 1. Core Architectural Non-Negotiables
1. **Responsibility Separation:**
   - **Gemini Responsibility:** Unstructured citizen input $\rightarrow$ structured fields (`language`, `state`, `district`, `category`, `need_summary`, `severity`, `confidence`).
   - **Application Responsibility:** Strict schema validation, canonical district mapping, database persistence, and **deterministic priority calculation**.
   - **Never let Gemini calculate the priority score, allocate budgets, or approve projects.**
2. **Security & Secrets:**
   - Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client browser.
   - Never prefix server secrets with `NEXT_PUBLIC_`.
   - Never commit `.env`, `.env.local`, API keys, or credentials.
3. **Database Write Path:**
   - Browsers must never write directly to Supabase. Next.js server routes (`app/api/requests/route.ts`) own persistence.
   - All input must be validated server-side via `validateCitizenRequest()` in `lib/validation.ts`. Invalid model output must be rejected with HTTP 422.
4. **Data Integrity & Provenance:**
   - District context is strictly keyed by `state + district + category`.
   - All baseline demonstration metrics must be labeled `demo_synthetic`. Never present synthetic demo values as official government statistics.
   - No PII: Do not collect or store Aadhaar numbers, phone numbers, personal names, or exact home addresses.
5. **Resiliency & Fallbacks:**
   - `DEMO_MODE=true` and unconfigured Supabase mode must gracefully fall back to active memory fixtures without throwing unhandled exceptions.
   - Always preserve `getPreparedFallback()` in `lib/gemini.ts` so Gemini quota limits (429) or outages (503) never trap the user.

---

## 2. Coding & Design Standards
1. **Fixed Tech Stack:**
   - Next.js (App Router, Turbopack)
   - TypeScript (Strict Mode)
   - Tailwind CSS v4 + shadcn/ui primitives
   - Gemini API via server-side REST calls (`gemini-3.8-flash`)
   - Supabase Postgres
   - Do not install new libraries without explicit justification.
2. **Visual Direction:**
   - Civic, calm, analytical aesthetic using tokens from `docs/03_design.md`.
   - Data first, decoration second.
   - Do not add chart libraries or map layers.
3. **TypeScript Discipline:**
   - Maintain 100% strict type safety.
   - Avoid `any` types.
   - Ensure `npm run lint` and `npm run typecheck` pass with 0 errors.

---

## 3. Verification Commands
Before submitting any changes, you must run and pass:
```bash
npm run lint
npm run typecheck
npm run build
npx tsx scripts/smoke-test.ts
```
