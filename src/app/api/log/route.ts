import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { getIpFromHeaders, ipLookup } from "@/lib/ip";
import { saveVisit } from "@/lib/visitStore";
import type { VisitEntry } from "@/lib/visitTypes";

export const runtime = "nodejs";

type ClientPayload = {
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

export async function POST(req: NextRequest) {
  try {
    const ip = getIpFromHeaders(req.headers) ?? "unknown";
    rateLimitOrThrow({ key: `log:${ip}`, limit: 20, windowMs: 60_000 });

    const body = (await req.json().catch(() => null)) as
      | { consent: boolean; client?: ClientPayload }
      | null;

    if (!body || body.consent !== true || !body.client) {
      return NextResponse.json({ error: "Consent required." }, { status: 400 });
    }

    const lookup =
      ip !== "unknown"
        ? await ipLookup(ip).catch(() => ({
            country: null,
            region: null,
            city: null,
            org: null,
          }))
        : { country: null, region: null, city: null, org: null };

    const entry: VisitEntry = {
      ts: new Date().toISOString(),
      ip,
      ipGeo: {
        country: lookup.country ?? null,
        region: lookup.region ?? null,
        city: lookup.city ?? null,
        org: lookup.org ?? null,
      },
      client: body.client,
    };

    await saveVisit(entry);

    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = e as any;
    const status = anyErr?.statusCode === 429 ? 429 : 500;
    const headers =
      status === 429 && anyErr?.retryAfterSeconds
        ? { "Retry-After": String(anyErr.retryAfterSeconds) }
        : undefined;
    return NextResponse.json({ error: "Server error." }, { status, headers });
  }
}
