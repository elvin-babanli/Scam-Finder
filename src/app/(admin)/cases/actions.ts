"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireUser";
import { auditLog } from "@/lib/audit";
import {
  createCaseSchema,
  evidenceItemSchema,
  messageEntrySchema,
  paymentDetailSchema,
  suspectProfileSchema,
  timelineEventSchema,
} from "@/lib/validators";

export async function createCase(formData: FormData) {
  const user = await requireAdmin();
  const parsed = createCaseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    platform: formData.get("platform"),
    riskLevel: formData.get("riskLevel"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("Invalid case data.");

  const c = await prisma.case.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      platform: parsed.data.platform || null,
      riskLevel: parsed.data.riskLevel,
      status: parsed.data.status,
    },
  });

  await auditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "Case",
    entityId: c.id,
    message: `Created case: ${c.title}`,
  });

  revalidatePath("/cases");
  redirect(`/cases/${c.id}`);
}

export async function deleteCase(caseId: string) {
  const user = await requireAdmin();
  const c = await prisma.case.findUnique({ where: { id: caseId } });
  if (!c) return;
  await prisma.case.delete({ where: { id: caseId } });
  await auditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "Case",
    entityId: caseId,
    message: `Deleted case: ${c.title}`,
  });
  revalidatePath("/cases");
}

