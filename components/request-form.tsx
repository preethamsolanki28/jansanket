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
  SUPPORTED_STATES_AND_DISTRICTS,
  ALLOWED_CATEGORIES,
  ALLOWED_SEVERITIES,
  InfrastructureCategory,
  Severity,
} from "@/lib/validation";
import { GeminiExtractionResult } from "@/lib/gemini";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

const TRY_AN_EXAMPLE_SAMPLES = [
  {
    lang: "Kannada",
    label: "ಕನ್ನಡ (Roads - Ramanagara)",
    text: "ಮಳೆ ಬಂದಾಗ ನಮ್ಮ ಗ್ರಾಮದ ರಸ್ತೆ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ, ರಾಮನಗರ ಜಿಲ್ಲೆಯ ಶಾಲೆಗೆ ಹೋಗಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ.",
    state: "Karnataka",
    district: "Ramanagara",
    category: "roads" as const,
  },
  {
    lang: "Hindi",
    label: "हिन्दी (Water - Bahraich)",
    text: "बहराइच जिले के हमारे गांव में पीने के पानी की भारी किल्लत है और सरकारी हैंडपंप महीनों से खराब पड़े हैं।",
    state: "Uttar Pradesh",
    district: "Bahraich",
    category: "water" as const,
  },
  {
    lang: "Tamil",
    label: "தமிழ் (Healthcare - Dharmapuri)",
    text: "தருமபுரி மாவட்டத்தில் எங்கள் கிராம ஆரம்ப சுகாதார நிலையத்தில் மருத்துவர் மற்றும் அடிப்படை மருந்துகள் இல்லை.",
    state: "Tamil Nadu",
    district: "Dharmapuri",
    category: "healthcare" as const,
  },
  {
    lang: "English",
    label: "English (Sanitation - Varanasi)",
    text: "In Varanasi rural block, the open drains in our village are overflowing and creating severe public health risks.",
    state: "Uttar Pradesh",
    district: "Varanasi",
    category: "sanitation" as const,
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
  const [customLocationMode, setCustomLocationMode] = useState(false);
  const [activeExampleLabel, setActiveExampleLabel] = useState<string | null>(null);

  // Loading & error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Preview & manual correction state
  const [extraction, setExtraction] = useState<GeminiExtractionResult | null>(null);
  const [editableCategory, setEditableCategory] = useState<InfrastructureCategory>("roads");
  const [editableState, setEditableState] = useState("");
  const [editableDistrict, setEditableDistrict] = useState("");
  const [editableNeedSummary, setEditableNeedSummary] = useState("");
  const [editableSeverity, setEditableSeverity] = useState<Severity>("medium");

  // Submitted success state
  const [submittedResult, setSubmittedResult] = useState<SubmittedRequest | null>(null);

  const applyExample = (sample: (typeof TRY_AN_EXAMPLE_SAMPLES)[number]) => {
    setRawText(sample.text);
    setStateHint(sample.state);
    setDistrictHint(sample.district);
    setCustomLocationMode(false);
    setActiveExampleLabel(sample.label);
    setAnalysisError(null);
    setExtraction(null);
  };

  const handleClearExample = () => {
    setRawText("");
    setStateHint("");
    setDistrictHint("");
    setActiveExampleLabel(null);
    setExtraction(null);
    setAnalysisError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || rawText.trim().length < 5) {
      setAnalysisError("Please describe a real infrastructure or public-service problem (at least 5 characters).");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setSubmissionError(null);
    setExtraction(null);

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
      if (!res.ok || data.isInvalid) {
        throw new Error(data.error || "Please describe a real infrastructure or public-service problem.");
      }

      const ext: GeminiExtractionResult = data.extraction;

      if (!ext.isValidRequest) {
        throw new Error(ext.rejectionReason || "Please describe a real infrastructure or public-service problem.");
      }

      setExtraction(ext);
      setEditableCategory(ext.category || "roads");
      setEditableNeedSummary(ext.need_summary || "");
      setEditableSeverity(ext.severity || "medium");

      // Strict district handling: NEVER default to Ramanagara
      if (ext.isSupportedDistrict && ext.district) {
        setEditableDistrict(ext.district);
        setEditableState(ext.state || "");
      } else {
        // District is outside coverage or missing -> require explicit selection
        setEditableDistrict("");
        setEditableState(ext.state || "");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setAnalysisError(msg);
      setExtraction(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!editableDistrict) {
      setSubmissionError("This district is outside the current demo coverage. Please select a supported district.");
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
          source: extraction?.source || (extraction?.isFallback ? "manual_fallback" : "text"),
          rawText,
          requestData: {
            raw_text: rawText,
            language_code: extraction?.language || "en",
            state: editableState,
            district: editableDistrict,
            category: editableCategory,
            need_summary: editableNeedSummary,
            severity: editableSeverity,
            ai_confidence: extraction?.confidence ?? 0.0,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const detailMsg = Array.isArray(data.details) ? data.details.join(" ") : data.error;
        throw new Error(detailMsg || "Failed to save citizen request.");
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
    setActiveExampleLabel(null);
    setExtraction(null);
    setSubmittedResult(null);
    setAnalysisError(null);
    setSubmissionError(null);
    setCustomLocationMode(false);
  };

  // State 3: Submitted Confirmation
  if (submittedResult) {
    return (
      <Card className="bg-white border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border bg-emerald-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Request Recorded Successfully
            </span>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
              ID: {submittedResult.id.slice(0, 8)}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-foreground mt-2">
            Citizen Demand Signal Queued
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Request recorded into planning intelligence. District demand signals recalculate dynamically.
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
            <span className="font-semibold text-muted-foreground block">What We Understood (English Summary):</span>
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
              <span>View planning signals</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
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
              8 Pilot Districts Covered
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Enter a local infrastructure need in English, Hindi, Kannada, or Tamil. Gemini translates and structures it for district planning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Try an Example Section (Clearly distinct from real submission) */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Try an example (Demo content):
              </span>
              {activeExampleLabel && (
                <button
                  type="button"
                  onClick={handleClearExample}
                  className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Clear example
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {TRY_AN_EXAMPLE_SAMPLES.map((sample) => (
                <button
                  key={sample.lang}
                  type="button"
                  onClick={() => applyExample(sample)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors font-medium cursor-pointer ${
                    activeExampleLabel === sample.label
                      ? "bg-blue-100 border-blue-400 text-blue-900"
                      : "border-border bg-white hover:bg-slate-100 text-foreground"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
            {activeExampleLabel && (
              <p className="text-[11px] text-blue-800 pt-1">
                Demo example loaded: <strong>{activeExampleLabel}</strong>. Click <em>Analyze Request</em> to review structured extraction before submitting.
              </p>
            )}
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="rawText"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                >
                  Problem Description / Citizen Need <span className="text-destructive">*</span>
                </label>
                <span className="text-xs text-muted-foreground">{rawText.length} characters</span>
              </div>
              <Textarea
                id="rawText"
                rows={4}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (activeExampleLabel) setActiveExampleLabel(null);
                }}
                placeholder="e.g. In Ramanagara, the road connecting our village to the main highway is washed out every monsoon..."
                className="bg-white border-border"
                disabled={isAnalyzing}
              />
            </div>

            {/* Location Selectors: Supported 8 districts vs Custom/Outside */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Location (Optional Context Hint)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomLocationMode(!customLocationMode);
                    setStateHint("");
                    setDistrictHint("");
                  }}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  {customLocationMode ? "← Select from 8 supported pilot districts" : "Test an outside / other district"}
                </button>
              </div>

              {!customLocationMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="stateHintSelect" className="text-xs font-medium text-muted-foreground block">
                      Pilot State
                    </label>
                    <select
                      id="stateHintSelect"
                      value={stateHint}
                      onChange={(e) => {
                        setStateHint(e.target.value);
                        setDistrictHint("");
                      }}
                      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={isAnalyzing}
                    >
                      <option value="">Auto-detect from request text</option>
                      {Object.keys(SUPPORTED_STATES_AND_DISTRICTS).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="districtHintSelect" className="text-xs font-medium text-muted-foreground block">
                      Pilot District
                    </label>
                    <select
                      id="districtHintSelect"
                      value={districtHint}
                      onChange={(e) => {
                        const dist = e.target.value;
                        setDistrictHint(dist);
                        const match = ALL_SUPPORTED_DISTRICTS.find((d) => d.district === dist);
                        if (match) setStateHint(match.state);
                      }}
                      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={isAnalyzing}
                    >
                      <option value="">Auto-detect from request text</option>
                      {(stateHint && SUPPORTED_STATES_AND_DISTRICTS[stateHint]
                        ? SUPPORTED_STATES_AND_DISTRICTS[stateHint].map((d) => ({ state: stateHint, district: d }))
                        : ALL_SUPPORTED_DISTRICTS
                      ).map((item) => (
                        <option key={item.district} value={item.district}>
                          {item.district} ({item.state})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-amber-50/50 border border-amber-200 rounded-md">
                  <div className="space-y-1.5">
                    <label htmlFor="customState" className="text-xs font-medium text-amber-900 block">
                      Custom State (e.g. Goa)
                    </label>
                    <input
                      id="customState"
                      type="text"
                      value={stateHint}
                      onChange={(e) => setStateHint(e.target.value)}
                      placeholder="e.g. Goa"
                      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="customDistrict" className="text-xs font-medium text-amber-900 block">
                      Custom District (e.g. Anjuna)
                    </label>
                    <input
                      id="customDistrict"
                      type="text"
                      value={districtHint}
                      onChange={(e) => setDistrictHint(e.target.value)}
                      placeholder="e.g. Anjuna"
                      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={isAnalyzing}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error display for invalid/gibberish input */}
            {analysisError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <AlertTitle className="text-xs font-semibold">Request Rejected</AlertTitle>
                  <AlertDescription className="text-xs">{analysisError}</AlertDescription>
                </div>
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
                  onClick={handleClearExample}
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
        <Card className={`bg-white shadow-sm animate-in fade-in duration-300 ${
          extraction.source === "gemini" ? "border-primary/40" : "border-amber-300"
        }`}>
          <CardHeader className={`pb-3 border-b border-border ${
            extraction.source === "gemini" ? "bg-blue-50/40" : "bg-amber-50/40"
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  extraction.source === "gemini" ? "text-primary" : "text-amber-800"
                }`}>
                  {extraction.source === "gemini" ? "AI Extraction Preview" : "Manual Fallback Review"}
                </span>
                <Badge
                  variant="outline"
                  className={
                    extraction.source === "gemini"
                      ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                      : "bg-amber-100 text-amber-800 border-amber-300 text-xs font-medium"
                  }
                >
                  {extraction.source === "gemini" ? "Analyzed by Gemini 3.8 Flash" : "Manual Fallback Mode"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase bg-white">
                  Language: {extraction.language}
                </Badge>
                {/* AI Confidence is shown ONLY for genuine successful Gemini extractions */}
                {extraction.source === "gemini" && extraction.confidence !== null ? (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      extraction.confidence >= 0.85
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-amber-50 text-amber-700 border-amber-300"
                    }`}
                  >
                    AI Confidence: {Math.round(extraction.confidence * 100)}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-slate-100 text-slate-600 border-slate-300">
                    AI Confidence: Not Available
                  </Badge>
                )}
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
            {/* BUG 5: Explanatory line explaining the purpose of Gemini */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md text-xs text-blue-900 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-950">
                  How JanSanket uses Gemini:
                </p>
                <p className="text-blue-800 leading-snug">
                  Gemini converts the citizen&apos;s message into structured information so requests can be grouped and compared across districts.
                </p>
                <div className="pt-0.5 flex items-center gap-1.5 text-[11px] text-blue-700 font-medium flex-wrap">
                  <span>Citizen Language</span>
                  <span>&rarr;</span>
                  <span>Gemini structures evidence</span>
                  <span>&rarr;</span>
                  <span>Application aggregates requests</span>
                  <span>&rarr;</span>
                  <span>Planning signal on dashboard</span>
                </div>
              </div>
            </div>

            {/* Fallback Banner if Gemini failed (e.g. 429 quota exhaustion) */}
            {extraction.isFallback && (
              <Alert className="bg-amber-50/90 border-amber-300 text-amber-900 py-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                <div>
                  <AlertTitle className="text-xs font-semibold text-amber-950">AI Analysis Temporarily Unavailable</AlertTitle>
                  <AlertDescription className="text-xs leading-relaxed text-amber-900 mt-0.5">
                    {extraction.fallbackReason || "AI analysis is temporarily unavailable (API quota limit reached). You can continue using the manual fallback. Please review and confirm the category and district below."}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* BUG 2: Unsupported District Alert (e.g. Goa / Anjuna) */}
            {!extraction.isSupportedDistrict && (
              <Alert className="bg-amber-50 border-amber-300 text-amber-900 py-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                <div>
                  <AlertTitle className="text-xs font-semibold text-amber-950">
                    District Outside Demo Coverage
                  </AlertTitle>
                  <AlertDescription className="text-xs leading-relaxed text-amber-900 mt-0.5">
                    {extraction.unsupportedDistrictName ? (
                      <>
                        The location <strong>&quot;{extraction.unsupportedDistrictName}&quot;</strong> is outside the current demo coverage (8 pilot districts).
                        Please select a supported district from the dropdown below to test planning signals.
                      </>
                    ) : (
                      <>
                        No supported pilot district was detected in your request. Please select a supported district below to proceed.
                      </>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Multilingual Transformation Display (BUG 4) */}
            <div className="grid grid-cols-1 gap-3 p-3 rounded-lg bg-slate-50 border border-border text-xs">
              <div>
                <span className="font-semibold text-muted-foreground block">
                  Original Citizen Input ({extraction.language.toUpperCase()}):
                </span>
                <p className="mt-1 p-2 bg-white rounded border border-border text-foreground font-mono text-[11px] leading-relaxed">
                  {extraction.originalText}
                </p>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block">
                  What We Understood (English Normalized Need):
                </label>
                <input
                  type="text"
                  value={editableNeedSummary}
                  onChange={(e) => setEditableNeedSummary(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Editable Form Fields for Review */}
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

              {/* Supported District Select (Strictly 8 Supported Districts) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Target District <span className="text-destructive">*</span>
                  {!editableDistrict && (
                    <span className="text-amber-700 font-normal ml-1">(Required: select a supported district)</span>
                  )}
                </label>
                <select
                  value={editableDistrict}
                  onChange={(e) => {
                    const sel = ALL_SUPPORTED_DISTRICTS.find((d) => d.district === e.target.value);
                    if (sel) {
                      setEditableDistrict(sel.district);
                      setEditableState(sel.state);
                      setSubmissionError(null);
                    } else {
                      setEditableDistrict("");
                    }
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    !editableDistrict ? "border-amber-400 bg-amber-50/30" : "border-input bg-white"
                  }`}
                >
                  <option value="">-- Please select a supported district --</option>
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
                  value={editableState || "(Select a district above)"}
                  readOnly
                  className="w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {submissionError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs">{submissionError}</AlertDescription>
              </Alert>
            )}

            {/* Confirmation actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting || !editableDistrict}
                className="w-full sm:w-auto bg-primary hover:bg-[#1E40AF] text-white font-medium"
              >
                {isSubmitting ? "Submitting Request…" : "Confirm & Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExtraction(null)}
                className="w-full sm:w-auto"
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
