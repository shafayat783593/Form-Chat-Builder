import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function listResponsesForOwner(formId: string, ownerId: string, page = 1) {
  const form = await prisma.form.findFirst({
    where: { id: formId, ownerId },
    select: {
      id: true, title: true, slug: true,
      questions: { orderBy: { order: "asc" }, select: { id: true, label: true, type: true } },
    },
  });
  if (!form) throw new AppError(404, "Form not found");

  const safePage = Math.max(1, Math.floor(page) || 1);
  const [total, rows] = await Promise.all([
    prisma.response.count({ where: { formId } }),
    prisma.response.findMany({
      where: { formId },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, createdAt: true,
        answers: { select: { questionId: true, value: true } },
      },
    }),
  ]);

  return {
    form: { id: form.id, title: form.title, slug: form.slug },
    questions: form.questions,
    total, page: safePage, pageSize: PAGE_SIZE,
    responses: rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      answers: Object.fromEntries(r.answers.map((a) => [a.questionId, a.value])),
    })),
  };
}

export async function getResponseForOwner(id: string, ownerId: string) {
  const r = await prisma.response.findFirst({
    where: { id, form: { ownerId } },
    select: {
      id: true, createdAt: true,
      form: { select: { id: true, title: true } },
      answers: {
        select: { value: true, question: { select: { id: true, label: true, type: true, order: true } } },
      },
    },
  });
  if (!r) throw new AppError(404, "Response not found");

  return {
    id: r.id,
    createdAt: r.createdAt,
    form: r.form,
    answers: r.answers
      .sort((a, b) => a.question.order - b.question.order)
      .map((a) => ({
        questionId: a.question.id, label: a.question.label,
        type: a.question.type, value: a.value,
      })),
  };
}

export async function deleteResponse(id: string, ownerId: string) {
  const r = await prisma.response.findFirst({
    where: { id, form: { ownerId } },
    select: { formId: true },
  });
  if (!r) throw new AppError(404, "Response not found");
  await prisma.response.delete({ where: { id } });
  return { formId: r.formId };
}