export async function updateCase(caseId: string, formData: FormData) {
  const user = await requireAdmin();
  const parsed = createCaseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    platform: formData.get("platform"),
    riskLevel: formData.get("riskLevel"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("Invalid case data.");

  const c = await prisma.case.update({
    where: { id: caseId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      platform: parsed.data.platform || null,
      riskLevel: parsed.data.riskLevel,
      status: parsed.data.status,
    },
  });
  await auditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "Case",
    entityId: c.id,
    message: "Updated case details.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function addSuspectProfile(caseId: string, formData: FormData) {
  const user = await requireAdmin();
  const parsed = suspectProfileSchema.safeParse({
    platform: formData.get("platform"),
    profileUrl: formData.get("profileUrl"),
    handle: formData.get("handle"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) throw new Error("Invalid profile data.");

  const p = await prisma.suspectProfile.create({
    data: {
      caseId,
      platform: parsed.data.platform,
      profileUrl: parsed.data.profileUrl,
      handle: parsed.data.handle || null,
      notes: parsed.data.notes || null,
    },
  });

  await auditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "SuspectProfile",
    entityId: p.id,
    message: "Added suspect profile.",
  });

  revalidatePath(`/cases/${caseId}`);
}

export async function deleteSuspectProfile(caseId: string, profileId: string) {
  const user = await requireAdmin();
  await prisma.suspectProfile.delete({ where: { id: profileId } });
  await auditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "SuspectProfile",
    entityId: profileId,
    message: "Deleted suspect profile.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function addTimelineEvent(caseId: string, formData: FormData) {
  const user = await requireAdmin();
  const parsed = timelineEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) throw new Error("Invalid timeline event.");

  const ev = await prisma.timelineEvent.create({
    data: {
      caseId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      occurredAt: new Date(parsed.data.occurredAt),
    },
  });
  await auditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "TimelineEvent",
    entityId: ev.id,
    message: "Added timeline event.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function deleteTimelineEvent(caseId: string, eventId: string) {
  const user = await requireAdmin();
  await prisma.timelineEvent.delete({ where: { id: eventId } });
  await auditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "TimelineEvent",
    entityId: eventId,
    message: "Deleted timeline event.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function addMessageEntry(caseId: string, formData: FormData) {
  const user = await requireAdmin();
  const parsed = messageEntrySchema.safeParse({
    source: formData.get("source"),
    speaker: formData.get("speaker"),
    content: formData.get("content"),
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) throw new Error("Invalid transcript entry.");

  const occurredAt =
    parsed.data.occurredAt && parsed.data.occurredAt !== ""
      ? new Date(parsed.data.occurredAt)
      : null;

  const m = await prisma.messageEntry.create({
    data: {
      caseId,
      source: parsed.data.source || null,
      speaker: parsed.data.speaker || null,
      content: parsed.data.content,
      occurredAt,
    },
  });
  await auditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "MessageEntry",
    entityId: m.id,
    message: "Added transcript entry.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function deleteMessageEntry(caseId: string, entryId: string) {
  const user = await requireAdmin();
  await prisma.messageEntry.delete({ where: { id: entryId } });
  await auditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "MessageEntry",
    entityId: entryId,
    message: "Deleted transcript entry.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function addPaymentDetail(caseId: string, formData: FormData) {
  const user = await requireAdmin();
  const parsed = paymentDetailSchema.safeParse({
    iban: formData.get("iban"),
    bankName: formData.get("bankName"),
    accountHolder: formData.get("accountHolder"),
    cryptoWallet: formData.get("cryptoWallet"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) throw new Error("Invalid payment detail.");

  const p = await prisma.paymentDetail.create({
    data: {
      caseId,
      iban: parsed.data.iban || null,
      bankName: parsed.data.bankName || null,
      accountHolder: parsed.data.accountHolder || null,
      cryptoWallet: parsed.data.cryptoWallet || null,
      email: parsed.data.email || null,
      phoneNumber: parsed.data.phoneNumber || null,
      notes: parsed.data.notes || null,
    },
  });
  await auditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "PaymentDetail",
    entityId: p.id,
    message: "Added payment/account detail.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function deletePaymentDetail(caseId: string, paymentId: string) {
  const user = await requireAdmin();
  await prisma.paymentDetail.delete({ where: { id: paymentId } });
  await auditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "PaymentDetail",
    entityId: paymentId,
    message: "Deleted payment/account detail.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function addEvidenceItem(caseId: string, formData: FormData) {
  const user = await requireAdmin();
  const parsed = evidenceItemSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    tags: formData.get("tags"),
    url: formData.get("url"),
    textContent: formData.get("textContent"),
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) throw new Error("Invalid evidence item.");

  const tags =
    parsed.data.tags && parsed.data.tags.trim()
      ? parsed.data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 30)
      : [];

  const occurredAt =
    parsed.data.occurredAt && parsed.data.occurredAt !== ""
      ? new Date(parsed.data.occurredAt)
      : null;

  const ev = await prisma.evidenceItem.create({
    data: {
      caseId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      tags,
      url: parsed.data.url || null,
      textContent: parsed.data.textContent || null,
      occurredAt,
    },
  });

  await auditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "EvidenceItem",
    entityId: ev.id,
    message: "Added evidence item.",
  });

  revalidatePath(`/cases/${caseId}`);
}

export async function deleteEvidenceItem(caseId: string, evidenceId: string) {
  const user = await requireAdmin();
  await prisma.evidenceItem.delete({ where: { id: evidenceId } });
  await auditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "EvidenceItem",
    entityId: evidenceId,
    message: "Deleted evidence item.",
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function linkDiagnosticSession(caseId: string, sessionId: string) {
  const user = await requireAdmin();
  const parsed = z.string().min(1).safeParse(sessionId);
  if (!parsed.success) throw new Error("Invalid session id.");

  await prisma.caseDiagnosticSession.upsert({
    where: {
      caseId_diagnosticSessionId: { caseId, diagnosticSessionId: sessionId },
    },
    update: {},
    create: { caseId, diagnosticSessionId: sessionId },
  });

  await auditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "Case",
    entityId: caseId,
    message: "Linked diagnostic session to case.",
  });

  revalidatePath(`/cases/${caseId}`);
}

export async function unlinkDiagnosticSession(caseId: string, linkId: string) {
  const user = await requireAdmin();
  await prisma.caseDiagnosticSession.delete({ where: { id: linkId } });
  await auditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "Case",
    entityId: caseId,
    message: "Unlinked diagnostic session from case.",
  });
  revalidatePath(`/cases/${caseId}`);
}

