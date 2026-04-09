import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import {
  addEvidenceItem,
  addMessageEntry,
  addPaymentDetail,
  addSuspectProfile,
  addTimelineEvent,
  deleteEvidenceItem,
  deleteMessageEntry,
  deletePaymentDetail,
  deleteSuspectProfile,
  deleteTimelineEvent,
  linkDiagnosticSession,
  unlinkDiagnosticSession,
  updateCase,
} from "@/app/(admin)/cases/actions";

export const dynamic = "force-dynamic";

function riskColor(risk: string) {
  if (risk === "CRITICAL") return "red";
  if (risk === "HIGH") return "amber";
  if (risk === "LOW") return "emerald";
  return "zinc";
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      suspectProfiles: { orderBy: { createdAt: "desc" } },
      timelineEvents: { orderBy: { occurredAt: "desc" } },
      messageEntries: { orderBy: { createdAt: "desc" } },
      paymentDetails: { orderBy: { createdAt: "desc" } },
      evidenceItems: { orderBy: { createdAt: "desc" } },
      diagnosticLinks: {
        include: { diagnosticSession: true },
        orderBy: { linkedAt: "desc" },
      },
    },
  });
  if (!c) return notFound();

  const availableSessions = await prisma.diagnosticSession.findMany({
    where: { status: "ACCEPTED" },
    orderBy: { consentedAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Case" />
      <main className="p-4 lg:p-6 space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xl font-semibold">{c.title}</div>
              <Badge color={riskColor(c.riskLevel)}>{c.riskLevel}</Badge>
              <Badge>{c.status}</Badge>
            </div>
            <div className="text-sm text-zinc-400">
              {c.platform ? `${c.platform} • ` : ""}
              Created {c.createdAt.toISOString().slice(0, 10)}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/reports/${c.id}`}
              className="h-10 px-4 text-sm inline-flex items-center rounded-md bg-white text-zinc-950 hover:bg-zinc-100"
            >
              Export PDF report
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Case details</div>
            <div className="text-xs text-zinc-400">
              Update summary, platform, risk level, and status.
            </div>
          </CardHeader>
          <CardBody>
            <form action={updateCase.bind(null, c.id)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Title</label>
                <Input name="title" defaultValue={c.title} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Platform</label>
                <Input name="platform" defaultValue={c.platform ?? ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">Description</label>
                <Textarea name="description" defaultValue={c.description ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Risk level</label>
                <select
                  name="riskLevel"
                  className="h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 ring-1 ring-inset ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300/20"
                  defaultValue={c.riskLevel}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Status</label>
                <Input name="status" defaultValue={c.status} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="secondary">
                  Save changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="text-sm font-semibold">Suspected profiles</div>
              <div className="text-xs text-zinc-400">
                Add profile URLs and handles (entered manually).
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <form action={addSuspectProfile.bind(null, c.id)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="platform" placeholder="Platform (e.g. Telegram)" required />
                <Input name="profileUrl" placeholder="Profile URL" required />
                <Input name="handle" placeholder="Handle (optional)" />
                <Input name="notes" placeholder="Notes (optional)" />
                <div className="md:col-span-2">
                  <Button type="submit" variant="secondary">
                    Add profile
                  </Button>
                </div>
              </form>
              <div className="space-y-2">
                {c.suspectProfiles.length === 0 ? (
                  <div className="text-sm text-zinc-400">No profiles yet.</div>
                ) : (
                  c.suspectProfiles.map((p) => (
                    <div key={p.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">
                            {p.platform} {p.handle ? <span className="text-zinc-400">{p.handle}</span> : null}
                          </div>
                          <a className="text-xs text-zinc-400 hover:underline break-all" href={p.profileUrl} target="_blank" rel="noreferrer">
                            {p.profileUrl}
                          </a>
                          {p.notes ? <div className="text-xs text-zinc-500 mt-1">{p.notes}</div> : null}
                        </div>
                        <form action={deleteSuspectProfile.bind(null, c.id, p.id)}>
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
              <div className="text-sm font-semibold">Timeline</div>
              <div className="text-xs text-zinc-400">
                Record key events with timestamps.
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <form action={addTimelineEvent.bind(null, c.id)} className="grid grid-cols-1 gap-3">
                <Input name="title" placeholder="Event title" required />
                <Input name="description" placeholder="Description (optional)" />
                <Input name="occurredAt" type="datetime-local" required />
                <Button type="submit" variant="secondary">
                  Add timeline event
                </Button>
              </form>
              <div className="space-y-2">
                {c.timelineEvents.length === 0 ? (
                  <div className="text-sm text-zinc-400">No timeline events yet.</div>
                ) : (
                  c.timelineEvents.map((ev) => (
                    <div key={ev.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{ev.title}</div>
                          <div className="text-xs text-zinc-400">
                            {ev.occurredAt.toISOString().replace("T", " ").slice(0, 16)}
                          </div>
                          {ev.description ? <div className="text-xs text-zinc-500 mt-1">{ev.description}</div> : null}
                        </div>
                        <form action={deleteTimelineEvent.bind(null, c.id, ev.id)}>
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
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="text-sm font-semibold">Transcripts</div>
              <div className="text-xs text-zinc-400">
                Manually save chat excerpts (do not paste credentials).
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <form action={addMessageEntry.bind(null, c.id)} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input name="speaker" placeholder="Speaker (optional)" />
                  <Input name="source" placeholder="Source (optional)" />
                </div>
                <Textarea name="content" placeholder="Transcript text" required />
                <Input name="occurredAt" type="datetime-local" />
                <Button type="submit" variant="secondary">
                  Add transcript entry
                </Button>
              </form>
              <div className="space-y-2">
                {c.messageEntries.length === 0 ? (
                  <div className="text-sm text-zinc-400">No transcript entries yet.</div>
                ) : (
                  c.messageEntries.map((m) => (
                    <div key={m.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-zinc-400">
                            {(m.speaker ?? "Unknown") + (m.source ? ` • ${m.source}` : "")}
                            {m.occurredAt ? ` • ${m.occurredAt.toISOString().slice(0, 16).replace("T", " ")}` : ""}
                          </div>
                          <div className="text-sm text-zinc-100 whitespace-pre-wrap mt-1">
                            {m.content}
                          </div>
                        </div>
                        <form action={deleteMessageEntry.bind(null, c.id, m.id)}>
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
              <div className="text-sm font-semibold">Payment / account details</div>
              <div className="text-xs text-zinc-400">
                Enter manually provided details (unverified).
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <form action={addPaymentDetail.bind(null, c.id)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="iban" placeholder="IBAN (optional)" />
                <Input name="bankName" placeholder="Bank name (optional)" />
                <Input name="accountHolder" placeholder="Account holder (optional)" />
                <Input name="cryptoWallet" placeholder="Crypto wallet (optional)" />
                <Input name="email" placeholder="Email (optional)" />
                <Input name="phoneNumber" placeholder="Phone number (optional)" />
                <div className="md:col-span-2">
                  <Input name="notes" placeholder="Notes (optional)" />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" variant="secondary">
                    Add payment detail
                  </Button>
                </div>
              </form>
              <div className="space-y-2">
                {c.paymentDetails.length === 0 ? (
                  <div className="text-sm text-zinc-400">No payment details yet.</div>
                ) : (
                  c.paymentDetails.map((p) => (
                    <div key={p.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm text-zinc-100 space-y-1">
                          {p.iban ? <div><span className="text-zinc-400">IBAN:</span> {p.iban}</div> : null}
                          {p.bankName ? <div><span className="text-zinc-400">Bank:</span> {p.bankName}</div> : null}
                          {p.accountHolder ? <div><span className="text-zinc-400">Holder:</span> {p.accountHolder}</div> : null}
                          {p.cryptoWallet ? <div className="break-all"><span className="text-zinc-400">Wallet:</span> {p.cryptoWallet}</div> : null}
                          {p.email ? <div><span className="text-zinc-400">Email:</span> {p.email}</div> : null}
                          {p.phoneNumber ? <div><span className="text-zinc-400">Phone:</span> {p.phoneNumber}</div> : null}
                          {p.notes ? <div className="text-zinc-500 text-xs">{p.notes}</div> : null}
                        </div>
                        <form action={deletePaymentDetail.bind(null, c.id, p.id)}>
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
        </div>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Evidence</div>
            <div className="text-xs text-zinc-400">
              Add notes, links, transcript snippets, and upload screenshots/files.
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <form
              method="post"
              action="/api/uploads"
              encType="multipart/form-data"
              className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg ring-1 ring-inset ring-zinc-800 p-3"
            >
              <input type="hidden" name="caseId" value={c.id} />
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Upload title</label>
                <Input name="title" placeholder="e.g. Screenshot of payment request" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Tags (comma-separated)</label>
                <Input name="tags" placeholder="screenshot, payment, chat" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">File</label>
                <input
                  name="file"
                  type="file"
                  required
                  className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-50 hover:file:bg-zinc-800"
                  accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
                />
                <div className="text-xs text-zinc-500">
                  Allowed: PNG/JPG/WEBP/PDF/TXT, max 10MB.
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="secondary">
                  Upload to case
                </Button>
              </div>
            </form>

            <form action={addEvidenceItem.bind(null, c.id)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Type</label>
                <select
                  name="type"
                  className="h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 ring-1 ring-inset ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300/20"
                  defaultValue="NOTE"
                >
                  <option value="NOTE">NOTE</option>
                  <option value="LINK">LINK</option>
                  <option value="TRANSCRIPT">TRANSCRIPT</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Title</label>
                <Input name="title" placeholder="Evidence title" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">Description</label>
                <Input name="description" placeholder="Optional description" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">URL (for LINK type)</label>
                <Input name="url" placeholder="https://..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">Text content (for NOTE/TRANSCRIPT)</label>
                <Textarea name="textContent" placeholder="Optional text" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Tags (comma-separated)</label>
                <Input name="tags" placeholder="payment, chat, screenshot" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Occurred at</label>
                <Input name="occurredAt" type="datetime-local" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="secondary">
                  Add evidence
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {c.evidenceItems.length === 0 ? (
                <div className="text-sm text-zinc-400">No evidence yet.</div>
              ) : (
                c.evidenceItems.map((e) => (
                  <div key={e.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold">{e.title}</div>
                          <Badge>{e.type}</Badge>
                          {e.tags.slice(0, 6).map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                        </div>
                        {e.url ? (
                          <a className="text-xs text-zinc-400 hover:underline break-all" href={e.url} target="_blank" rel="noreferrer">
                            {e.url}
                          </a>
                        ) : null}
                        {e.storageKey ? (
                          <a
                            className="text-xs text-zinc-400 hover:underline break-all"
                            href={`/api/uploads/${e.storageKey}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {e.fileName ?? e.storageKey} ({e.fileMime ?? "file"})
                          </a>
                        ) : null}
                        {e.textContent ? (
                          <div className="text-sm text-zinc-100 whitespace-pre-wrap mt-2">
                            {e.textContent}
                          </div>
                        ) : null}
                        {e.occurredAt ? (
                          <div className="text-xs text-zinc-500 mt-2">
                            Occurred {e.occurredAt.toISOString().slice(0, 16).replace("T", " ")}
                          </div>
                        ) : null}
                      </div>
                      <form action={deleteEvidenceItem.bind(null, c.id, e.id)}>
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
            <div className="text-sm font-semibold">Diagnostic sessions</div>
            <div className="text-xs text-zinc-400">
              Link voluntary, consent-based diagnostic sessions to this case.
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <form
              action={async (fd) => {
                "use server";
                const sessionId = String(fd.get("sessionId") ?? "");
                await linkDiagnosticSession(c.id, sessionId);
              }}
              className="flex flex-col md:flex-row gap-3 md:items-end"
            >
              <div className="flex-1 space-y-2">
                <label className="text-xs text-zinc-400">
                  Link recent accepted session
                </label>
                <select
                  name="sessionId"
                  className="h-10 w-full rounded-md bg-zinc-950 px-3 text-sm text-zinc-100 ring-1 ring-inset ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300/20"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a session…
                  </option>
                  {availableSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.ipCountry ?? "Unknown country"}{" "}
                      {s.consentedAt ? `— ${s.consentedAt.toISOString().slice(0, 16).replace("T", " ")}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="secondary">
                Link session
              </Button>
            </form>

            <div className="space-y-2">
              {c.diagnosticLinks.length === 0 ? (
                <div className="text-sm text-zinc-400">No linked sessions.</div>
              ) : (
                c.diagnosticLinks.map((l) => (
                  <div key={l.id} className="rounded-lg ring-1 ring-inset ring-zinc-800 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm text-zinc-100">
                        <div className="text-xs text-zinc-400">
                          Session {l.diagnosticSession.id}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {[
                            l.diagnosticSession.ipCountry,
                            l.diagnosticSession.ipRegion,
                            l.diagnosticSession.ipCity,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Location not available"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {[
                            l.diagnosticSession.browserName
                              ? `${l.diagnosticSession.browserName} ${l.diagnosticSession.browserVersion ?? ""}`.trim()
                              : null,
                            l.diagnosticSession.osName
                              ? `${l.diagnosticSession.osName} ${l.diagnosticSession.osVersion ?? ""}`.trim()
                              : null,
                            l.diagnosticSession.deviceType,
                          ]
                            .filter(Boolean)
                            .join(" • ") || "Client info not available"}
                        </div>
                      </div>
                      <form action={unlinkDiagnosticSession.bind(null, c.id, l.id)}>
                        <Button type="submit" variant="danger" size="sm">
                          Unlink
                        </Button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

