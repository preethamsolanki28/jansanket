"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  RefreshCw,
  Building2,
  MapPin,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { PlanningHotspot } from "@/lib/priority";

interface DashboardData {
  summary: {
    total_requests: number;
    districts: number;
    hotspots: number;
  };
  hotspots: PlanningHotspot[];
  meta: {
    provider: "supabase" | "demo_store";
    is_database_online: boolean;
    updated_at: string;
  };
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotspotKey, setSelectedHotspotKey] = useState<string | null>(null);

  const fetchLatestData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load planning signals (HTTP ${res.status})`);
      }
      const json: DashboardData = await res.json();
      setData(json);
      setSelectedHotspotKey((prev) => {
        if (prev) return prev;
        if (json.hotspots && json.hotspots.length > 0) {
          return `${json.hotspots[0].state}:${json.hotspots[0].district}:${json.hotspots[0].category}`;
        }
        return null;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to dashboard API";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchLatestData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    let isMounted = true;

    fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: DashboardData) => {
        if (!isMounted) return;
        setData(json);
        setLoading(false);
        setSelectedHotspotKey((prev) => {
          if (prev) return prev;
          if (json.hotspots && json.hotspots.length > 0) {
            return `${json.hotspots[0].state}:${json.hotspots[0].district}:${json.hotspots[0].category}`;
          }
          return null;
        });
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Error connecting to dashboard API";
        setError(msg);
        setLoading(false);
      });

    const onFocus = () => {
      fetchLatestData();
    };

    window.addEventListener("focus", onFocus);
    return () => {
      isMounted = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchLatestData]);

  // Selected hotspot for "Why this area is highlighted" deep dive
  const selectedHotspot =
    data?.hotspots.find(
      (h) => `${h.state}:${h.district}:${h.category}` === selectedHotspotKey
    ) || data?.hotspots[0];

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "roads":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "water":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "healthcare":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "power":
        return "bg-yellow-100 text-yellow-900 border-yellow-300";
      case "sanitation":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "education":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getPriorityScoreBadgeClass = (score: number) => {
    if (score >= 70) {
      return "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5] font-bold";
    }
    if (score >= 50) {
      return "bg-[#FEF3C7] text-[#B45309] border-[#FCD34D] font-bold";
    }
    return "bg-slate-100 text-slate-700 border-slate-300 font-semibold";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Citizen Demand Intelligence
            </h1>
            <Badge
              variant="outline"
              className="bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD] text-xs font-semibold"
            >
              demo_synthetic
            </Badge>
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-medium"
            >
              8 Pilot Districts
            </Badge>
            {data?.meta && (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs flex items-center gap-1"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                {data.meta.provider === "supabase" ? "Supabase Postgres" : "Active Demo Store"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated citizen infrastructure demand combined with district infrastructure deficits to compute transparent priority signals.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-0.5">
            Current pilot covers 8 districts across Karnataka, Uttar Pradesh, Rajasthan, and Tamil Nadu. Baseline context metrics use calibrated demo data.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-xs flex items-center gap-1.5 h-9"
            title="Refresh demand signals"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>{isRefreshing ? "Refreshing…" : "Refresh Signals"}</span>
          </Button>
          <Link
            href="/submit"
            className={buttonVariants({
              className: "bg-primary hover:bg-[#1E40AF] text-white h-9 px-3 gap-1.5 flex items-center text-xs font-medium",
            })}
          >
            <span>Submit Request</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice regarding live signals</p>
            <p className="text-xs text-amber-800 mt-0.5">{error}. Serving local cached fixtures.</p>
          </div>
        </div>
      )}

      {/* BUG 7: Plain-Language KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Citizen Requests -> Citizen Demand */}
        <Card className="bg-white border-border shadow-xs hover:border-slate-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Citizen Demand
              </CardDescription>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
              {loading ? "…" : data?.summary.total_requests ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total citizen requests recorded across 4 supported languages
            </p>
          </CardContent>
        </Card>

        {/* Districts Covered -> Districts Monitored */}
        <Card className="bg-white border-border shadow-xs hover:border-slate-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Districts Monitored
              </CardDescription>
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
              {loading ? "…" : data?.summary.districts ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              8 pilot districts across 4 Indian states
            </p>
          </CardContent>
        </Card>

        {/* Active Hotspots -> High-Need Areas */}
        <Card className="bg-white border-border shadow-xs hover:border-slate-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                High-Need Areas
              </CardDescription>
              <TrendingUp className="h-4 w-4 text-rose-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
              {loading ? "…" : data?.summary.hotspots ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              District and sector combinations requiring urgent planning focus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout: Hotspot Table + Why this Area is Highlighted Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hotspot Table */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="bg-white border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Infrastructure Demand Hotspots
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Ranked strictly descending by deterministic priority score. Click any row to inspect breakdown.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200">
                  {data?.hotspots.length ?? 0} Identified
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  Loading planning signals…
                </div>
              ) : !data?.hotspots.length ? (
                <div className="p-8 text-center bg-slate-50/50">
                  <p className="text-sm font-medium text-foreground">No citizen signals yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit the first request to start building the demand signal.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Citizen Demand</TableHead>
                      <TableHead className="text-right">Priority Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.hotspots.map((h, index) => {
                      const key = `${h.state}:${h.district}:${h.category}`;
                      const isSelected = selectedHotspotKey === key;
                      return (
                        <TableRow
                          key={key}
                          onClick={() => setSelectedHotspotKey(key)}
                          className={`${
                            isSelected
                              ? "bg-blue-50/70 border-l-4 border-l-primary font-medium"
                              : "hover:bg-slate-50/60"
                          } transition-colors cursor-pointer`}
                        >
                          <TableCell className="text-center font-bold text-xs text-muted-foreground">
                            #{index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-foreground text-sm leading-tight">
                              {h.district}
                            </div>
                            <div className="text-xs text-muted-foreground">{h.state}</div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getCategoryBadgeClass(
                                h.category
                              )}`}
                            >
                              {h.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground text-sm">
                            {h.request_count} reqs
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${getPriorityScoreBadgeClass(
                                h.priority_score
                              )}`}
                            >
                              {h.priority_score.toFixed(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Why this area is highlighted Detail Panel (BUG 7 Plain Language) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedHotspot ? (
            <Card className="bg-white border-border shadow-xs border-t-4 border-t-primary">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Why This Area Needs Attention
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD] text-[11px]"
                  >
                    demo_synthetic
                  </Badge>
                </div>
                <CardTitle className="text-xl font-extrabold text-foreground mt-1">
                  {selectedHotspot.district}, {selectedHotspot.state}
                </CardTitle>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getCategoryBadgeClass(
                      selectedHotspot.category
                    )}`}
                  >
                    {selectedHotspot.category} Sector
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {selectedHotspot.request_count} Citizen Requests
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-5">
                {/* Recommended Project from Deterministic Mapping */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recommended Project
                  </div>
                  <div className="text-base font-bold text-foreground mt-0.5 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{selectedHotspot.recommended_project}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    Standard public project mapped deterministically from validated citizen sector demand.
                  </p>
                </div>

                {/* 4 Metric Breakdown Indicators (Plain Language) */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Score Components
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Citizen Demand (40%) */}
                    <div className="p-2.5 rounded-md border border-border bg-white shadow-2xs">
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Citizen Demand (40%)
                      </div>
                      <div className="text-lg font-bold text-foreground mt-0.5">
                        {selectedHotspot.demand_score.toFixed(1)}
                        <span className="text-xs text-muted-foreground font-normal"> / 100</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {selectedHotspot.request_count} reqs / pop proxy
                      </div>
                    </div>

                    {/* Infrastructure Need (30%) */}
                    <div className="p-2.5 rounded-md border border-border bg-white shadow-2xs">
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Infrastructure Need (30%)
                      </div>
                      <div className="text-lg font-bold text-foreground mt-0.5">
                        {selectedHotspot.infrastructure_gap_index.toFixed(1)}
                        <span className="text-xs text-muted-foreground font-normal"> / 100</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        District deficit baseline
                      </div>
                    </div>

                    {/* People Affected (15%) */}
                    <div className="p-2.5 rounded-md border border-border bg-white shadow-2xs">
                      <div className="text-[11px] text-muted-foreground font-medium">
                        People Affected (15%)
                      </div>
                      <div className="text-lg font-bold text-foreground mt-0.5">
                        {selectedHotspot.population_impact_score.toFixed(1)}
                        <span className="text-xs text-muted-foreground font-normal"> / 100</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Scale &amp; vulnerability proxy
                      </div>
                    </div>

                    {/* Unaddressed Need (15%) */}
                    <div className="p-2.5 rounded-md border border-border bg-white shadow-2xs">
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Unaddressed Need (15%)
                      </div>
                      <div className="text-lg font-bold text-foreground mt-0.5">
                        {selectedHotspot.unaddressed_gap.toFixed(1)}
                        <span className="text-xs text-muted-foreground font-normal"> / 100</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Current Coverage: {selectedHotspot.planned_coverage_pct.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority Signal Aggregate */}
                <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-blue-950 uppercase tracking-wide">
                        Overall Priority Signal
                      </div>
                      <div className="text-2xl font-extrabold text-[#1D4ED8] mt-0.5">
                        {selectedHotspot.priority_score.toFixed(1)} / 100
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs border ${getPriorityScoreBadgeClass(
                        selectedHotspot.priority_score
                      )}`}
                    >
                      {selectedHotspot.priority_score >= 70 ? "High Priority" : "Medium Priority"}
                    </span>
                  </div>

                  {/* Math Walkthrough Formula */}
                  <div className="mt-3 pt-3 border-t border-blue-200/60 text-[11px] text-blue-900 font-mono leading-relaxed">
                    0.40({selectedHotspot.demand_score.toFixed(1)}) + 0.30({selectedHotspot.infrastructure_gap_index.toFixed(1)}) + 0.15({selectedHotspot.population_impact_score.toFixed(1)}) + 0.15({selectedHotspot.unaddressed_gap.toFixed(1)}) = <strong>{selectedHotspot.priority_score.toFixed(1)}</strong>
                  </div>
                </div>

                {/* Synthetic Disclaimer */}
                <div className="p-2.5 rounded bg-slate-100 text-[11px] text-muted-foreground flex items-start gap-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>
                    <strong>demo_synthetic</strong>: Baseline district metrics are simulated for demonstration. All signals are computed deterministically without hallucinations.
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-border p-6 text-center text-sm text-muted-foreground">
              Select a hotspot row to view mathematical breakdown.
            </Card>
          )}
        </div>
      </div>

      {/* Signal Calculation Explainer Block (Plain Language) */}
      <Card className="bg-slate-50/80 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            How this signal is calculated
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          <p>
            <strong>Citizen Demand:</strong> Normalized citizen development requests per 100,000 population: <code className="font-mono bg-white px-1 py-0.5 rounded border">min(100, (requests / pop) * 100000 * 5)</code>.
          </p>
          <p>
            <strong>Infrastructure Need:</strong> Baseline deficit indicator for the specific district and infrastructure category (0–100).
          </p>
          <p>
            <strong>Current Coverage:</strong> Proportion of existing planned schemes already addressing this sector.
          </p>
          <p>
            <strong>Unaddressed Need:</strong> Baseline deficit weighted by uncommitted planned investment: <code className="font-mono bg-white px-1 py-0.5 rounded border">need * (1 - current_coverage / 100)</code>.
          </p>
          <p>
            <strong>Priority Score:</strong> 40% Citizen Demand + 30% Infrastructure Need + 15% People Affected + 15% Unaddressed Need. AI translates and structures citizen language; deterministic application code computes the planning score.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
