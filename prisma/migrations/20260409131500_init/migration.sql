-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('SCREENSHOT', 'FILE', 'TRANSCRIPT', 'LINK', 'NOTE', 'PAYMENT_DETAIL', 'DIAGNOSTIC_SESSION');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuspectProfile" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "handle" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspectProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fileName" TEXT,
    "fileMime" TEXT,
    "fileSize" INTEGER,
    "storageKey" TEXT,
    "url" TEXT,
    "textContent" TEXT,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageEntry" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "source" TEXT,
    "speaker" TEXT,
    "content" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentDetail" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "iban" TEXT,
    "bankName" TEXT,
    "accountHolder" TEXT,
    "cryptoWallet" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "consentedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "ipCountry" TEXT,
    "ipRegion" TEXT,
    "ipCity" TEXT,
    "isp" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "browserName" TEXT,
    "browserVersion" TEXT,
    "osName" TEXT,
    "osVersion" TEXT,
    "deviceType" TEXT,
    "platform" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "networkType" TEXT,
    "preciseGeoAllowed" BOOLEAN NOT NULL DEFAULT false,
    "preciseLatitude" DOUBLE PRECISION,
    "preciseLongitude" DOUBLE PRECISION,
    "preciseGeoAt" TIMESTAMP(3),
    "cameraTestAllowed" BOOLEAN NOT NULL DEFAULT false,
    "cameraTestPassed" BOOLEAN,
    "micTestAllowed" BOOLEAN NOT NULL DEFAULT false,
    "micTestPassed" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDiagnosticSession" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "diagnosticSessionId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseDiagnosticSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportExport" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "exportedById" TEXT,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "message" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "SuspectProfile_caseId_idx" ON "SuspectProfile"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceItem_storageKey_key" ON "EvidenceItem"("storageKey");

-- CreateIndex
CREATE INDEX "EvidenceItem_caseId_idx" ON "EvidenceItem"("caseId");

-- CreateIndex
CREATE INDEX "EvidenceItem_type_idx" ON "EvidenceItem"("type");

-- CreateIndex
CREATE INDEX "MessageEntry_caseId_idx" ON "MessageEntry"("caseId");

-- CreateIndex
CREATE INDEX "PaymentDetail_caseId_idx" ON "PaymentDetail"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticSession_token_key" ON "DiagnosticSession"("token");

-- CreateIndex
CREATE INDEX "CaseDiagnosticSession_caseId_idx" ON "CaseDiagnosticSession"("caseId");

-- CreateIndex
CREATE INDEX "CaseDiagnosticSession_diagnosticSessionId_idx" ON "CaseDiagnosticSession"("diagnosticSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseDiagnosticSession_caseId_diagnosticSessionId_key" ON "CaseDiagnosticSession"("caseId", "diagnosticSessionId");

-- CreateIndex
CREATE INDEX "TimelineEvent_caseId_idx" ON "TimelineEvent"("caseId");

-- CreateIndex
CREATE INDEX "TimelineEvent_occurredAt_idx" ON "TimelineEvent"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReportExport_storageKey_key" ON "ReportExport"("storageKey");

-- CreateIndex
CREATE INDEX "ReportExport_caseId_idx" ON "ReportExport"("caseId");

-- CreateIndex
CREATE INDEX "ReportExport_exportedById_idx" ON "ReportExport"("exportedById");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "SuspectProfile" ADD CONSTRAINT "SuspectProfile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageEntry" ADD CONSTRAINT "MessageEntry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentDetail" ADD CONSTRAINT "PaymentDetail_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDiagnosticSession" ADD CONSTRAINT "CaseDiagnosticSession_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDiagnosticSession" ADD CONSTRAINT "CaseDiagnosticSession_diagnosticSessionId_fkey" FOREIGN KEY ("diagnosticSessionId") REFERENCES "DiagnosticSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExport" ADD CONSTRAINT "ReportExport_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExport" ADD CONSTRAINT "ReportExport_exportedById_fkey" FOREIGN KEY ("exportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

