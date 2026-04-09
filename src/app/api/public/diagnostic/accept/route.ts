import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enforcePublicRateLimit, getIp, ipLookup, loadSessionByToken } from "../_utils";

export const runtime = "nodejs";

const bodySchema = z.object({
  token: z.string().min(10),
  client: z.object({
    userAgent: z.string().max(4000).nullable(),
    referrer: z.string().max(4000).nullable(),
    browserName: z.string().max(120).nullable(),
    browserVersion: z.string().max(120).nullable(),
    osName: z.string().max(120).nullable(),
    osVersion: z.string().max(120).nullable(),
    deviceType: z.string().max(50).nullable(),
    language: z.string().max(50).nullable(),
    timezone: z.string().max(80).nullable(),
    screenWidth: z.number().int().min(0).max(20000).nullable(),
    screenHeight: z.number().int().min(0).max(20000).nullable(),
    platform: z.string().max(120).nullable(),
    networkType: z.string().max(80).nullable(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    enforcePublicRateLimit(req);
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const s = await loadSessionByToken(parsed.data.token);
    if (!s) return NextResponse.json({ error: "Invalid token." }, { status: 404 });
    if (s.status === "DECLINED")
      return NextResponse.json({ error: "This link was declined." }, { status: 409 });

    const ip = getIp(req);
    const ua = req.headers.get("user-agent") ?? parsed.data.client.userAgent ?? null;
    const referrer = parsed.data.client.referrer ?? null;

    const lookup =
      ip && ip !== "unknown"
        ? await ipLookup(ip).catch(() => ({
            country: null,
            region: null,
            city: null,
            isp: null,
          }))
        : { country: null, region: null, city: null, isp: null };

    await prisma.diagnosticSession.update({
      where: { id: s.id },
      data: {
        status: "ACCEPTED",
        consentedAt: new Date(),
        ipAddress: ip,
        ipCountry: lookup.country ?? null,
        ipRegion: lookup.region ?? null,
        ipCity: lookup.city ?? null,
        isp: lookup.isp ?? null,
        userAgent: ua,
        referrer,
        browserName: parsed.data.client.browserName,
        browserVersion: parsed.data.client.browserVersion,
        osName: parsed.data.client.osName,
        osVersion: parsed.data.client.osVersion,
        deviceType: parsed.data.client.deviceType,
        language: parsed.data.client.language,
        timezone: parsed.data.client.timezone,
        screenWidth: parsed.data.client.screenWidth,
        screenHeight: parsed.data.client.screenHeight,
        platform: parsed.data.client.platform,
        networkType: parsed.data.client.networkType,
      },
    });

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

