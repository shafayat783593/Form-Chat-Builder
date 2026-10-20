import { z } from "zod";

// templateSlug: readable public URL, e.g. "course-enrollment"
// Matches ^[a-z0-9]+(-[a-z0-9]+)*$, 3–60 chars (PRD section 6.5).
export const createTemplateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  templateSlug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(60, "Slug must be at most 60 characters")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Slug must be lowercase, contain only letters, numbers, and single hyphens between words",
    ),
  templateCategory: z.string().trim().max(100).optional().nullable(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
