import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const form = await prisma.form.findFirst({
    where: { slug: "vJYKDAXV" },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!form) {
    console.log("form not found");
    return;
  }
  console.log("form:", form.title, "| status:", form.status, "| slug:", form.slug);
  console.log("questions:", form.questions.length);
  for (const q of form.questions) {
    console.log(
      `  #${q.order} [${q.type}] "${q.label}" | options=${JSON.stringify(q.options)} | required=${q.required}` +
        ` | placeholder=${JSON.stringify(q.placeholder)} textColor=${JSON.stringify(q.textColor)}` +
        ` fontSize=${q.fontSize} fontWeight=${JSON.stringify(q.fontWeight)} fontStyle=${JSON.stringify(q.fontStyle)}`,
    );
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
