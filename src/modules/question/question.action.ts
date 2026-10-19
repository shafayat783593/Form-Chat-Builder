"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { run } from "@/lib/action";
import { addQuestionSchema, updateQuestionSchema, reorderSchema } from "./question.schema";
import * as questionService from "./question.service";

const idSchema = z.string().min(1);
const editPath = (formId: string) => `/dashboard/forms/${formId}/edit`;

export async function addQuestionAction(formId: string, input: unknown) {
  return run(async () => {
    const user = await requireUser();
    const fid = idSchema.parse(formId);
    await questionService.addQuestion(fid, user.id, addQuestionSchema.parse(input));
    revalidatePath(editPath(fid));
  });
}

export async function updateQuestionAction(id: string, input: unknown) {
  return run(async () => {
    const user = await requireUser();
    const { formId } = await questionService.updateQuestion(
      idSchema.parse(id), user.id, updateQuestionSchema.parse(input),
    );
    revalidatePath(editPath(formId));
  });
}

export async function deleteQuestionAction(id: string) {
  return run(async () => {
    const user = await requireUser();
    const { formId } = await questionService.deleteQuestion(idSchema.parse(id), user.id);
    revalidatePath(editPath(formId));
  });
}

export async function reorderQuestionsAction(formId: string, orderedIds: unknown) {
  return run(async () => {
    const user = await requireUser();
    const fid = idSchema.parse(formId);
    await questionService.reorderQuestions(fid, user.id, reorderSchema.parse(orderedIds));
    revalidatePath(editPath(fid));
  });
}