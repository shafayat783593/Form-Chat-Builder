import { z } from "zod";

const label = z.string().trim().min(1).max(200);
const required = z.boolean().default(true);
const options = z
  .array(z.string().trim().min(1).max(100))
  .min(2)
  .max(10)
  .refine((o) => new Set(o).size === o.length, "Options must be unique");

export const addQuestionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("TEXT"), label, required }),
  z.object({ type: z.literal("EMAIL"), label, required }),
  z.object({ type: z.literal("YES_NO"), label, required }),
  z.object({ type: z.literal("CHOICE"), label, required, options }),
]);

// type বদলানো যায় না: আগের উত্তরগুলো অর্থহীন হয়ে যেত
export const updateQuestionSchema = z.object({
  label: label.optional(),
  required: z.boolean().optional(),
  options: options.optional(),
});

export const reorderSchema = z.array(z.string().min(1)).min(1).max(50);

export type AddQuestionInput = z.infer<typeof addQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;