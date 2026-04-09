import { Topbar } from "@/components/admin/Topbar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { createDiagnosticLink, deleteDiagnosticLink } from "@/app/(admin)/settings/actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function appUrl() {
  const u = process.env.NEXT_PUBLIC_APP_URL;
  return u?.replace(/\/+$/, "") ?? "";
}

export default async function SettingsPage() {
  const sessions = await prisma.diagnosticSession.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
  });
  const audit = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { user: true },
  });

  const base = appUrl();

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Settings" />
      <main className="p-4 lg:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Public diagnostic links</div>
            <div className="text-xs text-zinc-400">
              Create a share link. Nothing is stored unless the visitor explicitly accepts consent.
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <form
              action={async () => {
                "use server";
                await createDiagnosticLink();
              }}
            >
              <Button type="submit" variant="secondary">
                Create new diagnostic link
              </Button>
            </form>

            <div className="space-y-2">
              {sessions.length === 0 ? (
                <div className="text-sm text-zinc-400">No sessions yet.</div>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold">Session</div>
                          <Badge>{s.status}</Badge>
                          {s.preciseGeoAllowed ? <Badge color="blue">Precise geo allowed</Badge> : null}
                          {s.cameraTestAllowed ? <Badge color="blue">Camera allowed</Badge> : null}
                          {s.micTestAllowed ? <Badge color="blue">Mic allowed</Badge> : null}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          Created {s.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                        </div>
                        <div className="text-xs text-zinc-400 mt-2 break-all">
                          {base ? (
                            <>
                              Link: {base}/public/diagnostic/{s.token}
                            </>
                          ) : (
                            <>
                              Token: {s.token} (set `NEXT_PUBLIC_APP_URL` to render full link)
                            </>
                          )}
                        </div>
                      </div>
                      <form action={deleteDiagnosticLink.bind(null, s.id)}>
                        <Button type="submit" variant="danger" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Audit log</div>
            <div className="text-xs text-zinc-400">
              Recent admin actions (create/update/delete/export/login/logout).
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {audit.length === 0 ? (
              <div className="text-sm text-zinc-400">No audit events yet.</div>
            ) : (
              audit.map((a) => (
                <div key={a.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{a.action}</Badge>
                    <div className="text-sm font-semibold">{a.entityType}</div>
                    {a.entityId ? (
                      <div className="text-xs text-zinc-400 break-all">{a.entityId}</div>
                    ) : null}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {a.createdAt.toISOString().replace("T", " ").slice(0, 19)} •{" "}
                    {a.user?.email ?? "Unknown user"}
                  </div>
                  {a.message ? (
                    <div className="text-xs text-zinc-400 mt-1">{a.message}</div>
                  ) : null}
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

