import { z } from "zod";
import {
  FONT_STYLES,
  FONT_WEIGHTS,
  MAX_FONT_SIZE,
  MAX_PLACEHOLDER,
  MIN_FONT_SIZE,
  QUESTION_TYPES,
  optionsSchema,
} from "@/lib/field-types";

const questionTypeSchema = z.enum(QUESTION_TYPES);

export const createFormSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  templateId: z.string().min(1).optional(),
}).refine((input) => input.templateId || input.title, {
  message: "Enter a form title",
  path: ["title"],
});

export const updateFormSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  welcomeText: z.string().trim().min(1).max(300).optional(),
  completionText: z.string().trim().min(1).max(300).optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const saveFormSchema = z.object({
  formId: z.string().min(1),
  expectedUpdatedAt: z.string().datetime(),
  settings: z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().nullable().default(null),
    welcomeText: z.string().trim().min(1).max(300),
    completionText: z.string().trim().min(1).max(300),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    launcherLabel: z.string().trim().min(1).max(30),
    widgetPosition: z.enum(["RIGHT", "LEFT"]),
    submitButtonText: z.string().trim().min(1).max(30).default("Submit"),
    displayMode: z.enum(["CLASSIC", "FOCUS"]).default("CLASSIC"),
    showProgress: z.boolean().default(true),
    multiPageForm: z.boolean().default(false),
    notifyOnResponse: z.boolean().default(false),
    notifyEmails: z.array(z.string().email()).max(5).default([]),
  }),
  questions: z.array(
    z.object({
      clientId: z.string().optional(),
      id: z.string().optional(),
      type: questionTypeSchema,
      label: z.string().trim().min(1).max(200),
      options: optionsSchema.optional(),
      required: z.boolean().default(true),
      prefillKey: z.string().regex(/^[a-z][a-z0-9_]{0,29}$/).optional().nullable(),
      placeholder: z.string().trim().max(MAX_PLACEHOLDER).optional().nullable(),
      textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
      fontSize: z.number().int().min(MIN_FONT_SIZE).max(MAX_FONT_SIZE).optional().nullable(),
      fontWeight: z.enum(FONT_WEIGHTS).optional().nullable(),
      fontStyle: z.enum(FONT_STYLES).optional().nullable(),
    }),
  ),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type SaveFormInput = z.infer<typeof saveFormSchema>; 
