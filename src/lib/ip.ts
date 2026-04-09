export function getIpFromHeaders(headers: Headers): string | null {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || null;
  return headers.get("x-real-ip") ?? null;
}

export async function ipLookup(ip: string): Promise<{
  country?: string | null;
  region?: string | null;
  city?: string | null;
  org?: string | null;
}> {
  const provider = (process.env.IP_GEO_PROVIDER ?? "").toLowerCase();
  if (!provider) return {};

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
      org: json.org ?? null,
    };
  }

  return {};
}

