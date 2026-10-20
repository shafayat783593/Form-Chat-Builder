// Runs under `npx tsx prisma/seed.ts` — relative imports only (no @/),
// per the Prisma 7 rules in PRD section 3.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed@example.com" },
    update: {},
    create: { id: "seed-user", name: "Seed", email: "seed@example.com", emailVerified: true },
  });

  await prisma.form.upsert({
    where: { slug: "demo123" },
    update: {},
    create: {
      slug: "demo123",
      title: "Demo form",
      status: "PUBLISHED",
      ownerId: user.id,
      questions: {
        create: [
          { type: "TEXT", label: "What's your name?", order: 0 },
          { type: "EMAIL", label: "Your email?", order: 1 },
          { type: "CHOICE", label: "How did you find us?", options: ["Google", "Friend", "Other"], order: 2, required: false },
          { type: "YES_NO", label: "Subscribe to updates?", order: 3 },
        ],
      },
    },
  });
}

main().finally(() => prisma.$disconnect());
