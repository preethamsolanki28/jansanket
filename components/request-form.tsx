"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ALL_SUPPORTED_DISTRICTS,
  ALLOWED_CATEGORIES,
  ALLOWED_SEVERITIES,
  InfrastructureCategory,
  Severity,
} from "@/lib/validation";
import { GeminiExtractionResult } from "@/lib/gemini";

const PREPARED_MULTILINGUAL_SAMPLES = [
  {
    lang: "Hindi",
    label: "हिन्दी",
    text: "सड़क की हालत बारिश में बहुत खराब हो जाती है, रामनगर जिले में हमारे गांव तक स्कूल बस नहीं आ पाती।",
    state: "Karnataka",
    district: "Ramanagara",
  },
  {
    lang: "Kannada",
    label: "ಕನ್ನಡ",
    text: "ಮಳೆ ಬಂದಾಗ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ, ರಾಮನಗರ ಜಿಲ್ಲೆಯ ಶಾಲೆಗೆ ಹೋಗಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ.",
    state: "Karnataka",
    district: "Ramanagara",
  },
  {
    lang: "Tamil",
    label: "தமிழ்",
    text: "தருமபுரி மாவட்டத்தில் எங்கள் கிராமத்தில் குடிநீர் இணைப்பு பழுதடைந்துள்ளது, குடிநீர் விநியோகம் இல்லை.",
    state: "Tamil Nadu",
    district: "Dharmapuri",
  },
  {
    lang: "English",
    label: "English (Hero)",
    text: "In Ramanagara, the road connecting our village to the main highway is washed out every monsoon and ambulances cannot enter.",
    state: "Karnataka",
    district: "Ramanagara",
  },
];

interface SubmittedRequest {
  id: string;
  source: string;
  raw_text: string;
  language_code: string;
  state: string;
  district: string;
  category: string;
  need_summary: string;
  severity: string;
  ai_confidence: number;
  created_at: string;
}

