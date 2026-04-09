"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type Stage = "CONSENT" | "DECLINED" | "ACCEPTED" | "ERROR";

function parseBrowser(ua: string): { name?: string; version?: string } {
  const m =
    ua.match(/(edg)\/([\d.]+)/i) ??
    ua.match(/(chrome)\/([\d.]+)/i) ??
    ua.match(/(firefox)\/([\d.]+)/i) ??
    ua.match(/version\/([\d.]+).*safari/i);
  if (!m) return {};
  if (m[1]?.toLowerCase() === "edg") return { name: "Edge", version: m[2] };
  if (m[1]?.toLowerCase() === "chrome") return { name: "Chrome", version: m[2] };
  if (m[1]?.toLowerCase() === "firefox") return { name: "Firefox", version: m[2] };
  if (m[1]?.toLowerCase() === "version") return { name: "Safari", version: m[1] };
  return {};
}

function parseOS(ua: string): { name?: string; version?: string } {
  const w = ua.match(/Windows NT ([\d.]+)/i);
  if (w) return { name: "Windows", version: w[1] };
  const m = ua.match(/Mac OS X ([\d_]+)/i);
  if (m) return { name: "macOS", version: m[1].replaceAll("_", ".") };
  const a = ua.match(/Android ([\d.]+)/i);
  if (a) return { name: "Android", version: a[1] };
  const i = ua.match(/iPhone OS ([\d_]+)/i);
  if (i) return { name: "iOS", version: i[1].replaceAll("_", ".") };
  return {};
}

function deviceType(ua: string): string {
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

export default function PublicDiagnosticPage() {
  const { token } = useParams<{ token: string }>();
  const [stage, setStage] = useState<Stage>("CONSENT");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const clientPayload = useMemo(() => {
    const ua = navigator.userAgent ?? "";
    const b = parseBrowser(ua);
    const os = parseOS(ua);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const net = (navigator as any).connection?.effectiveType as string | undefined;
    return {
      userAgent: ua,
      referrer: document.referrer || null,
      browserName: b.name ?? null,
      browserVersion: b.version ?? null,
      osName: os.name ?? null,
      osVersion: os.version ?? null,
      deviceType: deviceType(ua),
      language: navigator.language ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      platform: navigator.platform ?? null,
      networkType: net ?? null,
    };
  }, []);

  useEffect(() => {
    // No storage or server calls happen automatically on page load.
  }, []);

  async function post(path: string, body: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error ?? "Request failed");
    return json;
  }

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      await post("/api/public/diagnostic/accept", {
        token,
        client: clientPayload,
      });
      setStage("ACCEPTED");
    } catch (e) {
      setStage("ERROR");
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    setBusy(true);
    setError(null);
    try {
      await post("/api/public/diagnostic/decline", { token });
      setStage("DECLINED");
    } catch (e) {
      setStage("ERROR");
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function sharePreciseGeo() {
    setBusy(true);
    setError(null);
    try {
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Geolocation not supported."));
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(new Error(err.message)),
          { enableHighAccuracy: true, timeout: 10000 },
        );
      });
      await post("/api/public/diagnostic/precise-geo", {
        token,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function cameraTest() {
    setBusy(true);
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera test not supported.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      await post("/api/public/diagnostic/camera-test", { token, passed: true });
    } catch (e) {
      await post("/api/public/diagnostic/camera-test", { token, passed: false }).catch(() => {});
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function micTest() {
    setBusy(true);
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone test not supported.");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      await post("/api/public/diagnostic/mic-test", { token, passed: true });
    } catch (e) {
      await post("/api/public/diagnostic/mic-test", { token, passed: false }).catch(() => {});
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="text-lg font-semibold">Scam Finder — Diagnostic (Consent Required)</div>
          <div className="text-sm text-zinc-400">
            This page is for voluntary diagnostics to help document a suspected scam interaction.
            Nothing is stored unless you explicitly accept.
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {stage === "CONSENT" ? (
            <>
              <div className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4 space-y-3">
                <div className="text-sm font-semibold">If you accept, we will store:</div>
                <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">
                  <li>IP address</li>
                  <li>Approximate IP geolocation (country/region/city if available)</li>
                  <li>ISP/organization if available from a compliant IP-lookup service</li>
                  <li>Browser and operating system info</li>
                  <li>Device type, language, timezone, screen size</li>
                  <li>User agent, referrer (if present), platform, network type (if available)</li>
                  <li>Timestamp</li>
                </ul>
                <div className="text-xs text-zinc-500">
                  Optional tests (precise location, camera, microphone) are <span className="text-zinc-300">disabled by default</span> and require separate opt-in after acceptance.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={accept} disabled={busy}>
                  Accept and Continue
                </Button>
                <Button onClick={decline} variant="secondary" disabled={busy}>
                  Decline
                </Button>
              </div>
            </>
          ) : null}

          {stage === "DECLINED" ? (
            <div className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4 text-sm text-zinc-300">
              You declined. No diagnostic data was stored.
            </div>
          ) : null}

          {stage === "ACCEPTED" ? (
            <>
              <div className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4 text-sm text-zinc-300">
                Thanks — your basic diagnostic session has been stored.
              </div>
              <div className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4 space-y-3">
                <div className="text-sm font-semibold">Optional (separate consent)</div>
                <div className="text-xs text-zinc-500">
                  These actions request additional permissions from your browser. You can skip them.
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={sharePreciseGeo} variant="secondary" disabled={busy}>
                    Share precise geolocation
                  </Button>
                  <Button onClick={cameraTest} variant="secondary" disabled={busy}>
                    Camera test
                  </Button>
                  <Button onClick={micTest} variant="secondary" disabled={busy}>
                    Microphone test
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {stage === "ERROR" ? (
            <div className="rounded-lg bg-red-950/40 ring-1 ring-inset ring-red-900/40 p-4 text-sm text-red-200">
              {error ?? "Something went wrong."}
            </div>
          ) : null}

          {error && stage !== "ERROR" ? (
            <div className="rounded-lg bg-amber-950/30 ring-1 ring-inset ring-amber-900/30 p-3 text-xs text-amber-200">
              {error}
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}

