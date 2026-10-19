import { z } from "zod";

export const createFormSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export const updateFormSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  welcomeText: z.string().trim().min(1).max(300).optional(),
  completionText: z.string().trim().min(1).max(300).optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>; 