import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { MAX_FORMS_PER_USER } from "@/lib/limits";
import { generateFormSlug } from "@/lib/slug";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateFormInput, UpdateFormInput } from "./form.schema";

export async function createForm(ownerId: string, input: CreateFormInput) {
  const existingCount = await prisma.form.count({ where: { ownerId } });
  if (existingCount >= MAX_FORMS_PER_USER) {
    throw new AppError(400, `You can have at most ${MAX_FORMS_PER_USER} forms. Delete one first.`);
  }

  const slug = await generateFormSlug();

  if (input.templateId) {
    const template = await prisma.form.findFirst({
      where: { id: input.templateId, isTemplate: true, status: "PUBLISHED" },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!template) throw new AppError(404, "Template not found or not published");

    return prisma.$transaction(async (tx) => {
      const form = await tx.form.create({
        data: {
          ownerId,
          title: input.title,
          slug,
          isTemplate: false,
          status: "DRAFT",
          sourceTemplateId: template.id,
          description: template.description,
          welcomeText: template.welcomeText,
          completionText: template.completionText,
          themeColor: template.themeColor,
          launcherLabel: template.launcherLabel,
          widgetPosition: template.widgetPosition,
          notifyEmails: [],
          questions: {
            create: (template.questions.map((q, index) => ({
              type: q.type,
              label: q.label,
              options: q.options as unknown as Prisma.InputJsonValue,
              required: q.required,
              order: index,
              prefillKey: q.prefillKey,
            })) as unknown as Prisma.QuestionCreateWithoutFormInput[]),
          },
        },
        select: { id: true, slug: true },
      });
      return form;
    });
  }

  return prisma.form.create({
    data: { ownerId, title: input.title, slug },
    select: { id: true, slug: true },
  });
}

export async function listForms(ownerId: string) {
  return prisma.form.findMany({
    where: { ownerId, isTemplate: false },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, slug: true, status: true, updatedAt: true,
      _count: { select: { responses: true, questions: true } },
    },
  });
}

export async function getDashboardStats(ownerId: string) {
  const [forms, responses] = await Promise.all([
    prisma.form.count({ where: { ownerId, isTemplate: false } }),
    prisma.response.count({ where: { form: { ownerId, isTemplate: false } } }),
  ]);
  return { forms, responses };
}

/**
 * Public read of a form. Only PUBLISHED, non-template forms are visible and no
 * internal fields (ownerId, status, isTemplate, ids of the owner) are exposed.
 * Returns null when the slug does not exist, is not published, or is a template.
 */
export async function getPublishedFormBySlug(slug: string) {
  const form = await prisma.form.findFirst({
    where: { slug, status: "PUBLISHED", isTemplate: false },
    select: {
      slug: true,
      title: true,
      description: true,
      welcomeText: true,
      completionText: true,
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

  if (!form) return null;

  return {
    slug: form.slug,
    title: form.title,
    description: form.description,
    welcomeText: form.welcomeText,
    completionText: form.completionText,
    themeColor: form.themeColor,
    questions: form.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : null,
      required: q.required,
    })),
  };
}

export async function getFormForOwner(id: string, ownerId: string) {
  const form = await prisma.form.findFirst({
    where: { id, ownerId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!form) throw new AppError(404, "Form not found");
  return form;
}

export async function updateForm(id: string, ownerId: string, input: UpdateFormInput) {
  const { count } = await prisma.form.updateMany({ where: { id, ownerId }, data: input });
  if (count === 0) throw new AppError(404, "Form not found");
}

export async function deleteForm(id: string, ownerId: string) {
  const { count } = await prisma.form.deleteMany({ where: { id, ownerId } });
  if (count === 0) throw new AppError(404, "Form not found");
}

export async function setFormStatus(id: string, ownerId: string, status: "DRAFT" | "PUBLISHED") {
  const form = await prisma.form.findFirst({
    where: { id, ownerId },
    select: { _count: { select: { questions: true } } },
  });
  if (!form) throw new AppError(404, "Form not found");
  if (status === "PUBLISHED" && form._count.questions === 0)
    throw new AppError(422, "Add at least one question before publishing");

  await prisma.form.updateMany({ where: { id, ownerId }, data: { status } });
}