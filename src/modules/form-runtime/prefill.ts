import { validateAnswer, type QuestionType } from "@/lib/field-types";

export type PrefillableQuestion = {
  id: string;
  type: QuestionType;
  options: string[] | null;
  prefillKey?: string | null;
};

export type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Reads the prefill answers from the query string.
 *
 * Only questions that have a `prefillKey` are considered, and a value is only
 * used when it passes the same validation the server applies. An invalid
 * prefill is ignored, so the question is asked normally.
 */
export function collectPrefill(
  questions: PrefillableQuestion[],
  searchParams: SearchParams | undefined,
): Record<string, string> {
  if (!searchParams) return {};

  const prefilled: Record<string, string> = {};

  for (const question of questions) {
    if (!question.prefillKey) continue;
    const raw = firstValue(searchParams[question.prefillKey]);
    if (!raw) continue;
    const value = raw.trim();
    if (value === "") continue;
    if (validateAnswer(question.type, value, question.options) === null) {
      prefilled[question.id] = value;
    }
  }

  return prefilled;
}
