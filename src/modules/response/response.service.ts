import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { validateAnswer, type QuestionType } from "@/lib/field-types";
import type { SubmitResponseInput } from "./response.schema";

const PAGE_SIZE = 20;

/**
 * Public submission. Re-validates every answer on the server:
 * unknown question id -> 400, invalid/required answers -> 422 with per-question details.
 */
export async function submitResponse(slug: string, input: SubmitResponseInput) {
  const form = await prisma.form.findFirst({
    where: { slug, status: "PUBLISHED", isTemplate: false },
    select: {
      id: true,
      questions: {
        select: {
          id: true,
          type: true,
          label: true,
          options: true,
          required: true,
        },
      },
    },
  });

  if (!form) throw new AppError(404, "Form not found");

  const questions = new Map(form.questions.map((q) => [q.id, q]));
  const details: Record<string, string> = {};

  // Unknown question ids are a client bug, not a validation error.
  for (const answer of input.answers) {
    if (!questions.has(answer.questionId)) {
      throw new AppError(400, `Unknown question id: ${answer.questionId}`);
    }
  }

  // One answer per question.
  const seen = new Set<string>();
  for (const answer of input.answers) {
    if (seen.has(answer.questionId)) {
      throw new AppError(400, "Duplicate answer for the same question");
    }
    seen.add(answer.questionId);
  }

  // Required questions must be answered.
  for (const question of form.questions) {
    if (!question.required) continue;
    const answer = input.answers.find((a) => a.questionId === question.id);
    if (!answer || answer.value.trim() === "") {
      details[question.id] = "This question is required";
    }
  }

  // Per-type validation (shared with the client).
  for (const answer of input.answers) {
    const question = questions.get(answer.questionId);
    if (!question) continue;
    const value = answer.value.trim();
    if (value === "") continue;

    const options = Array.isArray(question.options) ? (question.options as string[]) : null;
    const message = validateAnswer(question.type as QuestionType, value, options);
    if (message) details[question.id] = message;
  }

  if (Object.keys(details).length > 0) {
    throw new AppError(422, "Some answers are invalid", details);
  }

  const answers = input.answers
    .map((a) => ({ questionId: a.questionId, value: a.value.trim() }))
    .filter((a) => a.value !== "");

  return prisma.response.create({
    data: {
      formId: form.id,
      answers: { create: answers },
    },
    select: { id: true },
  });
}

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