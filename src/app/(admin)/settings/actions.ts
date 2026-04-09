"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireUser";
import { auditLog } from "@/lib/audit";

function makeToken() {
  // URL-safe token (no PII). 32 bytes -> 43 chars base64url.
  return crypto.randomBytes(32).toString("base64url");
}

export async function createDiagnosticLink() {
  const user = await requireAdmin();
  const token = makeToken();
  const s = await prisma.diagnosticSession.create({
    data: { token, status: "PENDING" },
  });
  await auditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "DiagnosticSession",
    entityId: s.id,
    message: "Created public diagnostic link (pending consent).",
  });
  revalidatePath("/settings");
  return token;
}

export async function deleteDiagnosticLink(id: string) {
  const user = await requireAdmin();
  await prisma.diagnosticSession.delete({ where: { id } });
  await auditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "DiagnosticSession",
    entityId: id,
    message: "Deleted public diagnostic link/session.",
  });
  revalidatePath("/settings");
}

