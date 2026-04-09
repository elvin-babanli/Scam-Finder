import { Topbar } from "@/components/admin/Topbar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [caseCount, evidenceCount, sessionCount, exportCount] =
    await Promise.all([
      prisma.case.count(),
      prisma.evidenceItem.count(),
      prisma.diagnosticSession.count(),
      prisma.reportExport.count(),
    ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Overview" />
      <main className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <div className="text-xs text-zinc-400">Cases</div>
              <div className="text-2xl font-semibold">{caseCount}</div>
            </CardHeader>
            <CardBody>
              <div className="text-xs text-zinc-500">
                Active investigations and reports.
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-xs text-zinc-400">Evidence items</div>
              <div className="text-2xl font-semibold">{evidenceCount}</div>
            </CardHeader>
            <CardBody>
              <div className="text-xs text-zinc-500">
                Files, screenshots, links, and notes.
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-xs text-zinc-400">Diagnostic sessions</div>
              <div className="text-2xl font-semibold">{sessionCount}</div>
            </CardHeader>
            <CardBody>
              <div className="text-xs text-zinc-500">
                Only stored after explicit consent.
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-xs text-zinc-400">PDF exports</div>
              <div className="text-2xl font-semibold">{exportCount}</div>
            </CardHeader>
            <CardBody>
              <div className="text-xs text-zinc-500">
                Case reports for reporting to platforms/police.
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

