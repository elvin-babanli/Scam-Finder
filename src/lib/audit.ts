import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@prisma/client";

export async function auditLog(params: {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  message?: string | null;
}) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;
  const ua = h.get("user-agent") ?? null;

  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      message: params.message ?? null,
      ipAddress: ip,
      userAgent: ua,
    },
  });
}

