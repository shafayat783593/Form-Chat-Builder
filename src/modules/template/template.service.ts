import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { generateFormSlug } from "@/lib/slug";

/**
 * Admin template listing (read model).
 *
 * A template is a Form with isTemplate = true, owned by an admin. Like every
 * other form it is scoped to its owner: an admin only ever sees the templates
 * they created, they never see another user's forms or responses.
 */
export async function listTemplatesForAdmin(ownerId: string) {
  return prisma.form.findMany({
    where: { ownerId, isTemplate: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      templateSlug: true,
      templateCategory: true,
      status: true,
      updatedAt: true,
      _count: { select: { questions: true, copies: true } },
    },
  });
}


export async function listPublishedTemplates() {
  return prisma.form.findMany({
    where: { isTemplate: true, status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      templateSlug: true,
      templateCategory: true,
      _count: { select: { questions: true } },
    },
  });
}

/**
 * Create a form template (ADMIN only).
 *
 * Creates a Form with isTemplate = true, status = DRAFT, owned by the admin.
 * The `templateSlug` must be unique (409 on conflict).
 */
export async function createTemplate(
  ownerId: string,
  input: { title: string; templateSlug: string; templateCategory?: string | null },
) {
  const existing = await prisma.form.findFirst({
    where: { templateSlug: input.templateSlug },
    select: { id: true },
  });
  if (existing) throw new AppError(409, "A template with this slug already exists");

  const slug = await generateFormSlug();

  return prisma.form.create({
    data: {
      ownerId,
      title: input.title,
      slug,
      isTemplate: true,
      status: "DRAFT",
      templateSlug: input.templateSlug,
      templateCategory: input.templateCategory ?? null,
    },
    select: { id: true, slug: true, templateSlug: true },
  });
}

/**
 * Creates an editable draft template from one of the admin's regular forms.
 * Responses are intentionally not copied: templates only contain form setup
 * and questions.
 */
export async function createTemplateFromForm(ownerId: string, formId: string) {
  const source = await prisma.form.findFirst({
    where: { id: formId, ownerId, isTemplate: false },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!source) throw new AppError(404, "Form not found");

  return prisma.form.create({
    data: {
      ownerId,
      title: source.title,
      slug: await generateFormSlug(),
      isTemplate: true,
      status: "DRAFT",
      templateSlug: `template-${source.slug}`,
      description: source.description,
      welcomeText: source.welcomeText,
      completionText: source.completionText,
      themeColor: source.themeColor,
      launcherLabel: source.launcherLabel,
      widgetPosition: source.widgetPosition,
      submitButtonText: source.submitButtonText,
      displayMode: source.displayMode,
      showProgress: source.showProgress,
      multiPageForm: source.multiPageForm,
      questions: {
        create: source.questions.map((question) => ({
          type: question.type,
          label: question.label,
          options: question.options ?? undefined,
          required: question.required,
          order: question.order,
          prefillKey: question.prefillKey,
          placeholder: question.placeholder,
          textColor: question.textColor,
          fontSize: question.fontSize,
          fontWeight: question.fontWeight,
          fontStyle: question.fontStyle,
        })),
      },
    },
    select: { id: true },
  });
}

/**
 * Set the publish status of a template (ADMIN only).
 *
 * PUBLISHED means "visible in the gallery and usable by owners" but the
 * template is still NOT reachable through /f, /embed or the public API.
 * Requires at least one question.
 */
export async function setTemplateStatus(
  ownerId: string,
  templateId: string,
  status: "DRAFT" | "PUBLISHED",
) {
  const template = await prisma.form.findFirst({
    where: { id: templateId, ownerId, isTemplate: true },
    select: { _count: { select: { questions: true } } },
  });
  if (!template) throw new AppError(404, "Template not found");
  if (status === "PUBLISHED" && template._count.questions === 0) {
    throw new AppError(422, "Add at least one question before publishing");
  }

  await prisma.form.update({
    where: { id: templateId },
    data: { status },
  });
}

/**
 * Delete a template (ADMIN only).
 *
 * Forms already copied from it keep working: their sourceTemplateId is set
 * to null before the template is removed.
 */
export async function deleteTemplate(ownerId: string, templateId: string) {
  const template = await prisma.form.findFirst({
    where: { id: templateId, ownerId, isTemplate: true },
    select: { id: true },
  });
  if (!template) throw new AppError(404, "Template not found");

  await prisma.form.updateMany({
    where: { sourceTemplateId: templateId },
    data: { sourceTemplateId: null },
  });

  await prisma.form.delete({ where: { id: templateId } });
}

/**
 * Fetch a single template owned by the admin, with its questions (for editing).
 */
export async function getTemplateForAdmin(ownerId: string, templateId: string) {
  const template = await prisma.form.findFirst({
    where: { id: templateId, ownerId, isTemplate: true },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!template) throw new AppError(404, "Template not found");
  return template;
}

/**
 * Public read of a published template (read-only preview).
 * Returns null when the slug is unknown, unpublished, or not a template.
 */
export async function getPublishedTemplateBySlug(templateSlug: string) {
  const template = await prisma.form.findFirst({
    where: { templateSlug, isTemplate: true, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      description: true,
      templateSlug: true,
      templateCategory: true,
      themeColor: true,
      questions: {
        orderBy: { order: "asc" },
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

  if (!template) return null;

  return {
    id: template.id,
    title: template.title,
    description: template.description,
    templateSlug: template.templateSlug,
    templateCategory: template.templateCategory,
    themeColor: template.themeColor,
    questions: template.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : null,
      required: q.required,
    })),
  };
}


