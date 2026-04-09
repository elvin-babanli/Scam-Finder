import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enforcePublicRateLimit, loadSessionByToken } from "../_utils";

export const runtime = "nodejs";

const bodySchema = z.object({
  token: z.string().min(10),
  passed: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    enforcePublicRateLimit(req);
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const s = await loadSessionByToken(parsed.data.token);
    if (!s) return NextResponse.json({ error: "Invalid token." }, { status: 404 });
    if (s.status !== "ACCEPTED")
      return NextResponse.json({ error: "Consent required first." }, { status: 409 });

    await prisma.diagnosticSession.update({
      where: { id: s.id },
      data: {
        micTestAllowed: true,
        micTestPassed: parsed.data.passed,
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

