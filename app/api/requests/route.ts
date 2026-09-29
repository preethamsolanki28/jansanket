import { NextRequest, NextResponse } from "next/server";
import { normalizeCitizenRequest } from "@/lib/ai";
import { validateCitizenRequest, isMeaningfulRequest } from "@/lib/validation";
import { persistCitizenRequest } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "analyze", rawText, stateHint, districtHint, requestData, source } = body;

    // 1. Analyze Action: Normalize unstructured citizen request via Google Gemini (gemini-3.5-flash-lite)
    if (action === "analyze") {
      const meaning = isMeaningfulRequest(rawText);
      if (!meaning.isValid) {
        return NextResponse.json(
          {
            success: false,
            isInvalid: true,
            error: meaning.reason || "Please describe a real infrastructure or public-service problem."
          },
          { status: 400 }
        );
      }

      const extraction = await normalizeCitizenRequest(rawText.trim(), stateHint, districtHint);

      if (!extraction.isValidRequest) {
        return NextResponse.json(
          {
            success: false,
            isInvalid: true,
            error: extraction.rejectionReason || "Please describe a real infrastructure or public-service problem."
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        extraction
      });
    }

    // 2. Submit Action: Validate and Persist
    if (action === "submit") {
      const dataToValidate = requestData || body;

      // Ensure raw_text is populated
      if (!dataToValidate.raw_text && rawText) {
        dataToValidate.raw_text = rawText;
      }
      if (!dataToValidate.source && source) {
        dataToValidate.source = source;
      }

      // Strict schema, semantic & coverage validation
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

      // Persist validated request
      try {
        const { request: savedRecord, provider } = await persistCitizenRequest(validation.validated);

        return NextResponse.json({
          success: true,
          request: savedRecord,
          provider
        });
      } catch (dbErr: unknown) {
        const dbMsg = dbErr instanceof Error ? dbErr.message : "Database write error";
        console.error("Durable persistence failed:", dbMsg);
        return NextResponse.json(
          {
            error: "Durable database persistence failed. Your request could not be saved to Supabase.",
            details: [dbMsg]
          },
          { status: 503 }
        );
      }
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
