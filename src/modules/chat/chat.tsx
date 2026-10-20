"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  hasOptions,
  isMultiSelect,
  NPS_MAX,
  NPS_MIN,
  RANGE_MAX,
  RANGE_MIN,
  RATING_MAX,
  RATING_MIN,
  validateAnswer,
  type QuestionType,
} from "@/lib/field-types";

type Question = {
  id: string;
  type: QuestionType;
  label: string;
  options: string[] | null;
  required: boolean;
  placeholder?: string | null;
  textColor?: string | null;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontStyle?: string | null;
};

type FormData = {
  slug: string;
  title: string;
  description?: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  submitButtonText: string;
  displayMode: "CLASSIC" | "FOCUS";
  showProgress: boolean;
  multiPageForm: boolean;
  questions: Question[];
};

interface ChatProps {
  form: FormData;
  previewMode?: boolean;
}

/** Relative luminance (WCAG) for picking contrasting text color on themeColor. */
function luminance(r: number, g: number, b: number) {
  const s = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * s(r) + 0.7152 * s(g) + 0.0722 * s(b);
}

function contrastTextColor(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return "#000000";
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  return luminance(r, g, b) > 0.179 ? "#000000" : "#ffffff";
}

export function Chat({ form, previewMode = false }: ChatProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"welcome" | "question" | "submitting" | "completed" | "error">("welcome");
  const [errorDetails, setErrorDetails] = useState<Record<string, string>>({});
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [skipActive, setSkipActive] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const question = form.questions[index];
  const isLast = index >= form.questions.length - 1;
  const currentValue = answers[question?.id ?? ""] ?? "";

  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [index, phase, question]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const validateCurrent = useCallback((): string | null => {
    if (!question) return null;
    if (question.required && !currentValue.trim()) return "This question is required";
    if (currentValue.length > 2000) return "Answer too long (max 2000 chars)";
    return validateAnswer(question.type, currentValue.trim(), question.options);
  }, [question, currentValue]);

  const setAnswer = (value: string) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setErrorDetails((prev) => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
    setNetworkError(null);
    setSkipActive(false);
  };

  const toggleMulti = (option: string) => {
    const picked = currentValue ? currentValue.split(",").map((s) => s.trim()) : [];
    const next = picked.includes(option)
      ? picked.filter((p) => p !== option)
      : [...picked, option];
    setAnswer(next.join(","));
  };

  const skipCurrent = () => {
    if (!question || !question.required) return;
    setSkipActive(true);
    setAnswers((prev) => ({ ...prev, [question.id]: "" }));
    setIndex((i) => i + 1);
    setSkipActive(false);
  };

  const goNext = () => {
    setIndex((i) => i + 1);
    setSkipActive(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question) return;

    const err = validateCurrent();
    if (err) {
      setErrorDetails((prev) => ({ ...prev, [question.id]: err }));
      return;
    }

    if (currentValue.trim() || question.required) {
      setAnswers((prev) => ({ ...prev, [question.id]: currentValue.trim() }));
    }

    if (!isLast) {
      goNext();
      return;
    }

    setPhase("submitting");
    setNetworkError(null);

    try {
      if (previewMode) {
        await new Promise((r) => setTimeout(r, 400));
        if (!isMounted.current) return;
        setPhase("completed");
        return;
      }

      const res = await fetch(`/api/public/forms/${form.slug}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers)
            .filter(([, v]) => v.trim() !== "")
            .map(([questionId, value]) => ({ questionId, value: value.trim() })),
        }),
      });

      if (!isMounted.current) return;

      if (res.status === 422) {
        const body = await res.json().catch(() => ({}));
        const details: Record<string, string> = body?.details ?? {};
        setErrorDetails(details);
        setPhase("error");
        const failingId = Object.keys(details)[0];
        if (failingId) {
          const idx = form.questions.findIndex((q) => q.id === failingId);
          if (idx >= 0) setIndex(idx);
        }
        return;
      }

      if (!res.ok) throw new Error("Submission failed");

      if (!isMounted.current) return;
      setPhase("completed");
    } catch {
      if (!isMounted.current) return;
      setNetworkError("Network error. Please try again.");
      setPhase("error");
    }
  };

  const retry = () => {
    setPhase("submitting");
    setNetworkError(null);
    handleSubmit();
  };

  const restart = () => {
    setIndex(0);
    setAnswers({});
    setErrorDetails({});
    setNetworkError(null);
    setPhase("welcome");
  };

  const bubbleStyle = {
    "--bg": form.themeColor,
    "--text": contrastTextColor(form.themeColor),
  };

  if (phase === "welcome") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center sm:max-w-md sm:mx-auto">
        <div
          className="inline-flex items-center justify-center size-12 rounded-full"
          style={{ backgroundColor: form.themeColor, color: contrastTextColor(form.themeColor) }}
        >
          <span className="font-semibold text-sm">{form.title}</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">{form.welcomeText}</p>
        <Button
          onClick={() => setPhase("question")}
          className="mt-4"
          style={bubbleStyle as React.CSSProperties}
        >
          Start
        </Button>
        {previewMode && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Preview — responses are not saved
          </p>
        )}
      </div>
    );
  }

  if (phase === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center sm:max-w-md sm:mx-auto">
        <div className="size-12 rounded-full flex items-center justify-center text-success">
          <CheckCircle className="size-6" />
        </div>
        <h3 className="font-semibold">Thanks!</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{form.completionText}</p>
        <Button onClick={restart} className="mt-4" variant="outline">
          Start over
        </Button>
        {previewMode && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Preview — responses are not saved
          </p>
        )}
      </div>
    );
  }

  const questionStyle: React.CSSProperties = {
    fontSize: `${question?.fontSize ?? DEFAULT_FONT_SIZE}px`,
    fontWeight: (question?.fontWeight ?? DEFAULT_FONT_WEIGHT) as React.CSSProperties["fontWeight"],
    fontStyle: (question?.fontStyle ?? "normal") as React.CSSProperties["fontStyle"],
    color: question?.textColor ?? undefined,
  };

  const isYesNo = question?.type === "YES_NO";
  const isMulti = question ? isMultiSelect(question.type) : false;
  const isOptions = question ? hasOptions(question.type) : false;
  const isScale = question?.type === "RATING" || question?.type === "RANGE" || question?.type === "NPS";
  const isText = !isYesNo && !isMulti && !isOptions && !isScale;

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-md mx-auto space-y-4">
          {index === 0 && phase !== "error" && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted p-3 max-w-[80%] text-sm text-muted-foreground">
                {form.welcomeText}
              </div>
            </div>
          )}

          {question && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-card p-3 max-w-[85%] text-sm shadow-sm">
                <span className="font-semibold" style={questionStyle}>
                  {question.label}
                </span>
                {question.required && (
                  <span className="ml-1 text-[10px] text-destructive/70">*</span>
                )}
              </div>
            </div>
          )}

          {networkError && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-destructive/10 p-3 max-w-[80%] text-sm text-destructive border border-destructive/20">
                <AlertCircle className="mr-2 size-4" /> {networkError}
                <button
                  onClick={retry}
                  className="ml-3 underline underline-offset-4 text-xs text-destructive hover:text-destructive/80"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {Object.entries(answers).map(([qid, value]) => {
            const q = form.questions.find((x) => x.id === qid);
            if (!q || !value.trim()) return null;
            return (
              <div key={qid} className="flex justify-end">
                <div className="rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground max-w-[80%]">
                  {value.split(",").join(", ")}
                </div>
              </div>
            );
          })}

          <div ref={msgEndRef} />

          {question && errorDetails[question.id] && (
            <p className="text-[11px] text-destructive max-w-md mx-auto">{errorDetails[question.id]}</p>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 flex items-center justify-center gap-2 p-4 sm:p-6 bg-background/80 backdrop-blur border-t border-border">
        {/* Scale inputs */}
        {question?.type === "RATING" ? (
          <div className="flex items-center gap-1">
            {Array.from({ length: RATING_MAX - RATING_MIN + 1 }).map((_, i) => {
              const value = String(RATING_MIN + i);
              const active = Number(currentValue) >= RATING_MIN + i;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAnswer(value)}
                  className="p-1 text-2xl leading-none transition-colors"
                  style={{ color: active ? "#f59e0b" : undefined }}
                  aria-label={`${value} star${value === "1" ? "" : "s"}`}
                >
                  <Star className={active ? "size-6 fill-current" : "size-6"} />
                </button>
              );
            })}
          </div>
        ) : question?.type === "RANGE" ? (
          <div className="flex w-full max-w-md flex-col gap-2">
            <input
              type="range"
              min={RANGE_MIN}
              max={RANGE_MAX}
              value={currentValue || String(RANGE_MIN)}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full accent-current"
              aria-label="Range"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{RANGE_MIN}</span>
              <span className="font-medium">{currentValue || RANGE_MIN}</span>
              <span>{RANGE_MAX}</span>
            </div>
          </div>
        ) : question?.type === "NPS" ? (
          <div className="flex flex-wrap justify-center gap-1 max-w-md">
            {Array.from({ length: NPS_MAX - NPS_MIN + 1 }).map((_, i) => {
              const value = String(NPS_MIN + i);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAnswer(value)}
                  className={cn(
                    "grid size-8 place-items-center rounded-md border text-xs transition-colors",
                    currentValue === value
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-input bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ) : isMulti ? (
          // Checkbox group
          <div className="flex w-full max-w-md flex-col gap-2">
            {question.options?.map((opt) => {
              const checked = currentValue.split(",").map((s) => s.trim()).includes(opt);
              return (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-card px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMulti(opt)}
                    className="size-4 accent-primary"
                  />
                  <span style={questionStyle}>{opt}</span>
                </label>
              );
            })}
          </div>
        ) : isOptions ? (
          // Radio / dropdown
          <div className="flex w-full max-w-md flex-col gap-2">
            {question.type === "CHOICE" ? (
              <select
                value={currentValue}
                onChange={(e) => setAnswer(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={question.label}
              >
                <option value="">Select…</option>
                {question.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              question.options?.map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-card px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={currentValue === opt}
                    onChange={() => setAnswer(opt)}
                    className="size-4 accent-primary"
                  />
                  <span style={questionStyle}>{opt}</span>
                </label>
              ))
            )}
          </div>
        ) : isYesNo ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAnswer("yes")}
              disabled={phase === "submitting"}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm transition-colors",
                currentValue === "yes"
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-input bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setAnswer("no")}
              disabled={phase === "submitting"}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm transition-colors",
                currentValue === "no"
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-input bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              No
            </button>
          </div>
        ) : (
          // Text-like inputs
          <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto gap-2">
            {question?.type === "TEXTAREA" ? (
              <Textarea
                value={currentValue}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={question.placeholder || "Type your answer…"}
                disabled={phase === "submitting"}
                className="min-h-20 flex-1"
                style={questionStyle}
              />
            ) : (
              <Input
                value={currentValue}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                type={
                  question?.type === "EMAIL"
                    ? "email"
                    : question?.type === "NUMBER"
                      ? "number"
                      : question?.type === "DATE"
                        ? "date"
                        : question?.type === "PHONE"
                          ? "tel"
                          : "text"
                }
                placeholder={question?.placeholder || "Type your answer…"}
                disabled={phase === "submitting"}
                className="flex-1 h-10"
                style={questionStyle}
              />
            )}
            <Button
              type="submit"
              disabled={phase === "submitting" || (!currentValue.trim() && !question?.required)}
              className="shrink-0"
              style={bubbleStyle as React.CSSProperties}
            >
              <Send className="size-4" />
            </Button>
          </form>
        )}

        {/* Skip + send for non-text types */}
        {question && !isText ? (
          <div className="mt-3 flex items-center gap-3">
            {question.required ? null : (
              <button
                type="button"
                onClick={skipCurrent}
                disabled={phase === "submitting" || skipActive}
                className="text-[11px] underline underline-offset-4 text-muted-foreground hover:text-muted-foreground/80"
              >
                Skip
              </button>
            )}
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={phase === "submitting" || (!currentValue.trim() && !question.required)}
              size="sm"
              style={bubbleStyle as React.CSSProperties}
            >
              {phase === "submitting" ? "Sending…" : "Send"}
            </Button>
          </div>
        ) : null}
      </footer>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
