import { headers } from "next/headers";
import Link from "next/link";
import fs from "fs/promises";
import { visitsPath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl ring-1 ring-inset ring-zinc-800 p-6">
        <div className="text-lg font-semibold">Private</div>
        <div className="text-sm text-zinc-400 mt-2">
          Provide `?key=OWNER_KEY` to view results.
        </div>
      </div>
    </div>
  );
}

type Entry = {
  ts: string;
  ip: string;
  ipGeo: { country: string | null; region: string | null; city: string | null; org: string | null };
  client: {
    userAgent: string | null;
    referrer: string | null;
    browser: string | null;
    os: string | null;
    deviceType: string | null;
    language: string | null;
    timezone: string | null;
    screenWidth: number | null;
    screenHeight: number | null;
    platform: string | null;
    networkType: string | null;
  };
};

async function readEntries(): Promise<Entry[]> {
  const p = visitsPath();
  const raw = await fs.readFile(p, "utf8").catch(() => "");
  if (!raw.trim()) return [];
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const entries: Entry[] = [];
  for (const line of lines.slice(-500).reverse()) {
    try {
      entries.push(JSON.parse(line) as Entry);
    } catch {
      // ignore bad lines
    }
  }
  return entries;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const ownerKey = process.env.OWNER_KEY ?? "";
  if (!ownerKey || !key || key !== ownerKey) return unauthorized();

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  const entries = await readEntries();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xl font-semibold">Results</div>
            <div className="text-sm text-zinc-400">
              Showing last {Math.min(entries.length, 500)} entries (newest first)
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/api/export?key=${encodeURIComponent(ownerKey)}`}
              className="h-10 px-4 rounded-md bg-white text-zinc-950 hover:bg-zinc-100 text-sm font-medium inline-flex items-center"
            >
              Export JSON
            </Link>
            <div className="text-xs text-zinc-500 self-center">
              Private URL: {proto}://{host}/results?key=…
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-inset ring-zinc-800">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-zinc-950">
              <tr className="text-left text-xs text-zinc-400">
                <th className="p-3 border-b border-zinc-800">Timestamp</th>
                <th className="p-3 border-b border-zinc-800">IP</th>
                <th className="p-3 border-b border-zinc-800">Approx location</th>
                <th className="p-3 border-b border-zinc-800">Org</th>
                <th className="p-3 border-b border-zinc-800">Browser</th>
                <th className="p-3 border-b border-zinc-800">OS</th>
                <th className="p-3 border-b border-zinc-800">Device</th>
                <th className="p-3 border-b border-zinc-800">Lang / TZ</th>
                <th className="p-3 border-b border-zinc-800">Screen</th>
                <th className="p-3 border-b border-zinc-800">Referrer</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td className="p-4 text-zinc-400" colSpan={10}>
                    No entries yet. Visit `/` and click “Accept & Save”.
                  </td>
                </tr>
              ) : (
                entries.map((e, idx) => (
                  <tr key={idx} className="odd:bg-zinc-950 even:bg-zinc-950/70">
                    <td className="p-3 border-b border-zinc-900 whitespace-nowrap">{e.ts}</td>
                    <td className="p-3 border-b border-zinc-900 whitespace-nowrap">{e.ip}</td>
                    <td className="p-3 border-b border-zinc-900">
                      {[e.ipGeo.country, e.ipGeo.region, e.ipGeo.city].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="p-3 border-b border-zinc-900">{e.ipGeo.org ?? "—"}</td>
                    <td className="p-3 border-b border-zinc-900">{e.client.browser ?? "—"}</td>
                    <td className="p-3 border-b border-zinc-900">{e.client.os ?? "—"}</td>
                    <td className="p-3 border-b border-zinc-900">{e.client.deviceType ?? "—"}</td>
                    <td className="p-3 border-b border-zinc-900">
                      {[e.client.language, e.client.timezone].filter(Boolean).join(" • ") || "—"}
                    </td>
                    <td className="p-3 border-b border-zinc-900 whitespace-nowrap">
                      {e.client.screenWidth && e.client.screenHeight
                        ? `${e.client.screenWidth}×${e.client.screenHeight}`
                        : "—"}
                    </td>
                    <td className="p-3 border-b border-zinc-900 break-all max-w-[280px]">
                      {e.client.referrer ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          Data is stored on the server at <span className="text-zinc-300">{visitsPath()}</span>.
        </div>
      </div>
    </div>
  );
}

