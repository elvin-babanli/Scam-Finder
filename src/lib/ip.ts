export function getIpFromHeaders(headers: Headers): string | null {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || null;
  return headers.get("x-real-ip") ?? null;
}

const GEO_UNKNOWN = {
  country: "unknown",
  region: "unknown",
  city: "unknown",
  org: "unknown",
} as const;

function isLikelyPrivateOrInvalidIp(ip: string): boolean {
  const s = ip.trim().toLowerCase();
  if (!s || s === "unknown") return true;
  if (s === "::1" || s === "127.0.0.1") return true;
  if (s.startsWith("10.")) return true;
  if (s.startsWith("192.168.")) return true;
  if (s.startsWith("169.254.")) return true;
  const m = /^172\.(\d+)\./.exec(s);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  if (s.includes(":")) {
    if (s.startsWith("fe80:") || s.startsWith("fc") || s.startsWith("fd")) return true;
  }
  return false;
}

function strField(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "unknown";
}

/**
 * Server-side lookup via ipapi.co JSON API. Never throws; rate limits and errors yield "unknown" fields.
 * Uses per-IP URL so geo matches the visitor, not the server.
 */
export async function ipLookup(ip: string): Promise<{
  country: string;
  region: string;
  city: string;
  org: string;
}> {
  if (isLikelyPrivateOrInvalidIp(ip)) {
    return { ...GEO_UNKNOWN };
  }

  try {
    const url = `https://ipapi.co/${encodeURIComponent(ip.trim())}/json/`;
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return { ...GEO_UNKNOWN };
    }

    if (!json || typeof json !== "object") return { ...GEO_UNKNOWN };

    const o = json as Record<string, unknown>;

    if (o.error === true) return { ...GEO_UNKNOWN };

    if (!res.ok) return { ...GEO_UNKNOWN };

    return {
      country: strField(o.country_name),
      region: strField(o.region),
      city: strField(o.city),
      org: strField(o.org ?? o.org_name ?? o.asn),
    };
  } catch {
    return { ...GEO_UNKNOWN };
  }
}
