import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { MAX_FORMS_PER_USER, MAX_QUESTIONS_PER_FORM, MAX_LABEL, MAX_OPTIONS } from "@/lib/limits";
import { generateFormSlug } from "@/lib/slug";
import { hasOptions, MIN_OPTIONS, type QuestionType } from "@/lib/field-types";
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
      launcherLabel: true,
      widgetPosition: true,
      submitButtonText: true,
      displayMode: true,
      showProgress: true,
      multiPageForm: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          label: true,
          options: true,
          required: true,
          prefillKey: true,
          placeholder: true,
          textColor: true,
          fontSize: true,
          fontWeight: true,
          fontStyle: true,
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
    launcherLabel: form.launcherLabel,
    widgetPosition: form.widgetPosition,
    submitButtonText: form.submitButtonText,
    displayMode: form.displayMode,
    showProgress: form.showProgress,
    multiPageForm: form.multiPageForm,
    questions: form.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : null,
      required: q.required,
      prefillKey: q.prefillKey,
      placeholder: q.placeholder,
      textColor: q.textColor,
      fontSize: q.fontSize,
      fontWeight: q.fontWeight,
      fontStyle: q.fontStyle,
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

/** Number of responses a form has received (owner scoped). */
export async function countResponsesForOwner(id: string, ownerId: string) {
  return prisma.response.count({ where: { form: { id, ownerId } } });
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

export interface SaveFormSettings {
  title: string;
  description: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  launcherLabel: string;
  widgetPosition: "RIGHT" | "LEFT";
  submitButtonText: string;
  displayMode: "CLASSIC" | "FOCUS";
  showProgress: boolean;
  multiPageForm: boolean;
  notifyOnResponse: boolean;
  notifyEmails: string[];
}

export interface SaveFormQuestion {
  clientId?: string;
  id?: string;
  type: QuestionType;
  label: string;
  options?: string[];
  required: boolean;
  prefillKey?: string | null;
  placeholder?: string | null;
  textColor?: string | null;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontStyle?: string | null;
}

export interface SaveFormInput {
  formId: string;
  expectedUpdatedAt: string;
  settings: SaveFormSettings;
  questions: SaveFormQuestion[];
}

export interface SaveFormResult {
  form: { id: string; slug: string; updatedAt: string };
  questions: Array<{ clientId?: string; id: string; order: number }>;
}

export async function saveForm(input: SaveFormInput, userId: string, isTemplate: boolean): Promise<SaveFormResult> {
  // 1. Load form scoped by owner (or admin for templates)
  const where = isTemplate
    ? { id: input.formId, isTemplate: true, ownerId: userId }
    : { id: input.formId, ownerId: userId };
  const form = await prisma.form.findFirst({
    where,
    include: { questions: true },
  });
  if (!form) throw new AppError(404, "Form not found");

  // 2. Optimistic concurrency
  if (form.updatedAt.toISOString() !== input.expectedUpdatedAt) {
    throw new AppError(409, "This form changed in another tab. Reload.");
  }

  const questions = input.questions;

  // 3. Validation
  if (questions.length === 0) {
    throw new AppError(400, "A form needs at least one question.");
  }
  if (questions.length > MAX_QUESTIONS_PER_FORM) {
    throw new AppError(400, `Too many questions (max ${MAX_QUESTIONS_PER_FORM}).`);
  }

  const dbIds = new Set(form.questions.map((q) => q.id));
  const providedIds = new Set<string>();
  const seenPrefillKeys = new Set<string>();

  for (const q of questions) {
    if (q.id) {
      if (!dbIds.has(q.id)) throw new AppError(400, `Question id ${q.id} does not belong to this form.`);
      providedIds.add(q.id);
      const existing = form.questions.find((fq) => fq.id === q.id);
      if (existing && existing.type !== q.type) {
        throw new AppError(422, "A question's type cannot be changed after creation.");
      }
    }

    if (hasOptions(q.type)) {
      const opts = (q.options ?? []).map((o) => o.trim()).filter(Boolean);
      if (opts.length < MIN_OPTIONS || opts.length > MAX_OPTIONS) {
        throw new AppError(400, `${q.type} must have ${MIN_OPTIONS}-${MAX_OPTIONS} options.`);
      }
      if (new Set(opts).size !== opts.length)
        throw new AppError(400, `${q.type} options must be unique.`);
    } else if (q.options != null && q.options.length > 0) {
      throw new AppError(400, `${q.type} questions must not have options.`);
    }

    if (q.prefillKey) {
      if (!/^[a-z][a-z0-9_]{0,29}$/.test(q.prefillKey)) {
        throw new AppError(400, "Invalid prefill key.");
      }
      if (seenPrefillKeys.has(q.prefillKey)) throw new AppError(400, `Duplicate prefill key: ${q.prefillKey}`);
      seenPrefillKeys.add(q.prefillKey);
    }

    if (q.label.trim().length > MAX_LABEL) {
      throw new AppError(400, `Question label too long (max ${MAX_LABEL} chars).`);
    }
  }

  // 6. Published forms must keep at least one question
  if (form.status === "PUBLISHED" && questions.length === 0) {
    throw new AppError(422, "A published form needs at least one question.");
  }

  // 4-5. One transaction: delete missing, update existing, create new; order = index
  const toDelete = form.questions.filter((q) => !providedIds.has(q.id)).map((q) => q.id);

  let order = 0;
  const idMap: Array<{ clientId?: string | undefined; id: string; order: number }> = [];

  const result = await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.answer.deleteMany({ where: { questionId: { in: toDelete } } });
      await tx.question.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const q of questions) {
      const optionsValue: Prisma.InputJsonValue | null = hasOptions(q.type)
        ? ((q.options ?? []).map((o) => o.trim()).filter(Boolean) as unknown as Prisma.InputJsonValue)
        : null;

      const optionsData: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined =
        optionsValue as unknown as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined;

      const styleData = {
        placeholder: q.placeholder ?? null,
        textColor: q.textColor ?? null,
        fontSize: q.fontSize ?? null,
        fontWeight: q.fontWeight ?? null,
        fontStyle: q.fontStyle ?? null,
      };

      if (q.id && dbIds.has(q.id)) {
        await tx.question.update({
          where: { id: q.id },
          data: {
            type: q.type,
            label: q.label,
            options: optionsData,
            required: q.required,
            order,
            prefillKey: q.prefillKey ?? null,
            ...styleData,
          },
        });
        idMap.push({ clientId: q.clientId, id: q.id, order });
      } else if (!q.id) {
        const created = await tx.question.create({
          data: {
            formId: form.id,
            type: q.type,
            label: q.label,
            options: optionsData,
            required: q.required,
            order,
            prefillKey: q.prefillKey ?? null,
            ...styleData,
          },
        });
        idMap.push({ clientId: q.clientId, id: created.id, order: created.order });
      }
      order++;
    }

    await tx.form.update({
      where: { id: form.id },
      data: {
        title: input.settings.title,
        description: input.settings.description,
        welcomeText: input.settings.welcomeText,
        completionText: input.settings.completionText,
        themeColor: input.settings.themeColor,
        launcherLabel: input.settings.launcherLabel,
        widgetPosition: input.settings.widgetPosition,
        submitButtonText: input.settings.submitButtonText,
        displayMode: input.settings.displayMode,
        showProgress: input.settings.showProgress,
        multiPageForm: input.settings.multiPageForm,
        notifyOnResponse: input.settings.notifyOnResponse,
        notifyEmails: input.settings.notifyEmails,
      },
    });

    return idMap;
  });

  // 7. Return fresh form + questions so client can remap clientId → id
  const fresh = await prisma.form.findFirst({
    where: { id: form.id },
    select: { id: true, slug: true, updatedAt: true },
  });
  if (!fresh) throw new AppError(404, "Form not found");

  return {
    form: {
      id: fresh.id,
      slug: fresh.slug,
      updatedAt: fresh.updatedAt.toISOString(),
    },
    questions: result,
  };
}
