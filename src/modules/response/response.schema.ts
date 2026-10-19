import { z } from "zod";

export const submitResponseSchema = z.object({
  answers: z
    .array(z.object({ questionId: z.string().min(1), value: z.string().max(2000) }))
    .max(100),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;