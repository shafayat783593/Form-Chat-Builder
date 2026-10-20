import { z } from "zod";

/** Public submission body (PRD section 7.1). */
export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        value: z.string().max(2000),
      }),
    )
    .max(100),
  /**
   * Page the form was embedded on. Only the origin is stored - never the full
   * URL, query string or path. Invalid values are ignored.
   */
  sourceUrl: z.string().max(2048).optional(),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
