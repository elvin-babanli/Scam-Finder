import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type {
  Case,
  EvidenceItem,
  MessageEntry,
  PaymentDetail,
  SuspectProfile,
  DiagnosticSession,
  TimelineEvent,
} from "@prisma/client";
import { uploadsDir } from "@/lib/storage";

export type CaseReportData = {
  c: Case;
  profiles: SuspectProfile[];
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
  messages: MessageEntry[];
  payments: PaymentDetail[];
  diagnosticSessions: DiagnosticSession[];
};

type Doc = InstanceType<typeof PDFDocument>;

function heading(doc: Doc, text: string) {
  doc.moveDown(0.5);
  doc.fontSize(16).fillColor("#111827").text(text);
  doc.moveDown(0.2);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor("#E5E7EB")
    .stroke();
  doc.moveDown(0.5);
}

function labelValue(doc: Doc, label: string, value: string) {
  doc.fontSize(10).fillColor("#6B7280").text(label, { continued: true });
  doc.fontSize(10).fillColor("#111827").text(` ${value}`);
}

export async function generateCasePdf(params: {
  data: CaseReportData;
  outPath: string;
  exportedAt: Date;
}) {
  const { data, outPath, exportedAt } = params;

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Scam Finder Report - ${data.c.title}`,
        Author: "Scam Finder",
      },
    });

    const out = fs.createWriteStream(outPath);
    doc.pipe(out);

    // Title
    doc.fontSize(22).fillColor("#111827").text("Scam Finder — Case Report");
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#111827").text(data.c.title);
    doc.moveDown(0.25);
    doc.fontSize(10).fillColor("#6B7280").text(`Exported: ${exportedAt.toISOString()}`);
    doc.moveDown(1);

    heading(doc, "Case summary");
    labelValue(doc, "Case ID:", data.c.id);
    labelValue(doc, "Platform:", data.c.platform ?? "—");
    labelValue(doc, "Risk level:", data.c.riskLevel);
    labelValue(doc, "Status:", data.c.status);
    doc.moveDown(0.5);
    if (data.c.description) {
      doc.fontSize(11).fillColor("#111827").text(data.c.description);
    } else {
      doc.fontSize(11).fillColor("#6B7280").text("No description provided.");
    }

    heading(doc, "Suspected profile links");
    if (data.profiles.length === 0) {
      doc.fontSize(11).fillColor("#6B7280").text("No profiles recorded.");
    } else {
      data.profiles.forEach((p) => {
        doc.fontSize(11).fillColor("#111827").text(`${p.platform}${p.handle ? ` (${p.handle})` : ""}`);
        doc.fontSize(10).fillColor("#2563EB").text(p.profileUrl);
        if (p.notes) doc.fontSize(10).fillColor("#374151").text(p.notes);
        doc.moveDown(0.3);
      });
    }

    heading(doc, "Evidence timeline");
    if (data.timeline.length === 0) {
      doc.fontSize(11).fillColor("#6B7280").text("No timeline events recorded.");
    } else {
      data.timeline.forEach((t) => {
        doc.fontSize(11).fillColor("#111827").text(t.title);
        doc
          .fontSize(10)
          .fillColor("#6B7280")
          .text(t.occurredAt.toISOString().replace("T", " ").slice(0, 19));
        if (t.description) doc.fontSize(10).fillColor("#374151").text(t.description);
        doc.moveDown(0.3);
      });
    }

    heading(doc, "Evidence items");
    if (data.evidence.length === 0) {
      doc.fontSize(11).fillColor("#6B7280").text("No evidence recorded.");
    } else {
      data.evidence.forEach((e) => {
        doc.fontSize(11).fillColor("#111827").text(`${e.title} (${e.type})`);
        if (e.occurredAt) {
          doc
            .fontSize(10)
            .fillColor("#6B7280")
            .text(`Occurred: ${e.occurredAt.toISOString().replace("T", " ").slice(0, 19)}`);
        }
        if (e.description) doc.fontSize(10).fillColor("#374151").text(e.description);
        if (e.url) doc.fontSize(10).fillColor("#2563EB").text(e.url);
        if (e.textContent) {
          const excerpt =
            e.textContent.length > 1200 ? e.textContent.slice(0, 1200) + "…" : e.textContent;
          doc.fontSize(10).fillColor("#111827").text(excerpt);
        }
        if (e.tags?.length) {
          doc.fontSize(9).fillColor("#6B7280").text(`Tags: ${e.tags.join(", ")}`);
        }

        // Screenshot preview (best-effort; only local stored images)
        if (e.storageKey && e.fileMime?.startsWith("image/")) {
          const imgPath = path.join(uploadsDir(), e.storageKey);
          try {
            if (fs.existsSync(imgPath)) {
              doc.moveDown(0.2);
              doc.image(imgPath, { fit: [500, 280] });
            }
          } catch {
            // ignore image errors; keep report generation robust
          }
        }

        doc.moveDown(0.6);
      });
    }

    heading(doc, "Transcript excerpts");
    if (data.messages.length === 0) {
      doc.fontSize(11).fillColor("#6B7280").text("No transcript entries recorded.");
    } else {
      data.messages.slice(0, 40).forEach((m) => {
        const meta = [
          m.speaker ?? "Unknown",
          m.source ?? undefined,
          m.occurredAt ? m.occurredAt.toISOString().replace("T", " ").slice(0, 19) : undefined,
        ]
          .filter(Boolean)
          .join(" • ");
        doc.fontSize(10).fillColor("#6B7280").text(meta);
        const excerpt = m.content.length > 1000 ? m.content.slice(0, 1000) + "…" : m.content;
        doc.fontSize(10).fillColor("#111827").text(excerpt);
        doc.moveDown(0.4);
      });
      if (data.messages.length > 40) {
        doc.fontSize(10).fillColor("#6B7280").text("…more entries omitted for brevity.");
      }
    }

    heading(doc, "Payment/account details (manual)");
    if (data.payments.length === 0) {
      doc.fontSize(11).fillColor("#6B7280").text("No payment/account details recorded.");
    } else {
      data.payments.forEach((p) => {
        const rows: Array<[string, string | undefined | null]> = [
          ["IBAN:", p.iban],
          ["Bank:", p.bankName],
          ["Holder:", p.accountHolder],
          ["Wallet:", p.cryptoWallet],
          ["Email:", p.email],
          ["Phone:", p.phoneNumber],
        ];
        rows.forEach(([lab, val]) => {
          if (!val) return;
          labelValue(doc, lab, val);
        });
        if (p.notes) doc.fontSize(10).fillColor("#374151").text(p.notes);
        doc.moveDown(0.4);
      });
    }

    heading(doc, "Diagnostic session summary (consent-based)");
    if (data.diagnosticSessions.length === 0) {
      doc.fontSize(11).fillColor("#6B7280").text("No diagnostic sessions linked.");
    } else {
      data.diagnosticSessions.forEach((s) => {
        doc.fontSize(10).fillColor("#6B7280").text(`Session: ${s.id}`);
        const loc = [s.ipCountry, s.ipRegion, s.ipCity].filter(Boolean).join(", ");
        doc.fontSize(10).fillColor("#111827").text(`Approx location: ${loc || "—"}`);
        if (s.isp) doc.fontSize(10).fillColor("#111827").text(`ISP/Org: ${s.isp}`);
        const client = [
          s.browserName ? `${s.browserName} ${s.browserVersion ?? ""}`.trim() : null,
          s.osName ? `${s.osName} ${s.osVersion ?? ""}`.trim() : null,
          s.deviceType,
          s.language,
          s.timezone,
        ]
          .filter(Boolean)
          .join(" • ");
        doc.fontSize(10).fillColor("#374151").text(client || "Client info not available.");
        doc
          .fontSize(10)
          .fillColor("#6B7280")
          .text(
            `Optional consents: preciseGeo=${s.preciseGeoAllowed ? "yes" : "no"}, camera=${s.cameraTestAllowed ? "yes" : "no"}, mic=${s.micTestAllowed ? "yes" : "no"}`,
          );
        doc.moveDown(0.4);
      });
    }

    doc.end();

    out.on("finish", () => resolve());
    out.on("error", reject);
    doc.on("error", reject);
  });
}

