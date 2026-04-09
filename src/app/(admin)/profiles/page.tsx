import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const profiles = await prisma.suspectProfile.findMany({
    where: query
      ? {
          OR: [
            { platform: { contains: query, mode: "insensitive" } },
            { profileUrl: { contains: query, mode: "insensitive" } },
            { handle: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { case: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Profiles" />
      <main className="p-4 lg:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Search profiles</div>
            <div className="text-xs text-zinc-400">Search platform, handle, or URL.</div>
          </CardHeader>
          <CardBody>
            <form className="flex gap-2">
              <Input name="q" defaultValue={query} placeholder="Search…" />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Recent profiles</div>
            <div className="text-xs text-zinc-400">
              Showing {profiles.length} profile(s){query ? ` for “${query}”` : ""}.
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {profiles.length === 0 ? (
              <div className="text-sm text-zinc-400">No profiles found.</div>
            ) : (
              profiles.map((p) => (
                <div key={p.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold">{p.platform}</div>
                        {p.handle ? <Badge>{p.handle}</Badge> : null}
                      </div>
                      <a
                        href={p.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-400 hover:underline break-all"
                      >
                        {p.profileUrl}
                      </a>
                      <div className="text-xs text-zinc-400 mt-1">
                        Case:{" "}
                        <Link href={`/cases/${p.caseId}`} className="hover:underline">
                          {p.case.title}
                        </Link>
                      </div>
                      {p.notes ? (
                        <div className="text-xs text-zinc-500 mt-2">{p.notes}</div>
                      ) : null}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {p.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                    </div>
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

