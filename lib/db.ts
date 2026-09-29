/**
 * Database and Persistence Layer for JanSanket
 * Implements TASK-032: Persist validated citizen requests through server-side logic.
 *
 * Architecture Compliance:
 * 1. Server-side only: Client never communicates directly with database.
 * 2. Supabase Postgres integration via PostgREST.
 * 3. DEMO_MODE fallback to bundled fixtures when Supabase is offline/unconfigured.
 * 4. Generates UUID and created_at timestamps.
 */

import { randomUUID } from "crypto";
import { ValidatedCitizenRequest } from "./validation";
import { CitizenRequest, DistrictContext, SEED_CITIZEN_REQUESTS, SEED_DISTRICT_CONTEXT } from "./demo-data";

// In-memory demo store initialized from seed fixtures
// Allows seamless demonstration when Supabase credentials are not configured or offline
const localRequestStore: CitizenRequest[] = [...SEED_CITIZEN_REQUESTS];

interface SupabaseConfig {
  url: string;
  key: string;
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith("http")) {
    return { url: url.replace(/\/$/, ""), key };
  }
  return null;
}

/**
 * Checks whether Supabase is configured and reachable
 */
export async function getDatabaseStatus(): Promise<{
  provider: "supabase" | "demo_store";
  isConfigured: boolean;
  isOnline: boolean;
}> {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      provider: "demo_store",
      isConfigured: false,
      isOnline: true
    };
  }

  try {
    const res = await fetch(`${config.url}/rest/v1/district_context?select=id&limit=1`, {
      method: "GET",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`
      },
      signal: AbortSignal.timeout(3000)
    });

    return {
      provider: "supabase",
      isConfigured: true,
      isOnline: res.ok
    };
  } catch {
    return {
      provider: "supabase",
      isConfigured: true,
      isOnline: false
    };
  }
}

/**
 * Persists a validated citizen request into the database.
 * Writes to Supabase Postgres if configured; otherwise stores in active demo store.
 */
export async function persistCitizenRequest(
  data: ValidatedCitizenRequest
): Promise<{ request: CitizenRequest; provider: "supabase" | "demo_store" }> {
  const config = getSupabaseConfig();
  const id = data.id || randomUUID();
  const created_at = data.created_at || new Date().toISOString();

  const record: CitizenRequest = {
    id,
    source: data.source,
    raw_text: data.raw_text,
    language_code: data.language_code,
    state: data.state,
    district: data.district,
    category: data.category,
    need_summary: data.need_summary,
    severity: data.severity,
    ai_confidence: data.ai_confidence,
    created_at
  };

  if (config) {
    try {
      const res = await fetch(`${config.url}/rest/v1/citizen_requests`, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const saved = await res.json();
        const persisted = Array.isArray(saved) && saved[0] ? saved[0] : record;
        // Keep local store in sync
        localRequestStore.unshift(persisted);
        return { request: persisted, provider: "supabase" };
      }

      const errorText = await res.text();
      console.error(`Supabase write failed (${res.status}): ${errorText}`);
      throw new Error(`Durable persistence failed: Supabase write failed (${res.status}): ${errorText}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      console.error(`Could not connect to Supabase: ${errorMsg}`);
      throw new Error(`Durable persistence failed: Could not connect to Supabase (${errorMsg})`);
    }
  }

  // Active demo store fallback ONLY when Supabase credentials are intentionally unconfigured
  localRequestStore.unshift(record);
  return { request: record, provider: "demo_store" };
}

/**
 * Retrieves all citizen requests (from Supabase if available, else from demo store)
 */
export async function getAllCitizenRequests(): Promise<CitizenRequest[]> {
  const config = getSupabaseConfig();

  if (config) {
    try {
      const res = await fetch(`${config.url}/rest/v1/citizen_requests?select=*&order=created_at.desc`, {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`
        },
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn("Error fetching requests from Supabase, using local store:", err);
    }
  }

  return [...localRequestStore];
}

/**
 * Retrieves all district context records (from Supabase if available, else bundled fixtures)
 */
export async function getAllDistrictContexts(): Promise<DistrictContext[]> {
  const config = getSupabaseConfig();

  if (config) {
    try {
      const res = await fetch(`${config.url}/rest/v1/district_context?select=*`, {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`
        },
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn("Error fetching district context from Supabase, using bundled demo fixtures:", err);
    }
  }

  return [...SEED_DISTRICT_CONTEXT];
}
