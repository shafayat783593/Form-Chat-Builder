"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createFormSchema, updateFormSchema, saveFormSchema } from "./form.schema";
import * as formService from "./form.service";
import { run } from "@/lib/action";

export async function createFormAction(input: unknown) {
  return run(async () => {
    const user = await requireUser();
    const form = await formService.createForm(user.id, createFormSchema.parse(input));
    revalidatePath("/owner");
    revalidatePath("/admin/forms");
    revalidatePath("/admin/responses");
    return form;
  });
}

export async function duplicateFormAction(formId: string) {
  return run(async () => {
    const user = await requireUser();
    const form = await formService.duplicateForm(user.id, formId);
    revalidatePath("/owner");
    revalidatePath("/owner/forms");
    revalidatePath("/admin/forms");
    return form;
  });
}

export async function updateFormAction(id: string, input: unknown){
  return run(async () => {
    const user = await requireUser();
    await formService.updateForm(id, user.id, updateFormSchema.parse(input));
    revalidatePath("/owner");
    revalidatePath("/admin/forms");
    revalidatePath("/admin/responses");
  });
}

export async function deleteFormAction(id: string) {
  return run(async () => {
    const user = await requireUser();
    await formService.deleteForm(id, user.id);
    revalidatePath("/owner");
    revalidatePath("/admin/forms");
    revalidatePath("/admin/responses");
  });
}

export async function setFormStatusAction(id: string, status: "DRAFT" | "PUBLISHED") {
  return run(async () => {
    const user = await requireUser();
    await formService.setFormStatus(id, user.id, status);
    revalidatePath("/owner");
    revalidatePath("/admin/forms");
    revalidatePath("/admin/responses");
  });
}

export async function saveFormAction(input: unknown, isTemplate = false) {
  return run(async () => {
    const user = await requireUser();
    const parsed = saveFormSchema.parse(input);
    const result = await formService.saveForm(parsed, user.id, isTemplate);
    revalidatePath("/owner");
    revalidatePath("/admin/forms");
    revalidatePath("/admin/responses");
    revalidatePath(`/owner/forms/${result.form.id}/edit`);
    revalidatePath("/admin/templates");
    return result;
  });
}
