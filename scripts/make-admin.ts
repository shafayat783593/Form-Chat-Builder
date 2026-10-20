import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";

/**
 * Promotes an existing user to ADMIN.
 *
 *   npx tsx scripts/make-admin.ts you@example.com          -> role = ADMIN
 *   npx tsx scripts/make-admin.ts you@example.com OWNER    -> demote back
 *   $env:ADMIN_EMAIL="you@example.com"; npx tsx scripts/make-admin.ts
 *
 * The user must already exist: there is no admin sign-up path, and no way to
 * create an admin through the UI or the API. Unknown emails are refused.
 */
async function main() {
  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const target = (process.argv[3] ?? "ADMIN").trim().toUpperCase();

  if (!email) {
    console.error("Usage: npx tsx scripts/make-admin.ts <email> [ADMIN|OWNER]");
    console.error("   or set ADMIN_EMAIL and run: npx tsx scripts/make-admin.ts");
    process.exit(1);
  }

  if (target !== Role.ADMIN && target !== Role.OWNER) {
    console.error(`Invalid role "${target}". Use ADMIN or OWNER.`);
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      console.error(`No user found with email "${email}". Sign up first, then run this script.`);
      process.exit(1);
    }

    await prisma.user.update({ where: { id: user.id }, data: { role: target } });

    console.log(`${user.email} (${user.name}) was ${user.role}, is now ${target}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
