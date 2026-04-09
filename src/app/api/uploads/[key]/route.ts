import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import path from "path";
import fs from "fs/promises";
import { uploadsDir } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const ev = await prisma.evidenceItem.findFirst({ where: { storageKey: key } });
  if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filePath = path.join(uploadsDir(), key);
  const buf = await fs.readFile(filePath).catch(() => null);
  if (!buf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": ev.fileMime ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${ev.fileName ?? key}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

