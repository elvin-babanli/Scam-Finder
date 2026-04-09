import { notFound } from "next/navigation";
import { Topbar } from "@/components/admin/Topbar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: { reportExports: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!c) return notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Report" />
      <main className="p-4 lg:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Export PDF</div>
            <div className="text-xs text-zinc-400">
              Generates a clean report containing case summary, timeline, evidence, transcript excerpts, payment details, and linked diagnostic sessions.
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="text-lg font-semibold">{c.title}</div>
            <ButtonLink href={`/api/reports/${c.id}/pdf`} variant="primary">
              Download PDF report
            </ButtonLink>
            <div className="text-xs text-zinc-500">
              Note: exports are stored on the server under `STORAGE_DIR` (default `./data`).
              For production durability on Render, configure persistent disk or move to object storage.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Recent exports</div>
          </CardHeader>
          <CardBody className="space-y-2">
            {c.reportExports.length === 0 ? (
              <div className="text-sm text-zinc-400">No exports yet.</div>
            ) : (
              c.reportExports.map((e) => (
                <div key={e.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4">
                  <div className="text-sm font-semibold">{e.fileName}</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {e.createdAt.toISOString().replace("T", " ").slice(0, 19)}
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

