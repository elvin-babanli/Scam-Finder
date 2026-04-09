import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listVisits } from "@/lib/visitStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const ownerKey = process.env.OWNER_KEY ?? "";
  if (!ownerKey || !key || key !== ownerKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await listVisits(10_000);
  const forExport = entries.map((e) => {
    const { id: _omit, ...rest } = e;
    void _omit;
    return rest;
  });

  return new NextResponse(JSON.stringify(forExport, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"taploop-sessions.json\"",
      "Cache-Control": "no-store",
    },
  });
}
