"use client";

import { useCallback, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormFlow, type UseFormFlowArgs } from "./use-form-flow";
import { FieldInput } from "./field-input";
import { FOCUS_RING, PALETTE, contrastTextColor } from "./chat-theme";
import { type QuestionType } from "@/lib/field-types";

interface ChatProps {
  form: UseFormFlowArgs["form"] & { showProgress?: boolean };
  previewMode?: boolean;
  searchParams?: UseFormFlowArgs["searchParams"];
  sourceOrigin?: string;
  /** A short confirmation shown at the top of the conversation. */
  notice?: string | null;
}

export function Chat(props: ChatProps) {
  const { form, previewMode = false, searchParams, sourceOrigin, notice = null } = props;

  const flow = useFormFlow({ form, previewMode, searchParams, sourceOrigin });
  const { state, question, transcript } = flow;

  const messagesRef = useRef<HTMLElement>(null);
  const themeText = contrastTextColor(form.themeColor);

  useEffect(() => {
    // Scroll only the message list. scrollIntoView would also scroll the page
    // behind it, which makes the whole chat jump on phones when the keyboard opens.
    const list = messagesRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const answer = useCallback((value: string) => flow.setAnswer(value), [flow]);
  const send = useCallback((value?: string) => flow.submit(value), [flow]);
  const skip = useCallback(() => flow.skip(), [flow]);
  const retry = useCallback(() => flow.retry(), [flow]);
  const restart = useCallback(() => flow.restart(), [flow]);

  const isSending = state.phase === "submitting";
  const isDone = state.phase === "done";
  const canSend = !isSending && (!question?.required || !!question);

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ backgroundColor: PALETTE.surface, color: PALETTE.text }}>
      {form.showProgress && form.questions.length > 0 ? (
        <div className="shrink-0 px-4 pt-3 sm:px-6">
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: PALETTE.surfaceMuted }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((state.index + 1) / form.questions.length) * 100}%`,
                backgroundColor: form.themeColor,
              }}
            />
          </div>
        </div>
      ) : null}

      <main ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6" role="log" aria-live="polite" aria-atomic="false">
        <div className="mx-auto max-w-md space-y-4">
          {notice ? (
            <p
              role="status"
              className="rounded-lg border px-3 py-2 text-center text-xs"
              style={{ backgroundColor: PALETTE.surfaceMuted, borderColor: PALETTE.border, color: PALETTE.textMuted }}
            >
              {notice}
            </p>
          ) : null}

          {transcript.map((entry, i) => (
            <Bubble key={i} entry={entry} themeColor={form.themeColor} themeText={themeText} />
          ))}

          {isDone ? (
            <div className="flex justify-start">
              <div
                className="max-w-[85%] rounded-2xl border p-4 text-sm"
                style={{ backgroundColor: PALETTE.surface, borderColor: PALETTE.border, color: PALETTE.text }}
              >
                <p className="text-base font-semibold">Thank you!</p>
                <p className="mt-1 text-muted-foreground">Your response has been submitted successfully.</p>
              </div>
            </div>
          ) : null}

          {state.submitError ? (
            <div
              className="max-w-[85%] rounded-2xl border p-3 text-sm"
              style={{ backgroundColor: PALETTE.dangerSurface, borderColor: PALETTE.danger, color: PALETTE.danger }}
            >
              <AlertCircle className="mr-2 inline size-4" /> {state.submitError.message}
              <button
                onClick={retry}
                disabled={flow.retryCountdown > 0}
                className="ml-3 underline underline-offset-4 disabled:opacity-50 disabled:pointer-events-none"
                style={{ color: PALETTE.danger }}
              >
                Retry{flow.retryCountdown > 0 ? ` (${flow.retryCountdown}s)` : ""}
              </button>
            </div>
          ) : null}

        </div>
      </main>

      {question && (state.phase === "asking" || isSending) ? (
        <footer
          className="shrink-0 border-t p-4 sm:p-6"
          style={{ backgroundColor: PALETTE.surface, borderColor: PALETTE.border }}
        >
          <div className="mx-auto max-w-md">
            <FieldInput
              question={question}
              value={state.answers[question.id] ?? ""}
              onChange={answer}
              onSubmit={send}
              disabled={isSending}
              themeColor={form.themeColor}
              error={state.errors[question.id]}
              autoSubmit={flow.isLast}
            />

            {!isSending ? (
              <div className="mt-3 flex items-center justify-between gap-3">
                {question.required ? (
                  <span />
                ) : (
                  <button
                    type="button"
                    onClick={skip}
                    className="text-[11px] underline underline-offset-4"
                    style={{ color: PALETTE.textMuted }}
                  >
                    Skip
                  </button>
                )}

                {needsSendButton(question.type) && !(flow.isLast && isDiscrete(question.type)) ? (
                  <Button
                    type="button"
                    onClick={() => send()}
                    disabled={!canSend}
                    className={FOCUS_RING}
                    style={{ backgroundColor: form.themeColor, color: themeText }}
                  >
                    {form.submitButtonText || "Send"}
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-center text-xs" style={{ color: PALETTE.textMuted }}>
                Sending…
              </p>
            )}
          </div>
        </footer>
      ) : null}

      {previewMode ? (
        <p className="shrink-0 px-4 pb-3 text-center text-[11px]" style={{ color: PALETTE.textMuted }}>
          Preview — responses are not saved
        </p>
      ) : null}

      {isDone && previewMode ? (
        <div className="shrink-0 border-t p-4 text-center" style={{ borderColor: PALETTE.border }}>
          <Button
            onClick={restart}
            variant="outline"
            size="sm"
            className={FOCUS_RING}
            style={{ borderColor: PALETTE.border, color: PALETTE.text }}
          >
            Start over
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Types that answer with a button click and move on by themselves. */
function needsSendButton(type: QuestionType): boolean {
  return type !== "YES_NO" && type !== "RADIO";
}

/** Types where picking an option is a single, final action. */
function isDiscrete(type: QuestionType): boolean {
  return (
    type === "CHOICE" ||
    type === "CHECKBOX" ||
    type === "RATING" ||
    type === "NPS" ||
    type === "YES_NO" ||
    type === "RADIO"
  );
}

function Bubble({
  entry,
  themeColor,
  themeText,
}: {
  entry: { kind: "bot" | "user"; text: string; muted?: boolean; isTyping?: boolean };
  themeColor: string;
  themeText: string;
}) {
  if (entry.isTyping) {
    return (
      <div className="flex justify-start">
        <div
          className="flex items-center gap-1 rounded-2xl p-3"
          style={{ backgroundColor: PALETTE.surfaceMuted }}
          aria-label="Typing"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full"
              style={{
                backgroundColor: PALETTE.textMuted,
                animationDelay: `${i * 120}ms`,
                animationDuration: "600ms",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (entry.kind === "bot") {
    return (
      <div className="flex justify-start">
        <div
          className="max-w-[85%] rounded-2xl border p-3 text-sm"
          style={{ backgroundColor: PALETTE.surface, borderColor: PALETTE.border, color: PALETTE.text }}
        >
          <span className="font-semibold">{entry.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
        style={{
          backgroundColor: entry.muted ? PALETTE.surfaceMuted : themeColor,
          color: entry.muted ? PALETTE.textMuted : themeText,
          fontStyle: entry.muted ? "italic" : "normal",
        }}
      >
        {entry.text}
      </div>
    </div>
  );
}
