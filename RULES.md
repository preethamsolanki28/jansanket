# RULES.md — JanSanket Engineering & Contribution Rules

## 1. Core Architectural Non-Negotiables
1. **Responsibility Separation:**
   - **AI Responsibility (Google Gemini gemini-3.5-flash-lite):** Unstructured citizen input $\rightarrow$ structured fields (`language`, `state`, `district`, `category`, `need_summary`, `severity`, `confidence`).
   - **Application Responsibility:** Strict schema validation, deterministic geographic validation (`lib/india-locations.ts`), database persistence, and **deterministic priority calculation**.
   - **Never let AI calculate the priority score, allocate budgets, or approve projects.**
   - **Never spend LLM calls on static geographic validation:** State-district validation must be deterministic.
2. **Citizen Intake vs. Pilot Analytics Separation:**
   - Citizen intake accepts valid submissions from **all 28 Indian States and 8 Union Territories**.
   - Planning analytics and hotspot rankings are restricted strictly to the 8 pilot districts where baseline context exists.
   - Non-pilot requests must be stored faithfully as *"Outside Pilot Coverage"*; **never fabricate context metrics or priority scores for them**.
   - Never default or force district to Ramanagara when district is unspecified; prompt the user.
3. **Citizen Channel vs. AI Provider:**
   - `source` represents the citizen input channel (`text`, `voice`, `manual_fallback`). Never put `"ai"` or provider names in `source`.
   - `provider` tracks the AI provider (`gemini`, `manual_fallback`).
4. **Citizen UI Privacy (No Provider Exposure):**
   - The citizen-facing `/submit` page must NOT display AI provider names (e.g., Gemini, OpenRouter) or model badges. Keep the UI clean, civic, and focused on verifying "What We Understood".
5. **Security & Secrets:**
   - Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client browser.
   - Never prefix server secrets with `NEXT_PUBLIC_`.
   - Never commit `.env`, `.env.local`, API keys, or credentials.
6. **Database Write Path:**
   - Browsers must never write directly to Supabase. Next.js server routes (`app/api/requests/route.ts`) own persistence.
   - All input must be validated server-side via `validateCitizenRequest()` in `lib/validation.ts`. Invalid model output must be rejected with HTTP 422.
7. **Data Integrity & Provenance:**
   - District context is strictly keyed by `state + district + category`.
   - All baseline demonstration metrics must be labeled `demo_synthetic`. Never present synthetic demo values as official government statistics.
   - No PII: Do not collect or store Aadhaar numbers, phone numbers, personal names, or exact home addresses.
8. **Resiliency & Fallbacks:**
   - `DEMO_MODE=true` and unconfigured Supabase mode must gracefully fall back to active memory fixtures without throwing unhandled exceptions.
   - Always preserve `getPreparedFallback()` in `lib/ai.ts` so Gemini quota limits (HTTP 429) or temporary API failures transparently transition to manual fallback without fabricating confidence or location.

---

## 2. Coding & Design Standards
1. **Fixed Tech Stack:**
   - Next.js (App Router, Turbopack)
   - TypeScript (Strict Mode)
   - Tailwind CSS v4 + shadcn/ui primitives
   - AI Integration via server-side REST calls (Google Gemini `gemini-3.5-flash-lite`)
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
