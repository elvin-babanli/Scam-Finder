import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { exportsDir, ensureDir } from "@/lib/storage";
import { generateCasePdf } from "@/lib/pdf";
import { auditLog } from "@/lib/audit";

export const runtime = "nodejs";

function filenameSafe(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { caseId } = await params;
  const c = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      suspectProfiles: { orderBy: { createdAt: "desc" } },
      timelineEvents: { orderBy: { occurredAt: "desc" } },
      evidenceItems: { orderBy: { createdAt: "desc" } },
      messageEntries: { orderBy: { createdAt: "desc" } },
      paymentDetails: { orderBy: { createdAt: "desc" } },
      diagnosticLinks: { include: { diagnosticSession: true } },
    },
  });

  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const exportTime = new Date();
  const storageKey = `case_${c.id}_${crypto.randomBytes(16).toString("hex")}.pdf`;
  const dir = exportsDir();
  await ensureDir(dir);
  const outPath = path.join(dir, storageKey);

  await generateCasePdf({
    data: {
      c,
      profiles: c.suspectProfiles,
      timeline: c.timelineEvents,
      evidence: c.evidenceItems,
      messages: c.messageEntries,
      payments: c.paymentDetails,
      diagnosticSessions: c.diagnosticLinks.map((l) => l.diagnosticSession),
    },
    outPath,
    exportedAt: exportTime,
  });

  const fileName = `scam-finder-report-${filenameSafe(c.title)}-${exportTime
    .toISOString()
    .slice(0, 10)}.pdf`;

  const created = await prisma.reportExport.create({
    data: {
      caseId: c.id,
      exportedById: String(token.userId),
      fileName,
      storageKey,
    },
  });

  await auditLog({
    userId: String(token.userId),
    action: "EXPORT",
    entityType: "ReportExport",
    entityId: created.id,
    message: `Exported PDF for case: ${c.title}`,
  });

  const buf = await fs.readFile(outPath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

