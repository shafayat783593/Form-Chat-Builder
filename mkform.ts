import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const email = process.argv[2] ?? "dash@test.local";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`user ${email} not found`);

  const form = await prisma.form.create({
    data: {
      ownerId: user.id,
      slug: "e2etest1",
      title: "E2E Test Form",
      status: "PUBLISHED",
    },
    select: { id: true, slug: true },
  });

  const specs = [
    { type: "TEXT" as const, label: "Your name", required: true, options: undefined },
    { type: "EMAIL" as const, label: "Your email", required: true, options: undefined },
    {
      type: "CHOICE" as const,
      label: "Plan",
      required: false,
      options: ["free", "pro"],
    },
    { type: "YES_NO" as const, label: "Subscribe?", required: false, options: undefined },
  ];

  const ids: string[] = [];
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    const q = await prisma.question.create({
      data: { formId: form.id, order: i, ...s },
      select: { id: true },
    });
    ids.push(q.id);
  }

  console.log(JSON.stringify({ slug: form.slug, questionIds: ids }));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
