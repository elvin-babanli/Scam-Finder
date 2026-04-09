import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { createCase, deleteCase } from "@/app/(admin)/cases/actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function riskColor(risk: string) {
  if (risk === "CRITICAL") return "red";
  if (risk === "HIGH") return "amber";
  if (risk === "LOW") return "emerald";
  return "zinc";
}

export default async function CasesPage() {
  const cases = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Cases" />
      <main className="p-4 lg:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Create case</div>
            <div className="text-xs text-zinc-400">
              Start a new investigation and attach evidence over time.
            </div>
          </CardHeader>
          <CardBody>
            <form action={createCase} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Title</label>
                <Input name="title" placeholder="e.g. Telegram crypto impersonation" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Platform</label>
                <Input name="platform" placeholder="Instagram / Telegram / WhatsApp" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">Description</label>
                <Input name="description" placeholder="Short summary (optional)" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Risk level</label>
                <select
                  name="riskLevel"
                  className="h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 ring-1 ring-inset ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300/20"
                  defaultValue="MEDIUM"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Status</label>
                <Input name="status" defaultValue="OPEN" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Create case</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">All cases</div>
            <div className="text-xs text-zinc-400">
              {cases.length ? "Select a case to manage evidence and export reports." : "No cases yet."}
            </div>
          </CardHeader>
          <CardBody>
            {cases.length === 0 ? (
              <div className="text-sm text-zinc-400">
                Create your first case above.
              </div>
            ) : (
              <div className="space-y-2">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg bg-zinc-950 ring-1 ring-inset ring-zinc-800 p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/cases/${c.id}`}
                          className="text-sm font-semibold text-zinc-50 hover:underline"
                        >
                          {c.title}
                        </Link>
                        <Badge color={riskColor(c.riskLevel)}>{c.riskLevel}</Badge>
                        <Badge>{c.status}</Badge>
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {c.platform ? `${c.platform} • ` : ""}
                        Updated {c.updatedAt.toISOString().slice(0, 10)}
                      </div>
                    </div>
                    <form action={async () => deleteCase(c.id)}>
                      <Button variant="danger" size="sm" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

