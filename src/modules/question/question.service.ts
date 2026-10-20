import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { hasOptions } from "@/lib/field-types";
import type { AddQuestionInput, UpdateQuestionInput } from "./question.schema";

export const MAX_QUESTIONS = 50;

async function assertFormOwner(formId: string, ownerId: string) {
  const form = await prisma.form.findFirst({
    where: { id: formId, ownerId },
    select: { id: true },
  });
  if (!form) throw new AppError(404, "Form not found");
}

async function getOwnedQuestion(id: string, ownerId: string) {
  const q = await prisma.question.findFirst({ where: { id, form: { ownerId } } });
  if (!q) throw new AppError(404, "Question not found");
  return q;
}

export async function addQuestion(formId: string, ownerId: string, input: AddQuestionInput) {
  await assertFormOwner(formId, ownerId);

  return prisma.$transaction(async (tx) => {
    const agg = await tx.question.aggregate({
      where: { formId },
      _max: { order: true },
      _count: true,
    });
    if (agg._count >= MAX_QUESTIONS)
      throw new AppError(422, `A form can have at most ${MAX_QUESTIONS} questions`);

    return tx.question.create({
      data: {
        formId,
        type: input.type,
        label: input.label,
        required: input.required,
        options: hasOptions(input.type) && "options" in input ? input.options : undefined,
        order: (agg._max.order ?? -1) + 1,
        placeholder: input.placeholder ?? null,
        textColor: input.textColor ?? null,
        fontSize: input.fontSize ?? null,
        fontWeight: input.fontWeight ?? null,
        fontStyle: input.fontStyle ?? null,
      },
      select: { id: true },
    });
  });
}

export async function updateQuestion(id: string, ownerId: string, input: UpdateQuestionInput) {
  const q = await getOwnedQuestion(id, ownerId);
  if (input.options !== undefined && !hasOptions(q.type))
    throw new AppError(422, "Only choice questions have options");

  const { count } = await prisma.question.updateMany({
    where: { id, form: { ownerId } },
    data: {
      label: input.label,
      required: input.required,
      options: input.options,
      placeholder: input.placeholder,
      textColor: input.textColor,
      fontSize: input.fontSize,
      fontWeight: input.fontWeight,
      fontStyle: input.fontStyle,
    },
  });
  if (count === 0) throw new AppError(404, "Question not found");
  return { formId: q.formId };
}

export async function deleteQuestion(id: string, ownerId: string) {
  const q = await getOwnedQuestion(id, ownerId);

  const form = await prisma.form.findUniqueOrThrow({
    where: { id: q.formId },
    select: { status: true, _count: { select: { questions: true } } },
  });
  // published ফর্ম প্রশ্নহীন হলে widget খালি চ্যাট দেখাত
  if (form.status === "PUBLISHED" && form._count.questions <= 1)
    throw new AppError(422, "Unpublish the form before deleting its last question");

  const { count } = await prisma.question.deleteMany({ where: { id, form: { ownerId } } });
  if (count === 0) throw new AppError(404, "Question not found");
  return { formId: q.formId };
}

export async function reorderQuestions(formId: string, ownerId: string, orderedIds: string[]) {
  await assertFormOwner(formId, ownerId);

  const existing = await prisma.question.findMany({ where: { formId }, select: { id: true } });
  const valid =
    existing.length === orderedIds.length &&
    new Set(orderedIds).size === orderedIds.length &&
    existing.every((q) => orderedIds.includes(q.id));
  if (!valid) throw new AppError(400, "Invalid question order");

  await prisma.$transaction(
    orderedIds.map((id, i) => prisma.question.update({ where: { id }, data: { order: i } })),
  );
}