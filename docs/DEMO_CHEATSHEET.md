# JanSanket — 60-Second Demo & Submission Cheatsheet

## 1. 60-Second Live Demonstration Script

| Time | Screen | Action | What to Say |
| :--- | :--- | :--- | :--- |
| **00:00–00:08** | `/dashboard` | Open Dashboard. Hover over the 3 KPI cards. | *"JanSanket turns scattered citizen development requests into district-level planning signals."* Point out 52+ seeded requests across 8 districts and 14 hotspots. |
| **00:08–00:20** | `/submit` | Click **"Submit Request"** in the top navigation. Click the **"English (Hero)"** or **"Kannada"** quick-fill button. | *"Citizens describe problems in their own everyday words and language without needing administrative jargon."* |
| **00:20–00:32** | `/submit` | Click **"Analyze Request"**. Wait for the AI Extraction Preview card. | *"Gemini 3.8 Flash converts unstructured speech/text into structured planning evidence: language, district, category, need, and severity."* |
| **00:32–00:42** | `/submit` | Click **"Confirm & Submit Request"**. Show the generated UUID. Click **"View planning signal"**. | *"The request is validated server-side, assigned an auditable UUID, and persisted into the planning store."* |
| **00:42–00:55** | `/dashboard` | Point to the updated #1 Hotspot: **Ramanagara Roads**. Click the row to highlight the **"Hotspot Evidence Breakdown"**. | *"Notice how the demand signal immediately updated. Gemini never decides public spending—pure deterministic application logic computes the planning score across demand intensity, infrastructure deficit, and unaddressed coverage."* |
| **00:55–01:00** | `/dashboard` | Point to the mathematical formula walkthrough. | *"This is not another grievance box. It is the transparent planning intelligence layer that turns citizen demand into comparable infrastructure evidence."* **Stop.** |

---

## 2. Prepared Demo Assets (One-Click / Copy-Paste Ready)

### Hero Request (English)
```text
In Ramanagara, the road connecting our village to the main highway is washed out every monsoon and ambulances cannot enter.
```
- **State Hint:** `Karnataka`
- **District Hint:** `Ramanagara`
- **Expected Category:** `roads`
- **Expected Severity:** `high`

### Multilingual Proof 1 (Kannada)
```text
ಮಳೆ ಬಂದಾಗ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ, ರಾಮನಗರ ಜಿಲ್ಲೆಯ ಶಾಲೆಗೆ ಹೋಗಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ.
```
- **State Hint:** `Karnataka`
- **District Hint:** `Ramanagara`
- **Expected Category:** `roads`

### Multilingual Proof 2 (Hindi)
```text
सड़क की हालत बारिश में बहुत खराब हो जाती है, रामनगर जिले में हमारे गांव तक स्कूल बस नहीं आ पाती।
```
- **State Hint:** `Karnataka`
- **District Hint:** `Ramanagara`
- **Expected Category:** `roads`

### Multilingual Proof 3 (Tamil)
```text
தருமபுரி மாவட்டத்தில் எங்கள் கிராமத்தில் குடிநீர் இணைப்பு பழுதடைந்துள்ளது, குடிநீர் விநியோகம் இல்லை.
```
- **State Hint:** `Tamil Nadu`
- **District Hint:** `Dharmapuri`
- **Expected Category:** `water`

---

## 3. Fallback Hierarchy (Guaranteed Demo Safety)

If the live Gemini API is rate-limited (429) or unavailable:
1. **Zero Traps:** The server automatically invokes `getPreparedFallback()`.
2. **Instant Population:** Pre-classified category and canonical pilot district populate the extraction card with an informative banner:
   > *"AI analysis is unavailable right now. Prepared fallback fields have been loaded so you can review and submit without interruption."*
3. **Manual Adjust:** You can adjust the dropdowns and click **"Confirm & Submit Request"** seamlessly.

---

## 4. Key Questions & Judge Defense

### Q1: Why not just use existing grievance portals (CPGRAMS, 1905, etc.)?
> *"Grievance portals are ticket-resolution systems for individual complaints ('fix my streetlight'). JanSanket is a macro-planning intelligence layer that aggregates recurring community needs into objective, comparable infrastructure evidence for district budget allocation."*

### Q2: What is the exact role of Gemini vs. Application Logic?
> *"Gemini is strictly responsible for unstructured language understanding $\rightarrow$ structured field extraction. Pure deterministic TypeScript code computes the priority score ($0.40 \times \text{Demand} + 0.30 \times \text{Gap} + 0.15 \times \text{Impact} + 0.15 \times \text{Unaddressed Gap}$). Gemini never touches budgets, scoring, or project approvals."*

### Q3: Why is voice optional or cut?
> *"Voice was tested in TASK-003. While Gemini handles audio natively, mobile browser microphone permissions, codec transcoding, and network latency create demo hazards. Text is the guaranteed, barrier-free path with 1-click multilingual support."*

### Q4: How is privacy handled?
> *"Zero Aadhaar numbers, phone numbers, personal names, or exact home addresses are stored. All data is aggregated to district/category level."*

---

## 5. Deployment Environment Configuration

### Vercel Environment Variables
| Variable | Value | Scope |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Server Only |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Server Only |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Server Only |
| `DEMO_MODE` | `false` (or `true` if Supabase offline) | Server & Client |

---

## 6. Verification Commands
```bash
# Typecheck
npm run typecheck

# Production Build
npm run build

# End-to-end smoke test
npx tsx scripts/smoke-test.ts
```
