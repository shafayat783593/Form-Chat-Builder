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
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, slug: true, status: true, updatedAt: true,
      _count: { select: { responses: true, questions: true } },
    },
  });
}

export async function getDashboardStats(ownerId: string) {
  const [forms, responses] = await Promise.all([
    prisma.form.count({ where: { ownerId } }),
    prisma.response.count({ where: { form: { ownerId } } }),
  ]);
  return { forms, responses };
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