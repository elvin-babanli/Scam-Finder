import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EvidencePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const items = await prisma.evidenceItem.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        }
      : undefined,
    include: { case: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Evidence" />
      <main className="p-4 lg:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Search evidence</div>
            <div className="text-xs text-zinc-400">
              Search by title/description or exact tag match.
            </div>
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
            <div className="text-sm font-semibold">Recent evidence</div>
            <div className="text-xs text-zinc-400">
              Showing {items.length} item(s){query ? ` for “${query}”` : ""}.
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {items.length === 0 ? (
              <div className="text-sm text-zinc-400">No evidence found.</div>
            ) : (
              items.map((e) => (
                <div key={e.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold">{e.title}</div>
                        <Badge>{e.type}</Badge>
                        {e.tags.slice(0, 6).map((t) => (
                          <Badge key={t}>{t}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Case:{" "}
                        <Link href={`/cases/${e.caseId}`} className="hover:underline">
                          {e.case.title}
                        </Link>
                      </div>
                      {e.description ? (
                        <div className="text-xs text-zinc-500 mt-2">{e.description}</div>
                      ) : null}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {e.createdAt.toISOString().replace("T", " ").slice(0, 16)}
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

