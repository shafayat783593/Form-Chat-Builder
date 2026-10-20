import { z } from "zod";
import {
  FONT_STYLES,
  FONT_WEIGHTS,
  MAX_FONT_SIZE,
  MAX_PLACEHOLDER,
  MIN_FONT_SIZE,
  QUESTION_TYPES,
} from "@/lib/field-types";

const label = z.string().trim().min(1).max(200);
const required = z.boolean().default(true);
const options = z
  .array(z.string().trim().min(1).max(100))
  .min(2)
  .max(10)
  .refine((o) => new Set(o).size === o.length, "Options must be unique");

export const questionTypeSchema = z.enum(QUESTION_TYPES);

const baseFields = {
  label,
  required,
  placeholder: z.string().trim().max(MAX_PLACEHOLDER).optional().nullable(),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  fontSize: z.number().int().min(MIN_FONT_SIZE).max(MAX_FONT_SIZE).optional().nullable(),
  fontWeight: z.enum(FONT_WEIGHTS).optional().nullable(),
  fontStyle: z.enum(FONT_STYLES).optional().nullable(),
};

export const addQuestionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("TEXT"), ...baseFields }),
  z.object({ type: z.literal("TEXTAREA"), ...baseFields }),
  z.object({ type: z.literal("EMAIL"), ...baseFields }),
  z.object({ type: z.literal("NUMBER"), ...baseFields }),
  z.object({ type: z.literal("PHONE"), ...baseFields }),
  z.object({ type: z.literal("DATE"), ...baseFields }),
  z.object({ type: z.literal("YES_NO"), ...baseFields }),
  z.object({ type: z.literal("RATING"), ...baseFields }),
  z.object({ type: z.literal("RANGE"), ...baseFields }),
  z.object({ type: z.literal("NPS"), ...baseFields }),
  z.object({ type: z.literal("ADDRESS"), ...baseFields }),
  z.object({ type: z.literal("FULL_NAME"), ...baseFields }),
  z.object({ type: z.literal("CHOICE"), ...baseFields, options }),
  z.object({ type: z.literal("RADIO"), ...baseFields, options }),
  z.object({ type: z.literal("CHECKBOX"), ...baseFields, options }),
]);

// type বদলানো যায় না: আগের উত্তরগুলো অর্থহীন হয়ে যেত
export const updateQuestionSchema = z.object({
  label: label.optional(),
  required: z.boolean().optional(),
  options: options.optional(),
  placeholder: z.string().trim().max(MAX_PLACEHOLDER).optional().nullable(),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  fontSize: z.number().int().min(MIN_FONT_SIZE).max(MAX_FONT_SIZE).optional().nullable(),
  fontWeight: z.enum(FONT_WEIGHTS).optional().nullable(),
  fontStyle: z.enum(FONT_STYLES).optional().nullable(),
});

export const reorderSchema = z.array(z.string().min(1)).min(1).max(50);

export type AddQuestionInput = z.infer<typeof addQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
