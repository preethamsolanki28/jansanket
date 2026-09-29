import { NextRequest, NextResponse } from "next/server";
import { getAllCitizenRequests, getAllDistrictContexts, getDatabaseStatus } from "@/lib/db";
import { computePlanningSignals } from "@/lib/priority";
import { isPilotDistrict } from "@/lib/india-locations";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard
 * Aggregates stored citizen requests and district context
 * Returns deterministic planning signals, KPI summary, and complete request list
 * per docs/02_architecture.md
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stateFilter = searchParams.get("state")?.toLowerCase();
    const categoryFilter = searchParams.get("category")?.toLowerCase();

    // 1. Fetch current requests and context records
    const [requests, contexts, dbStatus] = await Promise.all([
      getAllCitizenRequests(),
      getAllDistrictContexts(),
      getDatabaseStatus()
    ]);

    // 2. Compute pure deterministic planning signals (scored only for pilot districts)
    const signals = computePlanningSignals(requests, contexts);

    // 3. Optional filters if provided for hotspots
    let filteredHotspots = signals.hotspots;
    if (stateFilter) {
      filteredHotspots = filteredHotspots.filter(
        (h) => h.state.toLowerCase() === stateFilter
      );
    }
    if (categoryFilter) {
      filteredHotspots = filteredHotspots.filter(
        (h) => h.category.toLowerCase() === categoryFilter
      );
    }

    // 4. Pilot coverage counts for transparency
    const pilotRequests = requests.filter((r) => isPilotDistrict(r.state, r.district));
    const outsidePilotRequests = requests.filter((r) => !isPilotDistrict(r.state, r.district));

    return NextResponse.json({
      summary: {
        total_requests: requests.length,
        pilot_requests: pilotRequests.length,
        outside_pilot_requests: outsidePilotRequests.length,
        districts: signals.summary.districts,
        hotspots: signals.summary.hotspots
      },
      hotspots: filteredHotspots,
      requests: requests, // All recorded citizen requests (pilot + outside pilot)
      meta: {
        provider: dbStatus.provider,
        is_database_online: dbStatus.isOnline,
        updated_at: new Date().toISOString()
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    console.error("Error in GET /api/dashboard:", errorMsg);
    return NextResponse.json(
      { error: "Failed to generate planning signals." },
      { status: 500 }
    );
  }
}

