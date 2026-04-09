"use client";

import { useEffect, useState } from "react";
import { TapFlappy } from "@/components/TapFlappy";

type Phase = "intro" | "saving" | "done";

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
  const [saveError, setSaveError] = useState(false);
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
    setSaveError(false);
    setPhase("saving");
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consent: true, client }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "no");
      setPhase("done");
    } catch {
      setPhase("intro");
      setSaveError(true);
    }
  }

  return (
    <>
      <div className="min-h-dvh bg-gradient-to-b from-pink-200 via-rose-100 to-pink-50 text-zinc-800 flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-xs">
          {phase === "intro" && (
            <div className="rounded-[2rem] bg-white/85 shadow-xl shadow-pink-200/50 ring-1 ring-pink-200/60 backdrop-blur-md px-8 py-10">
              <h1 className="text-center text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
                TapLoop
              </h1>
              {saveError ? (
                <p className="mt-4 text-center text-sm text-rose-600">Please try again.</p>
              ) : null}
              <div className="mt-10">
                <button
                  type="button"
                  onClick={onStart}
                  disabled={!client}
                  className="h-14 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-base font-bold text-white shadow-lg shadow-pink-400/40 transition-transform hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                >
                  Start
                </button>
              </div>
            </div>
          )}

          {phase === "saving" && (
            <div className="rounded-[2rem] bg-white/85 shadow-xl shadow-pink-200/50 ring-1 ring-pink-200/60 px-8 py-14 flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <span className="h-3 w-3 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.2s]" />
                <span className="h-3 w-3 animate-bounce rounded-full bg-rose-400 [animation-delay:-0.1s]" />
                <span className="h-3 w-3 animate-bounce rounded-full bg-fuchsia-400" />
              </div>
            </div>
          )}
        </div>
      </div>

      {phase === "done" ? <TapFlappy /> : null}
    </>
  );
}
