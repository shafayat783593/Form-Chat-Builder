"use client";

import { ExternalLink, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BuilderActions, ClientQuestion } from "../../builder-state";
import { useAppOrigin } from "../../use-app-origin";

/** Lower-case letters, digits and underscores, starting with a letter. */
const PREFILL_KEY_PATTERN = /^[a-z][a-z0-9_]{0,29}$/;

interface PrefillTabProps {
  questions: ClientQuestion[];
  slug: string;
  onUpdateQuestion: BuilderActions["updateQuestion"];
}

/**
 * Lets the owner give a question a "prefill key". A link like
 * /f/my-form?email=a@b.com then fills in that question for the visitor.
 */
export function PrefillTab({ questions, slug, onUpdateQuestion }: PrefillTabProps) {
  const origin = useAppOrigin();
  const questionsWithKey = questions.filter((q) => q.prefillKey);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-start gap-2 rounded-lg border border-input bg-muted/40 p-3">
        <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground">
          Give a question a prefill key and pass it as a URL parameter to pre-answer that
          question. Keys are unique per form.
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          Add a field first to configure prefill.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((question, index) => {
            const key = question.prefillKey ?? "";
            const isInvalid = key !== "" && !PREFILL_KEY_PATTERN.test(key);

            return (
              <div
                key={question.clientId}
                className="flex flex-col gap-1.5 rounded-lg border border-input bg-card p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {question.label || "Untitled question"}
                  </span>
                </div>
                <Input
                  value={key}
                  onChange={(event) =>
                    onUpdateQuestion(question.clientId, { prefillKey: event.target.value || null })
                  }
                  placeholder="e.g. email"
                  maxLength={30}
                  aria-invalid={isInvalid}
                  className={cn("h-8 font-mono text-xs", isInvalid && "border-destructive")}
                />
                {isInvalid ? (
                  <p className="text-[10px] text-destructive">
                    Use lowercase letters, numbers and underscores (start with a letter).
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {questionsWithKey.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Example URL</span>
          {questionsWithKey.map((question) => {
            const exampleUrl = `${origin}/f/${slug}?${question.prefillKey}=value`;
            return (
              <a
                key={question.clientId}
                href={exampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 break-all rounded-lg border border-input bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted"
              >
                {exampleUrl}
                <ExternalLink className="size-3 shrink-0" />
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
