import { prisma } from "@/lib/prisma";

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

/**
 * Published templates visible to owners when creating a form from a template
 * (PRD section 6.1 step 2).
 */
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
