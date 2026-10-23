import type { SubmitError } from "./flow";

export type SubmitOutcome =
  | { ok: true }
  | { ok: false; error: SubmitError; details?: Record<string, string> };

type SubmitArgs = {
  slug: string;
  answers: Record<string, string>;
  sourceOrigin?: string;
};

/**
 * Sends the answers to the public API.
 *
 * Never throws: every failure is turned into a `SubmitOutcome` so the chat can
 * show the right message.
 */
export async function submitAnswers({
  slug,
  answers,
  sourceOrigin,
}: SubmitArgs): Promise<SubmitOutcome> {
  const body: { answers: { questionId: string; value: string }[]; sourceUrl?: string } = {
    answers: Object.entries(answers)
      .filter(([, value]) => value.trim() !== "")
      .map(([questionId, value]) => ({ questionId, value: value.trim() })),
  };
  if (sourceOrigin) body.sourceUrl = sourceOrigin;

  try {
    const res = await fetch(`/api/public/forms/${slug}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 201) return { ok: true };

    if (res.status === 422) {
      const payload = await res.json().catch(() => ({}));
      return { ok: false, error: { kind: "server", message: "Some answers are invalid." }, details: payload?.details };
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After")) || 30;
      return {
        ok: false,
        error: {
          kind: "rate_limit",
          message: "Too many submissions. Please try again in a moment.",
          retryAfter,
        },
      };
    }

    return { ok: false, error: { kind: "server", message: "Something went wrong. Please try again." } };
  } catch {
    return { ok: false, error: { kind: "network", message: "Network error. Please try again." } };
  }
}
