import type { VisitEntry, VisitRow } from "@/lib/visitTypes";
import { entryToInsert, rowToEntry } from "@/lib/visitTypes";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const MEMORY_CAP = 500;
const memory: VisitEntry[] = [];

function pushMemory(entry: VisitEntry) {
  memory.unshift(entry);
  if (memory.length > MEMORY_CAP) memory.length = MEMORY_CAP;
}

/**
 * Primary: Supabase Postgres. If insert fails or Supabase is not configured,
 * append to in-memory buffer (lost on restart — emergency only).
 */
export async function saveVisit(entry: VisitEntry): Promise<void> {
  const supabase = getSupabaseAdmin();
  const row = entryToInsert(entry);

  if (supabase) {
    const { error } = await supabase.from("visits").insert(row);
    if (!error) return;
    console.error("[taploop] Supabase insert failed, using memory fallback:", error.message);
  }

  pushMemory(entry);
}

/**
 * Latest visits, newest first. Reads Supabase when configured; on failure or
 * no config, returns in-memory buffer only.
 */
export async function listVisits(limit = 500): Promise<VisitEntry[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("visits")
      .select(
        "id, client_ts, ip, country, region, city, org, browser, os, device_type, language, timezone, screen_width, screen_height, user_agent, referrer, network_type, platform",
      )
      .order("client_ts", { ascending: false })
      .limit(limit);

    if (!error && data?.length) {
      return (data as unknown as VisitRow[]).map(rowToEntry);
    }
    if (error) {
      console.error("[taploop] Supabase select failed, using memory:", error.message);
    }
  }

  return [...memory].slice(0, limit);
}
