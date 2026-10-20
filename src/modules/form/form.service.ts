import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { CreateFormInput, UpdateFormInput } from "./form.schema";

const newSlug = () => randomBytes(6).toString("base64url"); // ৮ অক্ষর

export async function createForm(ownerId: string, input: CreateFormInput) {
  return prisma.form.create({
    data: { ownerId, title: input.title, slug: newSlug() },
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