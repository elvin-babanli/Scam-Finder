import { headers } from "next/headers";
import Link from "next/link";
import { listVisits } from "@/lib/visitStore";
import type { VisitEntry } from "@/lib/visitTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl ring-1 ring-zinc-800 bg-zinc-900/40 p-6 text-center">
        <div className="text-sm font-semibold text-zinc-200">TapLoop</div>
        <div className="mt-2 text-xs text-zinc-500">
          Private area. Add <code className="rounded bg-zinc-800 px-1 py-0.5 text-2xs">?key=</code>{" "}
          with your owner key.
        </div>
      </div>
    </div>
  );
}

function CardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-zinc-800/80 py-2.5 last:border-0">
      <span className="text-2xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="wrap-break-word text-sm text-zinc-200">{value || "—"}</span>
    </div>
  );
}

function SessionCard({ e }: { e: VisitEntry }) {
  return (
    <article className="rounded-2xl border border-zinc-800/80 bg-zinc-900/25 p-4">
      <div className="text-tight-xs font-medium text-zinc-500">{e.ts}</div>
      <div className="mt-3 space-y-0">
        <CardRow label="IP" value={e.ip} />
        <CardRow
          label="Location"
          value={[e.ipGeo.country, e.ipGeo.region, e.ipGeo.city].filter(Boolean).join(", ")}
        />
        <CardRow label="Org" value={e.ipGeo.org ?? ""} />
        <CardRow label="Browser" value={e.client.browser ?? ""} />
        <CardRow label="OS" value={e.client.os ?? ""} />
        <CardRow label="Device" value={e.client.deviceType ?? ""} />
        <CardRow
          label="Lang / TZ"
          value={[e.client.language, e.client.timezone].filter(Boolean).join(" · ")}
        />
        <CardRow
          label="Screen"
          value={
            e.client.screenWidth && e.client.screenHeight
              ? `${e.client.screenWidth}×${e.client.screenHeight}`
              : ""
          }
        />
        <CardRow label="Referrer" value={e.client.referrer ?? ""} />
      </div>
    </article>
  );
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

  const entries = await listVisits(500);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight">TapLoop</div>
            <p className="mt-0.5 text-xs text-zinc-500">
              {entries.length === 0
                ? "No sessions yet"
                : `${entries.length} session${entries.length === 1 ? "" : "s"} · newest first`}
            </p>
          </div>
          <Link
            href={`/api/export?key=${encodeURIComponent(ownerKey)}`}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
          >
            Export JSON
          </Link>
        </header>

        <p className="mt-3 text-2xs leading-relaxed text-zinc-600">
          Owner link:{" "}
          <span className="font-mono text-zinc-500">
            {proto}://{host}/results?key=…
          </span>
        </p>

        <div className="mt-5 space-y-3 md:hidden">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 text-center text-sm text-zinc-500">
              No sessions yet. Open the home page and tap Start.
            </div>
          ) : (
            entries.map((e, idx) => <SessionCard key={e.id ?? `${e.ts}-${e.ip}-${idx}`} e={e} />)
          )}
        </div>

        <div className="mt-5 hidden md:block overflow-x-auto rounded-2xl border border-zinc-800/80">
          <table className="w-full min-w-4xl text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40 text-left text-xs text-zinc-500">
                <th className="px-3 py-2.5 font-medium">Time</th>
                <th className="px-3 py-2.5 font-medium">IP</th>
                <th className="px-3 py-2.5 font-medium">Location</th>
                <th className="px-3 py-2.5 font-medium">Org</th>
                <th className="px-3 py-2.5 font-medium">Browser</th>
                <th className="px-3 py-2.5 font-medium">OS</th>
                <th className="px-3 py-2.5 font-medium">Device</th>
                <th className="px-3 py-2.5 font-medium">Lang / TZ</th>
                <th className="px-3 py-2.5 font-medium">Screen</th>
                <th className="px-3 py-2.5 font-medium">Referrer</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-zinc-500" colSpan={10}>
                    No sessions yet.
                  </td>
                </tr>
              ) : (
                entries.map((e, idx) => (
                  <tr
                    key={e.id ?? `${e.ts}-${e.ip}-${idx}`}
                    className="border-b border-zinc-800/60 odd:bg-transparent even:bg-zinc-900/20"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-400">{e.ts}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{e.ip}</td>
                    <td className="px-3 py-2 text-xs">
                      {[e.ipGeo.country, e.ipGeo.region, e.ipGeo.city].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="max-w-32 truncate px-3 py-2 text-xs">{e.ipGeo.org ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{e.client.browser ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{e.client.os ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{e.client.deviceType ?? "—"}</td>
                    <td className="max-w-40 px-3 py-2 text-xs">
                      {[e.client.language, e.client.timezone].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      {e.client.screenWidth && e.client.screenHeight
                        ? `${e.client.screenWidth}×${e.client.screenHeight}`
                        : "—"}
                    </td>
                    <td className="max-w-48 wrap-anywhere px-3 py-2 text-xs text-zinc-400">
                      {e.client.referrer ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
