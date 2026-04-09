"use client";

import { useEffect, useState } from "react";

function parseBrowser(ua: string): string | null {
  const m =
    ua.match(/Edg\/[\d.]+/i) ??
    ua.match(/Chrome\/[\d.]+/i) ??
    ua.match(/Firefox\/[\d.]+/i) ??
    ua.match(/Version\/[\d.]+.*Safari/i);
  return m ? m[0] : null;
}

function parseOS(ua: string): string | null {
  const w = ua.match(/Windows NT ([\d.]+)/i);
  if (w) return `Windows ${w[1]}`;
  const m = ua.match(/Mac OS X ([\d_]+)/i);
  if (m) return `macOS ${m[1].replaceAll("_", ".")}`;
  const a = ua.match(/Android ([\d.]+)/i);
  if (a) return `Android ${a[1]}`;
  const i = ua.match(/iPhone OS ([\d_]+)/i);
  if (i) return `iOS ${i[1].replaceAll("_", ".")}`;
  return null;
}

function deviceType(ua: string): string {
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

export default function ConsentLoggerCard() {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [client, setClient] = useState<{
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
  } | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent ?? "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const net = (navigator as any).connection?.effectiveType as string | undefined;
    setClient({
      userAgent: ua || null,
      referrer: document.referrer || null,
      browser: parseBrowser(ua),
      os: parseOS(ua),
      deviceType: deviceType(ua),
      language: navigator.language ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      platform: navigator.platform ?? null,
      networkType: net ?? null,
    });
  }, []);

  async function acceptAndLog() {
    if (!client) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consent: true, client }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setAccepted(true);
      setStatus("Thanks — your session info was saved.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl ring-1 ring-inset ring-zinc-800 bg-zinc-950 p-6">
        <div className="text-lg font-semibold">Welcome</div>
        <div className="text-sm text-zinc-400 mt-2">
          This page can store basic technical visit info <span className="text-zinc-200">only if you consent</span>.
        </div>

        <div className="mt-5 rounded-lg ring-1 ring-inset ring-zinc-800 p-4">
          <div className="text-sm font-semibold">What will be stored after you accept</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-300 space-y-1">
            <li>IP address</li>
            <li>Approximate IP location (country/region/city if available)</li>
            <li>Browser, OS, device type</li>
            <li>Language, timezone, screen size</li>
            <li>User agent, referrer (if present), network type (if available)</li>
            <li>Timestamp</li>
          </ul>
          <div className="mt-3 text-xs text-zinc-500">
            Nothing is stored if you decline or close the page.
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={acceptAndLog}
            disabled={busy || accepted}
            className="h-10 px-4 rounded-md bg-white text-zinc-950 hover:bg-zinc-100 text-sm font-medium disabled:opacity-50"
          >
            {accepted ? "Accepted" : busy ? "Saving…" : "Accept & Save"}
          </button>
          <button
            onClick={() => setStatus("Declined — nothing was saved.")}
            disabled={busy}
            className="h-10 px-4 rounded-md bg-zinc-900 text-zinc-50 ring-1 ring-inset ring-zinc-800 hover:bg-zinc-800 text-sm font-medium disabled:opacity-50"
          >
            Decline
          </button>
        </div>

        {status ? (
          <div className="mt-4 text-sm text-zinc-300">{status}</div>
        ) : null}
      </div>
    </div>
  );
}

