import { z } from "zod";

export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const createCaseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  platform: z.string().max(120).optional().or(z.literal("")),
  riskLevel: riskLevelSchema.default("MEDIUM"),
  status: z.string().max(50).default("OPEN"),
});

export const caseIdSchema = z.object({ caseId: z.string().min(1) });

export const suspectProfileSchema = z.object({
  platform: z.string().min(2).max(120),
  profileUrl: z.string().url().max(1000),
  handle: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const timelineEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  occurredAt: z.string().datetime(),
});

export const messageEntrySchema = z.object({
  source: z.string().max(200).optional().or(z.literal("")),
  speaker: z.string().max(120).optional().or(z.literal("")),
  content: z.string().min(1).max(20000),
  occurredAt: z.string().datetime().optional().or(z.literal("")),
});

export const paymentDetailSchema = z.object({
  iban: z.string().max(64).optional().or(z.literal("")),
  bankName: z.string().max(200).optional().or(z.literal("")),
  accountHolder: z.string().max(200).optional().or(z.literal("")),
  cryptoWallet: z.string().max(256).optional().or(z.literal("")),
  email: z.string().email().max(320).optional().or(z.literal("")),
  phoneNumber: z.string().max(64).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const evidenceItemSchema = z.object({
  type: z.enum([
    "SCREENSHOT",
    "FILE",
    "TRANSCRIPT",
    "LINK",
    "NOTE",
    "PAYMENT_DETAIL",
    "DIAGNOSTIC_SESSION",
  ]),
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  tags: z.string().max(300).optional().or(z.literal("")),
  url: z.string().url().max(2000).optional().or(z.literal("")),
  textContent: z.string().max(20000).optional().or(z.literal("")),
  occurredAt: z.string().datetime().optional().or(z.literal("")),
});

