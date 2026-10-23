"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { createTemplateSchema } from "./template.schema";
import * as templateService from "./template.service";
import { run } from "@/lib/action";

export async function createTemplateAction(input: unknown) {
  return run(async () => {
    const user = await requireAdmin();
    const parsed = createTemplateSchema.parse(input);
    const result = await templateService.createTemplate(user.id, {
      title: parsed.title,
      templateSlug: parsed.templateSlug,
      templateCategory: parsed.templateCategory,
    });
    revalidatePath("/admin/templates");
    return result;
  });
}

export async function createTemplateFromFormAction(formId: string) {
  return run(async () => {
    const user = await requireAdmin();
    const result = await templateService.createTemplateFromForm(user.id, formId);
    revalidatePath("/admin/forms");
    revalidatePath("/admin/templates");
    return result;
  });
}

export async function setTemplateStatusAction(
  templateId: string,
  status: "DRAFT" | "PUBLISHED",
) {
  return run(async () => {
    const user = await requireAdmin();
    await templateService.setTemplateStatus(user.id, templateId, status);
    revalidatePath("/admin/templates");
  });
}

export async function deleteTemplateAction(templateId: string) {
  return run(async () => {
    const user = await requireAdmin();
    await templateService.deleteTemplate(user.id, templateId);
    revalidatePath("/admin/templates");
  });
}
