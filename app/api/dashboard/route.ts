import { NextRequest, NextResponse } from "next/server";
import { getAllCitizenRequests, getAllDistrictContexts, getDatabaseStatus } from "@/lib/db";
import { computePlanningSignals } from "@/lib/priority";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard
 * Aggregates stored citizen requests and district context
 * Returns deterministic planning signals and KPI summary per docs/02_architecture.md
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

    // 2. Compute pure deterministic planning signals
    const signals = computePlanningSignals(requests, contexts);

    // 3. Optional filters if provided
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

    return NextResponse.json({
      summary: {
        total_requests: requests.length,
        districts: signals.summary.districts,
        hotspots: signals.summary.hotspots
      },
      hotspots: filteredHotspots,
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