export function RequestForm() {
  // Input form state
  const [rawText, setRawText] = useState("");
  const [stateHint, setStateHint] = useState("");
  const [districtHint, setDistrictHint] = useState("");

  // Loading & error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Preview & manual correction state
  const [extraction, setExtraction] = useState<GeminiExtractionResult | null>(null);
  const [editableCategory, setEditableCategory] = useState<InfrastructureCategory>("roads");
  const [editableState, setEditableState] = useState("Karnataka");
  const [editableDistrict, setEditableDistrict] = useState("Ramanagara");
  const [editableNeedSummary, setEditableNeedSummary] = useState("");
  const [editableSeverity, setEditableSeverity] = useState<Severity>("high");

  // Submitted success state
  const [submittedResult, setSubmittedResult] = useState<SubmittedRequest | null>(null);

  const applySample = (sample: (typeof PREPARED_MULTILINGUAL_SAMPLES)[number]) => {
    setRawText(sample.text);
    setStateHint(sample.state);
    setDistrictHint(sample.district);
    setAnalysisError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || rawText.trim().length < 5) {
      setAnalysisError("Please enter a development request with at least 5 characters.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setSubmissionError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          rawText: rawText.trim(),
          stateHint: stateHint.trim() || undefined,
          districtHint: districtHint.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze request.");
      }

      const ext: GeminiExtractionResult = data.extraction;
      setExtraction(ext);
      setEditableCategory(ext.category);
      setEditableState(ext.state || stateHint || "Karnataka");
      setEditableDistrict(ext.district || districtHint || "Ramanagara");
      setEditableNeedSummary(ext.need_summary);
      setEditableSeverity(ext.severity);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!editableDistrict) {
      setSubmissionError("We could not verify this district. Please select a supported district.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          source: extraction?.isFallback ? "manual_fallback" : "text",
          rawText,
          requestData: {
            raw_text: rawText,
            language_code: extraction?.language || "en",
            state: editableState,
            district: editableDistrict,
            category: editableCategory,
            need_summary: editableNeedSummary,
            severity: editableSeverity,
            ai_confidence: extraction?.confidence || 0.9,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save citizen request.");
      }

      setSubmittedResult(data.request);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setSubmissionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRawText("");
    setStateHint("");
    setDistrictHint("");
    setExtraction(null);
    setSubmittedResult(null);
    setAnalysisError(null);
    setSubmissionError(null);
  };

  // State 3: Submitted Confirmation
  if (submittedResult) {
    return (
      <Card className="bg-white border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border bg-emerald-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Request Submitted Successfully
            </span>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
              ID: {submittedResult.id.slice(0, 8)}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-foreground mt-2">
            Citizen Demand Signal Recorded
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Normalized request is queued into district-level planning intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-md border border-border text-xs">
            <div>
              <span className="text-muted-foreground block">District:</span>
              <span className="font-semibold text-foreground">{submittedResult.district}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">State:</span>
              <span className="font-semibold text-foreground">{submittedResult.state}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Category:</span>
              <span className="font-semibold text-foreground capitalize">{submittedResult.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Severity:</span>
              <span className="font-semibold text-foreground capitalize">{submittedResult.severity}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="font-semibold text-muted-foreground block">Normalized Need:</span>
            <p className="p-3 bg-white border border-border rounded-md text-foreground">
              {submittedResult.need_summary}
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard"
              className={buttonVariants({
                className: "w-full sm:w-auto bg-primary hover:bg-[#1E40AF] text-white font-medium",
              })}
            >
              View planning signal
            </Link>
            <Button
              variant="outline"
              onClick={resetForm}
              className="w-full sm:w-auto"
            >
              Submit another request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* State 1: Input Form */}
      <Card className="bg-white border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              Citizen Development Request
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              Guaranteed Text Path
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Type your request in English, Hindi, Kannada, or Tamil. You may also test with sample requests below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Quick sample buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground block">
              Quick Multilingual Test Examples:
            </span>
            <div className="flex flex-wrap gap-2">
              {PREPARED_MULTILINGUAL_SAMPLES.map((sample) => (
                <button
                  key={sample.lang}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="text-xs px-2.5 py-1 rounded-md border border-border bg-slate-50 hover:bg-slate-100 text-foreground transition-colors font-medium cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="rawText"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                >
                  Need Description / Feedback <span className="text-destructive">*</span>
                </label>
                <span className="text-xs text-muted-foreground">{rawText.length} characters</span>
              </div>
              <Textarea
                id="rawText"
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="e.g. In Ramanagara, the road connecting our village to the main highway is washed out every monsoon..."
                className="bg-white border-border"
                disabled={isAnalyzing}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="stateHint"
                  className="text-xs font-semibold text-muted-foreground block"
                >
                  State (Optional hint)
                </label>
                <input
                  id="stateHint"
                  type="text"
                  value={stateHint}
                  onChange={(e) => setStateHint(e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isAnalyzing}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="districtHint"
                  className="text-xs font-semibold text-muted-foreground block"
                >
                  District (Optional hint)
                </label>
                <input
                  id="districtHint"
                  type="text"
                  value={districtHint}
                  onChange={(e) => setDistrictHint(e.target.value)}
                  placeholder="e.g. Ramanagara"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            {analysisError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
                <AlertDescription className="text-xs">{analysisError}</AlertDescription>
              </Alert>
            )}

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="submit"
                disabled={isAnalyzing || rawText.trim().length < 5}
                className="bg-primary hover:bg-[#1E40AF] text-white"
              >
                {isAnalyzing ? "Analyzing with Gemini…" : "Analyze Request"}
              </Button>
              {rawText && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRawText("")}
                  className="text-xs text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* State 2: Extraction Preview & Verification Card */}
      {extraction && (
        <Card className="bg-white border-primary/40 shadow-sm animate-in fade-in duration-300">
          <CardHeader className="pb-3 border-b border-border bg-blue-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                AI Extraction Preview
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase bg-white">
                  Language: {extraction.language}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    extraction.confidence >= 0.9
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}
                >
                  Confidence: {Math.round(extraction.confidence * 100)}%
                </Badge>
              </div>
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-1">
              Verify &amp; Confirm Planning Signals
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Review extracted attributes before persisting into the planning aggregation pipeline.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            {extraction.isFallback && (
              <Alert className="bg-amber-50/70 border-amber-200 text-amber-800 py-2.5">
                <AlertDescription className="text-xs leading-relaxed">
                  {extraction.fallbackReason || "AI analysis is unavailable right now. Continue with the fallback input path."}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Infrastructure Category
                </label>
                <select
                  value={editableCategory}
                  onChange={(e) => setEditableCategory(e.target.value as InfrastructureCategory)}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ALLOWED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Severity Level
                </label>
                <select
                  value={editableSeverity}
                  onChange={(e) => setEditableSeverity(e.target.value as Severity)}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ALLOWED_SEVERITIES.map((sev) => (
                    <option key={sev} value={sev}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Target District (Supported: 8)
                </label>
                <select
                  value={editableDistrict}
                  onChange={(e) => {
                    const sel = ALL_SUPPORTED_DISTRICTS.find((d) => d.district === e.target.value);
                    if (sel) {
                      setEditableDistrict(sel.district);
                      setEditableState(sel.state);
                    }
                  }}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ALL_SUPPORTED_DISTRICTS.map((item) => (
                    <option key={item.district} value={item.district}>
                      {item.district} ({item.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* State (Read-only reference) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  State / Territory
                </label>
                <input
                  type="text"
                  value={editableState}
                  readOnly
                  className="w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {/* Need Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">
                Normalized Need Summary (English)
              </label>
              <input
                type="text"
                value={editableNeedSummary}
                onChange={(e) => setEditableNeedSummary(e.target.value)}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {submissionError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertDescription className="text-xs">{submissionError}</AlertDescription>
              </Alert>
            )}

            {/* Confirmation actions */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="bg-primary hover:bg-[#1E40AF] text-white font-medium"
              >
                {isSubmitting ? "Submitting Request…" : "Confirm & Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExtraction(null)}
              >
                Edit Raw Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
