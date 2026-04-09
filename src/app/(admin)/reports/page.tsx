import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ReportsIndexPage() {
  const cases = await prisma.case.findMany({ orderBy: { updatedAt: "desc" } });
  const exports = await prisma.reportExport.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    include: { case: true },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Reports" />
      <main className="p-4 lg:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Export by case</div>
            <div className="text-xs text-zinc-400">
              Generate a professional PDF report for police/platform reporting.
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {cases.length === 0 ? (
              <div className="text-sm text-zinc-400">No cases yet.</div>
            ) : (
              cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/reports/${c.id}`}
                  className="block rounded-lg ring-1 ring-inset ring-zinc-800 p-4 hover:bg-zinc-900/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{c.title}</div>
                      <div className="text-xs text-zinc-400">
                        {c.platform ? `${c.platform} • ` : ""}
                        Updated {c.updatedAt.toISOString().slice(0, 10)}
                      </div>
                    </div>
                    <Badge>Open</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Recent exports</div>
            <div className="text-xs text-zinc-400">
              Stored export records (files saved to server storage).
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {exports.length === 0 ? (
              <div className="text-sm text-zinc-400">No exports yet.</div>
            ) : (
              exports.map((e) => (
                <div key={e.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4">
                  <div className="text-sm font-semibold">{e.case.title}</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {e.fileName} • {e.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

