import { PrismaClient, RiskLevel, EvidenceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function main() {
  const adminEmail = requireEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = requireEnv("ADMIN_PASSWORD");
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  const demoCase = await prisma.case.upsert({
    where: { id: "demo_case" },
    update: {},
    create: {
      id: "demo_case",
      title: "Demo: Suspicious Marketplace Seller",
      description:
        "Example case showing how to store profiles, timeline events, transcripts, and payment details. Replace with real case data.",
      platform: "Instagram",
      riskLevel: RiskLevel.HIGH,
      tags: ["demo", "marketplace"],
      suspectProfiles: {
        create: [
          {
            platform: "Instagram",
            profileUrl: "https://instagram.com/example_suspect",
            handle: "@example_suspect",
            notes: "Claims to be a verified seller; asks to move chat to Telegram.",
          },
        ],
      },
      timelineEvents: {
        create: [
          {
            title: "Initial contact",
            description: "Victim contacted seller about a listing.",
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          },
          {
            title: "Requested off-platform payment",
            description: "Asked for bank transfer; provided IBAN.",
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          },
        ],
      },
      messageEntries: {
        create: [
          {
            source: "Manual entry",
            speaker: "Suspect",
            content: "Please pay via bank transfer to reserve your item.",
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          },
          {
            source: "Manual entry",
            speaker: "Victim",
            content: "Can we use a platform escrow?",
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5),
          },
        ],
      },
      paymentDetails: {
        create: [
          {
            iban: "DE00 0000 0000 0000 0000 00",
            bankName: "Example Bank",
            accountHolder: "Example Holder",
            email: "billing@example.com",
            phoneNumber: "+1 555 0100",
            notes: "Entered manually by admin (unverified).",
          },
        ],
      },
      evidenceItems: {
        create: [
          {
            type: EvidenceType.LINK,
            title: "Suspect profile link",
            url: "https://instagram.com/example_suspect",
            tags: ["profile"],
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          },
          {
            type: EvidenceType.TRANSCRIPT,
            title: "Chat excerpt (manual)",
            textContent:
              "Suspect insisted on off-platform payment and refused to use escrow.",
            tags: ["chat", "payment"],
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          },
        ],
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entityType: "Seed",
      entityId: demoCase.id,
      message: "Seeded demo admin and demo case data.",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

