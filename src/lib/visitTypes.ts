/** Shape returned to /results and /api/export (matches prior JSON contract). */
export type VisitEntry = {
  /** Present when loaded from Supabase (stable list keys). */
  id?: string;
  ts: string;
  ip: string;
  ipGeo: {
    country: string;
    region: string;
    city: string;
    org: string;
  };
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

export type VisitRow = {
  id: string;
  client_ts: string;
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  org: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  language: string | null;
  timezone: string | null;
  screen_width: number | null;
  screen_height: number | null;
  user_agent: string | null;
  referrer: string | null;
  network_type: string | null;
  platform: string | null;
};

function nz(s: string | null): string {
  return s && s.trim() ? s.trim() : "unknown";
}

export function rowToEntry(r: VisitRow): VisitEntry {
  return {
    id: r.id,
    ts: new Date(r.client_ts).toISOString(),
    ip: r.ip,
    ipGeo: {
      country: nz(r.country),
      region: nz(r.region),
      city: nz(r.city),
      org: nz(r.org),
    },
    client: {
      userAgent: r.user_agent,
      referrer: r.referrer,
      browser: r.browser,
      os: r.os,
      deviceType: r.device_type,
      language: r.language,
      timezone: r.timezone,
      screenWidth: r.screen_width,
      screenHeight: r.screen_height,
      platform: r.platform,
      networkType: r.network_type,
    },
  };
}

export function entryToInsert(
  entry: Omit<VisitEntry, "ts"> & { ts: string },
): Omit<VisitRow, "id"> {
  const t = new Date(entry.ts);
  return {
    client_ts: t.toISOString(),
    ip: entry.ip,
    country: entry.ipGeo.country,
    region: entry.ipGeo.region,
    city: entry.ipGeo.city,
    org: entry.ipGeo.org,
    browser: entry.client.browser,
    os: entry.client.os,
    device_type: entry.client.deviceType,
    language: entry.client.language,
    timezone: entry.client.timezone,
    screen_width: entry.client.screenWidth,
    screen_height: entry.client.screenHeight,
    user_agent: entry.client.userAgent,
    referrer: entry.client.referrer,
    network_type: entry.client.networkType,
    platform: entry.client.platform,
  };
}
