import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { ensureDir, uploadsDir } from "@/lib/storage";
import { auditLog } from "@/lib/audit";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const caseId = String(form.get("caseId") ?? "");
  const title = String(form.get("title") ?? "Upload");
  const tagsRaw = String(form.get("tags") ?? "");

  const file = form.get("file");
  if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)." }, { status: 413 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
  }

  const ext =
    file.type === "image/png"
      ? ".png"
      : file.type === "image/jpeg"
        ? ".jpg"
        : file.type === "image/webp"
          ? ".webp"
          : file.type === "application/pdf"
            ? ".pdf"
            : ".txt";

  const storageKey = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  const dir = uploadsDir();
  await ensureDir(dir);
  const outPath = path.join(dir, storageKey);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outPath, buf);

  const type = file.type.startsWith("image/") ? "SCREENSHOT" : "FILE";
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 30)
    : [];

  const ev = await prisma.evidenceItem.create({
    data: {
      caseId,
      type,
      title,
      tags,
      fileName: file.name || null,
      fileMime: file.type || null,
      fileSize: file.size,
      storageKey,
    },
  });

  await auditLog({
    userId: String(token.userId),
    action: "CREATE",
    entityType: "EvidenceItem",
    entityId: ev.id,
    message: "Uploaded evidence file.",
  });

  return NextResponse.json({ ok: true, evidenceId: ev.id });
}

