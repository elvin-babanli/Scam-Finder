import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import { visitsPath } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const ownerKey = process.env.OWNER_KEY ?? "";
  if (!ownerKey || !key || key !== ownerKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await fs.readFile(visitsPath(), "utf8").catch(() => "");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const entries = lines
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return new NextResponse(JSON.stringify(entries, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"taploop-sessions.json\"",
      "Cache-Control": "no-store",
    },
  });
}

