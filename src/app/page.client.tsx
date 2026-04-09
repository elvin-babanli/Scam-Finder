"use client";

import { useEffect, useState } from "react";

type Phase = "intro" | "saving" | "done" | "declined";

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

export default function TapLoopHome() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [saveError, setSaveError] = useState<string | null>(null);
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

  async function onStart() {
    if (!client) return;
    setSaveError(null);
    setPhase("saving");
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consent: true, client }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Something went wrong");
      setPhase("done");
    } catch {
      setPhase("intro");
      setSaveError("Couldn’t save. Please try again.");
    }
  }

  function onNotNow() {
    setPhase("declined");
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-[min(100%,20rem)]">
        {phase === "intro" && (
          <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800/80 shadow-xl backdrop-blur-sm px-5 py-8 sm:px-6 sm:py-9">
            <h1 className="text-center text-2xl font-semibold tracking-tight text-white">
              TapLoop
            </h1>
            <p className="mt-1 text-center text-sm font-medium text-zinc-400">
              Quick session check
            </p>
            <p className="mt-5 text-center text-[15px] leading-relaxed text-zinc-300">
              Continue to start a short session check on this device.
            </p>
            <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
              If you continue, limited technical session details may be saved,
              such as IP, browser, device type, language, timezone, screen size,
              and visit time.
            </p>

            {saveError ? (
              <p className="mt-4 text-center text-xs text-amber-200/90">{saveError}</p>
            ) : null}

            <div className="mt-8 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onStart}
                disabled={!client}
                className="h-12 w-full rounded-xl bg-white text-zinc-950 text-[15px] font-semibold shadow-sm transition hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
              >
                Start
              </button>
              <button
                type="button"
                onClick={onNotNow}
                className="h-11 w-full rounded-xl bg-transparent text-zinc-400 text-sm font-medium ring-1 ring-zinc-700 transition hover:bg-zinc-800/50 hover:text-zinc-300"
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {phase === "saving" && (
          <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800/80 px-6 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            <p className="mt-4 text-sm text-zinc-400">Saving…</p>
          </div>
        )}

        {phase === "done" && (
          <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800/80 px-6 py-10 text-center">
            <p className="text-[15px] font-medium text-zinc-100">Done. Session saved.</p>
          </div>
        )}

        {phase === "declined" && (
          <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800/80 px-6 py-10 text-center">
            <p className="text-[15px] text-zinc-400">Okay. You can close this page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
