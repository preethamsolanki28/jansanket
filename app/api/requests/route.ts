import { NextRequest, NextResponse } from "next/server";
import { normalizeRequestWithGemini } from "@/lib/gemini";
import { validateCitizenRequest } from "@/lib/validation";
import { persistCitizenRequest } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "analyze", rawText, stateHint, districtHint, requestData, source } = body;

    // 1. Analyze Action: Normalize unstructured citizen request via Gemini 3.8 Flash (TASK-030)
    if (action === "analyze") {
      if (!rawText || typeof rawText !== "string" || rawText.trim().length < 5) {
        return NextResponse.json(
          { error: "Please enter a development request with at least 5 characters." },
          { status: 400 }
        );
      }

      const extraction = await normalizeRequestWithGemini(rawText.trim(), stateHint, districtHint);

      return NextResponse.json({
        success: true,
        extraction
      });
    }

    // 2. Submit Action: Validate (TASK-031) and Persist to Supabase / active store (TASK-032)
    if (action === "submit") {
      const dataToValidate = requestData || body;

      // Ensure raw_text is populated
      if (!dataToValidate.raw_text && rawText) {
        dataToValidate.raw_text = rawText;
      }
      if (!dataToValidate.source && source) {
        dataToValidate.source = source;
      }

      // TASK-031: Strict schema & semantic validation
      // Invalid model output cannot silently reach the database
      const validation = validateCitizenRequest(dataToValidate);

      if (!validation.isValid || !validation.validated) {
        return NextResponse.json(
          {
            error: "Validation failed: invalid request data cannot be stored.",
            details: validation.errors
          },
          { status: 422 }
        );
      }

      // TASK-032: Persist validated request
      // Browser never writes directly to database; server route owns persistence
      const { request: savedRecord, provider } = await persistCitizenRequest(validation.validated);

      return NextResponse.json({
        success: true,
        request: savedRecord,
        provider
      });
    }

    return NextResponse.json(
      { error: `Unsupported action "${action}". Allowed: "analyze", "submit".` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    console.error("Error in /api/requests route:", errorMsg);
    return NextResponse.json(
      { error: "A server error occurred while processing the citizen request." },
      { status: 500 }
    );
  }
}
