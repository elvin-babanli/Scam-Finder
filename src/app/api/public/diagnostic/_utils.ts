import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

export async function loadSessionByToken(token: string) {
  return prisma.diagnosticSession.findUnique({ where: { token } });
}

export function enforcePublicRateLimit(req: NextRequest) {
  const ip = getIp(req) ?? "unknown";
  rateLimitOrThrow({
    key: `public:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
}

export async function ipLookup(ip: string): Promise<{
  country?: string | null;
  region?: string | null;
  city?: string | null;
  isp?: string | null;
}> {
  const provider = (process.env.IP_GEO_PROVIDER ?? "").toLowerCase();
  if (!provider) return {};

  // This is only called AFTER visitor acceptance. Still, use a minimal lookup
  // and store only approximate fields.
  if (provider === "ipapi") {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      cache: "no-store",
    });
    if (!res.ok) return {};
    const json = (await res.json()) as {
      country_name?: string;
      region?: string;
      city?: string;
      org?: string;
    };
    return {
      country: json.country_name ?? null,
      region: json.region ?? null,
      city: json.city ?? null,
      isp: json.org ?? null,
    };
  }

  return {};
}

