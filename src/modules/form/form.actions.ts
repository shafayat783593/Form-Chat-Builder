"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createFormSchema, updateFormSchema } from "./form.schema";
import * as formService from "./form.service";
import { run } from "@/lib/action";

export async function createFormAction(input: unknown) {
  return run(async () => {
    const user = await requireUser();
    const form = await formService.createForm(user.id, createFormSchema.parse(input));
    revalidatePath("/dashboard");
    return form;
  });
}

export async function updateFormAction(id: string, input: unknown) {
  return run(async () => {
    const user = await requireUser();
    await formService.updateForm(id, user.id, updateFormSchema.parse(input));
    revalidatePath("/dashboard");
  });
}

export async function deleteFormAction(id: string) {
  return run(async () => {
    const user = await requireUser();
    await formService.deleteForm(id, user.id);
    revalidatePath("/dashboard");
  });
}

export async function setFormStatusAction(id: string, status: "DRAFT" | "PUBLISHED") {
  return run(async () => {
    const user = await requireUser();
    await formService.setFormStatus(id, user.id, status);
    revalidatePath("/dashboard");
  });
}