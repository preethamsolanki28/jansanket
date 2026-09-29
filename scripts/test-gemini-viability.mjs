/**
 * TASK-003: Gemini Viability Test
 * Tests gemini-3.8-flash structured extraction for multilingual citizen development requests.
 * Uses native fetch with zero extra dependencies.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = `You are an AI assistant for JanSanket, an Indian Digital Public Good infrastructure planning system.
Your task is to analyze unstructured citizen development requests and extract structured planning evidence.
Rules:
1. Extract rather than invent.
2. Normalize Indian state and district names (e.g. "रामनगर" -> "Ramanagara", "தருமபுரி" -> "Dharmapuri").
3. If district or state is not mentioned or uncertain, return null for those fields.
4. Categorize into exactly one of: "roads", "water", "sanitation", "healthcare", "education", "power", "transport", "other".
5. Produce a concise need summary in English.
6. Rate severity as "low", "medium", or "high".
7. Provide an extraction confidence score between 0.0 and 1.0.
8. Identify language code (e.g. "en", "hi", "kn", "ta").
9. Never decide public spending, budget, or project approval.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    language: {
      type: "STRING",
      description: "ISO language code, e.g. en, hi, kn, ta"
    },
    state: {
      type: "STRING",
      nullable: true,
      description: "Normalized Indian state name, or null if unmentioned/unknown"
    },
    district: {
      type: "STRING",
      nullable: true,
      description: "Normalized Indian district name, or null if unmentioned/unknown"
    },
    category: {
      type: "STRING",
      enum: ["roads", "water", "sanitation", "healthcare", "education", "power", "transport", "other"],
      description: "Standard infrastructure category"
    },
    need_summary: {
      type: "STRING",
      description: "Concise one-sentence summary of the development need in English"
    },
    severity: {
      type: "STRING",
      enum: ["low", "medium", "high"],
      description: "Severity level of the problem"
    },
    confidence: {
      type: "NUMBER",
      description: "Model confidence in extraction from 0.0 to 1.0"
    }
  },
  required: ["language", "category", "need_summary", "severity", "confidence"]
};

const TEST_CASES = [
  {
    id: "TC-EN-01",
    languageName: "English",
    expectedLang: "en",
    expectedCategory: "roads",
    expectedDistrict: "Ramanagara",
    text: "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon and ambulances cannot enter."
  },
  {
    id: "TC-HI-02",
    languageName: "Hindi",
    expectedLang: "hi",
    expectedCategory: "roads",
    expectedDistrict: "Ramanagara",
    text: "सड़क की हालत बारिश में बहुत खराब हो जाती है, रामनगर जिले में हमारे गांव तक स्कूल बस और एंबुलेंस नहीं पहुंच पाती।"
  },
  {
    id: "TC-KN-03",
    languageName: "Kannada",
    expectedLang: "kn",
    expectedCategory: "roads",
    expectedDistrict: "Ramanagara",
    text: "ಮಳೆಗಾಲದಲ್ಲಿ ರಾಮನಗರ ಜಿಲ್ಲೆಯ ನಮ್ಮ ಹಳ್ಳಿಯ ಮುಖ್ಯ ರಸ್ತೆ ಹಾಳಾಗಿದ್ದು, ಶಾಲಾ ವಾಹನಗಳು ಮತ್ತು ಆಂಬುಲೆನ್ಸ್ ಬರಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ."
  },
  {
    id: "TC-TA-04",
    languageName: "Tamil",
    expectedLang: "ta",
    expectedCategory: "water",
    expectedDistrict: "Dharmapuri",
    text: "தருமபுரி மாவட்டத்தில் எங்கள் கிராமத்தில் குடிநீர் இணைப்பு பழுதடைந்துள்ளது, கடந்த ஒரு மாதமாக குடிநீர் விநியோகம் இல்லை."
  },
  {
    id: "TC-EDGE-05",
    languageName: "English (Unstated Location)",
    expectedLang: "en",
    expectedCategory: "power",
    expectedDistrict: null,
    text: "Streetlights and local power transformers have blown up causing complete power blackouts for the last 5 days in our area."
  }
];

const VALID_CATEGORIES = new Set([
  "roads", "water", "sanitation", "healthcare", "education", "power", "transport", "other"
]);
const VALID_SEVERITIES = new Set(["low", "medium", "high"]);

async function callGemini(text, maxRetries = 4) {
  const payload = {
    contents: [
      {
        parts: [{ text }]
      }
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  };

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const latency = Date.now() - startTime;
      if (!res.ok) {
        const errorText = await res.text();
        if ((res.status === 503 || res.status === 429) && attempt < maxRetries) {
          const waitSec = res.status === 429 ? 15 : 4 * attempt;
          process.stdout.write(`[${res.status} status, waiting ${waitSec}s (${attempt}/${maxRetries})]... `);
          await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("No candidate text returned by Gemini");
      }

      const structured = JSON.parse(rawText);
      return { structured, latency, rawText };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && (err.message.includes("503") || err.message.includes("429"))) {
        await new Promise((resolve) => setTimeout(resolve, 8000 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function validateResult(tc, structured) {
  const issues = [];

  // 1. Language check
  if (!structured.language) {
    issues.push("missing language");
  } else if (!structured.language.toLowerCase().startsWith(tc.expectedLang)) {
    issues.push(`language mismatch (got "${structured.language}", expected prefix "${tc.expectedLang}")`);
  }

  // 2. Category check
  if (!structured.category || !VALID_CATEGORIES.has(structured.category.toLowerCase())) {
    issues.push(`invalid category "${structured.category}"`);
  } else if (structured.category.toLowerCase() !== tc.expectedCategory) {
    issues.push(`category mismatch (got "${structured.category}", expected "${tc.expectedCategory}")`);
  }

  // 3. District check
  if (tc.expectedDistrict) {
    if (!structured.district || !structured.district.toLowerCase().includes(tc.expectedDistrict.toLowerCase())) {
      issues.push(`district mismatch (got "${structured.district}", expected "${tc.expectedDistrict}")`);
    }
  } else {
    if (structured.district && structured.district !== "null" && structured.district.trim() !== "") {
      issues.push(`expected null district for unstated location, got "${structured.district}"`);
    }
  }

  // 4. Need summary check
  if (!structured.need_summary || structured.need_summary.trim().length < 5) {
    issues.push("missing or empty need_summary");
  }

  // 5. Severity check
  if (!structured.severity || !VALID_SEVERITIES.has(structured.severity.toLowerCase())) {
    issues.push(`invalid severity "${structured.severity}"`);
  }

  // 6. Confidence check
  if (typeof structured.confidence !== "number" || structured.confidence < 0 || structured.confidence > 1) {
    issues.push(`invalid confidence value: ${structured.confidence}`);
  }

  return issues;
}

async function runViabilityTest() {
  console.log("==================================================");
  console.log("  TASK-003: Gemini Viability Test");
  console.log(`  Model: ${MODEL}`);
  console.log(`  Endpoint: generativelanguage.googleapis.com`);
  console.log("==================================================\n");

  if (!API_KEY) {
    console.error("ERROR: GEMINI_API_KEY environment variable is not set.");
    console.error("Please add GEMINI_API_KEY to your .env.local file or shell environment.");
    process.exit(1);
  }

  let totalLatency = 0;
  let passedCount = 0;
  const results = [];

  for (const tc of TEST_CASES) {
    process.stdout.write(`Testing [${tc.id}] ${tc.languageName}... `);
    try {
      const { structured, latency } = await callGemini(tc.text);
      totalLatency += latency;
      const issues = validateResult(tc, structured);
      const passed = issues.length === 0;

      if (passed) {
        passedCount++;
        console.log(`PASS (${latency}ms)`);
      } else {
        console.log(`FAIL (${latency}ms) -> ${issues.join("; ")}`);
      }

      results.push({
        id: tc.id,
        language: tc.languageName,
        passed,
        latency,
        issues,
        structured
      });

      // Respect 5 RPM free-tier rate limit
      if (TEST_CASES.indexOf(tc) < TEST_CASES.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 13000));
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      results.push({
        id: tc.id,
        language: tc.languageName,
        passed: false,
        latency: 0,
        issues: [err.message],
        structured: null
      });
    }
  }

  const avgLatency = Math.round(totalLatency / TEST_CASES.length);

  console.log("\n==================================================");
  console.log("  TEST SUMMARY");
  console.log("==================================================");
  console.log(`Total tests: ${TEST_CASES.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${TEST_CASES.length - passedCount}`);
  console.log(`Average Latency: ${avgLatency}ms`);
  console.log("==================================================\n");

  console.log(JSON.stringify({ results, avgLatency, passedCount, total: TEST_CASES.length }, null, 2));

  if (passedCount !== TEST_CASES.length) {
    process.exit(2);
  }
}

runViabilityTest().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
