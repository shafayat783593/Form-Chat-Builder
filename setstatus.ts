import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const status = process.argv[2] as "DRAFT" | "PUBLISHED";
  const slug = process.argv[3] ?? "e2etest1";
  await prisma.form.updateMany({ where: { slug }, data: { status } });
  const counts = await prisma.form.findMany({
    where: { slug },
    select: { slug: true, status: true, _count: { select: { questions: true, responses: true } } },
  });
  console.log(JSON.stringify(counts));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
