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
import { FOCUS_RING, PALETTE } from "./chat-theme";
import { collectPrefill, type SearchParams } from "@/modules/form-runtime/prefill";

type Question = {
  id: string;
  type: QuestionType;
  label: string;
  options: string[] | null;
  required: boolean;
  prefillKey?: string | null;
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
  /** Query string used to pre-answer questions that have a prefillKey. */
  searchParams?: SearchParams;
}

/** How long the bot "thinks" before showing the next question. */
const TYPING_DELAY_MS = 500;

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

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Chat({ form, previewMode = false, searchParams }: ChatProps) {
  // Prefill: pre-answered questions still have to pass the normal validation.
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    collectPrefill(form.questions, searchParams),
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<
    "welcome" | "typing" | "question" | "submitting" | "completed" | "error"
  >("welcome");
  const [errorDetails, setErrorDetails] = useState<Record<string, string>>({});
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [skipActive, setSkipActive] = useState(false);

  const msgEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMounted = useRef(false);

  const question = form.questions[index];
  const isLast = index >= form.questions.length - 1;
  const currentValue = answers[question?.id ?? ""] ?? "";

  const scrollToBottom = useCallback(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [index, phase, question, scrollToBottom]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Focus the input again whenever a new question becomes active.
  useEffect(() => {
    if (phase !== "question") return;
    const timer = setTimeout(() => {
      if (question?.type === "TEXTAREA") textareaRef.current?.focus();
      else if (question?.type === "TEXT" || question?.type === "EMAIL" || question?.type === "NUMBER" || question?.type === "PHONE" || question?.type === "DATE" || question?.type === "ADDRESS" || question?.type === "FULL_NAME")
        inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [phase, question]);

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

  /** Moves to the next question, showing a short typing indicator first. */
  const advance = useCallback(() => {
    setPhase("typing");
    const delay = prefersReducedMotion() ? 0 : TYPING_DELAY_MS;
    setTimeout(() => {
      if (!isMounted.current) return;
      setIndex((i) => i + 1);
      setPhase("question");
    }, delay);
  }, []);

  const skipCurrent = () => {
    if (!question || !question.required) return;
    setSkipActive(true);
    setAnswers((prev) => ({ ...prev, [question.id]: "" }));
    advance();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question) return;

    const err = validateCurrent();
    if (err) {
      setErrorDetails((prev) => ({ ...prev, [question.id]: err }));
      // The question stays active and the input gets the focus back.
      if (question.type === "TEXTAREA") textareaRef.current?.focus();
      else inputRef.current?.focus();
      return;
    }

    if (currentValue.trim() || question.required) {
      setAnswers((prev) => ({ ...prev, [question.id]: currentValue.trim() }));
    }

    if (!isLast) {
      advance();
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
        // Jump back to the failing question.
        const failingId = Object.keys(details)[0];
        if (failingId) {
          const idx = form.questions.findIndex((q) => q.id === failingId);
          if (idx >= 0) {
            setIndex(idx);
            setPhase("question");
          }
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

  const themeText = contrastTextColor(form.themeColor);

  // ---------------------------------------------------------------------
  // Welcome screen
  // ---------------------------------------------------------------------
  if (phase === "welcome") {
    return (
      <div
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ backgroundColor: PALETTE.surface, color: PALETTE.text }}
      >
        <div
          className="inline-flex size-12 items-center justify-center rounded-full font-semibold"
          style={{ backgroundColor: form.themeColor, color: themeText }}
        >
          {form.title.slice(0, 1).toUpperCase()}
        </div>
        <p className="max-w-xs text-sm" style={{ color: PALETTE.textMuted }}>
          {form.welcomeText}
        </p>
        <Button
          onClick={() => setPhase("question")}
          className={FOCUS_RING}
          style={{ backgroundColor: form.themeColor, color: themeText }}
        >
          Start
        </Button>
        {previewMode && (
          <p className="mt-3 text-[11px]" style={{ color: PALETTE.textMuted }}>
            Preview — responses are not saved
          </p>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Completion screen
  // ---------------------------------------------------------------------
  if (phase === "completed") {
    return (
      <div
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ backgroundColor: PALETTE.surface, color: PALETTE.text }}
      >
        <div className="grid size-12 place-items-center rounded-full" style={{ color: PALETTE.textMuted }}>
          <CheckCircle className="size-7" />
        </div>
        <h3 className="text-lg font-semibold">Thanks!</h3>
        <p className="max-w-xs text-sm" style={{ color: PALETTE.textMuted }}>
          {form.completionText}
        </p>
        <Button
          onClick={restart}
          variant="outline"
          className={FOCUS_RING}
          style={{ borderColor: PALETTE.border, color: PALETTE.text }}
        >
          Start over
        </Button>
        {previewMode && (
          <p className="mt-3 text-[11px]" style={{ color: PALETTE.textMuted }}>
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
    color: question?.textColor ?? PALETTE.text,
  };

  const isYesNo = question?.type === "YES_NO";
  const isMulti = question ? isMultiSelect(question.type) : false;
  const isOptions = question ? hasOptions(question.type) : false;
  const isScale =
    question?.type === "RATING" || question?.type === "RANGE" || question?.type === "NPS";
  const isText = !isYesNo && !isMulti && !isOptions && !isScale;

  const bubbleStyle = { backgroundColor: PALETTE.surfaceMuted, color: PALETTE.text };

  return (
    <div
      className="flex h-[100dvh] flex-col"
      style={{ backgroundColor: PALETTE.surface, color: PALETTE.text }}
    >
      {/* Message list */}
      <main
        className="flex-1 overflow-y-auto p-4 sm:p-6"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="mx-auto max-w-md space-y-4">
          {index === 0 && phase !== "error" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-3 text-sm" style={bubbleStyle}>
                {form.welcomeText}
              </div>
            </div>
          )}

          {question && phase !== "typing" && (
            <div className="flex justify-start">
              <div
                className="max-w-[85%] rounded-2xl border p-3 text-sm"
                style={{ backgroundColor: PALETTE.surface, borderColor: PALETTE.border, color: PALETTE.text }}
              >
                <span className="font-semibold" style={questionStyle}>
                  {question.label}
                </span>
                {question.required && (
                  <span className="ml-1 text-[10px]" style={{ color: PALETTE.danger }}>
                    *
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {phase === "typing" && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-1 rounded-2xl p-3"
                style={bubbleStyle}
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
          )}

          {networkError && (
            <div className="flex justify-start">
              <div
                className="max-w-[80%] rounded-2xl border p-3 text-sm"
                style={{
                  backgroundColor: PALETTE.dangerSurface,
                  borderColor: PALETTE.danger,
                  color: PALETTE.danger,
                }}
              >
                <AlertCircle className="mr-2 inline size-4" /> {networkError}
                <button
                  onClick={retry}
                  className="ml-3 underline underline-offset-4"
                  style={{ color: PALETTE.danger }}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Visitor answers */}
          {Object.entries(answers).map(([qid, value]) => {
            const q = form.questions.find((x) => x.id === qid);
            if (!q || !value.trim()) return null;
            return (
              <div key={qid} className="flex justify-end">
                <div
                  className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
                  style={{ backgroundColor: PALETTE.visitorBubble, color: PALETTE.visitorText }}
                >
                  {value.split(",").join(", ")}
                </div>
              </div>
            );
          })}

          <div ref={msgEndRef} />

          {question && errorDetails[question.id] && (
            <p className="mx-auto max-w-md text-[11px]" style={{ color: PALETTE.danger }}>
              {errorDetails[question.id]}
            </p>
          )}
        </div>
      </main>

      {/* Input area, pinned to the bottom */}
      <footer
        className="sticky bottom-0 z-10 flex items-center justify-center gap-2 border-t p-4 sm:p-6"
        style={{ backgroundColor: PALETTE.surface, borderColor: PALETTE.border }}
      >
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
                  className={cn("p-1 text-2xl leading-none", FOCUS_RING)}
                  style={{ color: active ? "#f59e0b" : PALETTE.textMuted }}
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
              className="w-full"
              style={{ accentColor: form.themeColor }}
              aria-label={question.label}
            />
            <div className="flex justify-between text-[11px]" style={{ color: PALETTE.textMuted }}>
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
                    FOCUS_RING
                  )}
                  style={{
                    borderColor: PALETTE.border,
                    backgroundColor:
                      currentValue === value ? form.themeColor : PALETTE.surface,
                    color: currentValue === value ? themeText : PALETTE.textMuted,
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ) : isMulti ? (
          <div className="flex w-full max-w-md flex-col gap-2">
            {question.options?.map((opt) => {
              const checked = currentValue.split(",").map((s) => s.trim()).includes(opt);
              return (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, color: PALETTE.text }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMulti(opt)}
                    className="size-4"
                    style={{ accentColor: form.themeColor }}
                  />
                  <span style={questionStyle}>{opt}</span>
                </label>
              );
            })}
          </div>
        ) : isOptions ? (
          <div className="flex w-full max-w-md flex-col gap-2">
            {question.type === "CHOICE" ? (
              <select
                value={currentValue}
                onChange={(e) => setAnswer(e.target.value)}
                className={cn("h-9 w-full rounded-lg border px-2.5 text-base", FOCUS_RING)}
                style={{
                  borderColor: PALETTE.border,
                  backgroundColor: PALETTE.surface,
                  color: PALETTE.text,
                }}
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
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, color: PALETTE.text }}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={currentValue === opt}
                    onChange={() => setAnswer(opt)}
                    className="size-4"
                    style={{ accentColor: form.themeColor }}
                  />
                  <span style={questionStyle}>{opt}</span>
                </label>
              ))
            )}
          </div>
        ) : isYesNo ? (
          <div className="flex items-center gap-2">
            {["yes", "no"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAnswer(v)}
                disabled={phase === "submitting"}
                className={cn("rounded-lg border px-4 py-2 text-sm capitalize", FOCUS_RING)}
                style={{
                  borderColor: PALETTE.border,
                  backgroundColor: currentValue === v ? form.themeColor : PALETTE.surface,
                  color: currentValue === v ? themeText : PALETTE.textMuted,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md gap-2">
            {question?.type === "TEXTAREA" ? (
              <Textarea
                ref={textareaRef}
                value={currentValue}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={question.placeholder || "Type your answer…"}
                disabled={phase === "submitting"}
                className={cn("min-h-20 flex-1 text-base", FOCUS_RING)}
                style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, color: PALETTE.text }}
              />
            ) : (
              <Input
                ref={inputRef}
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
                className={cn("h-10 flex-1 text-base", FOCUS_RING)}
                style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, color: PALETTE.text }}
              />
            )}
            <Button
              type="submit"
              disabled={phase === "submitting" || (!currentValue.trim() && !question?.required)}
              className={cn("shrink-0", FOCUS_RING)}
              style={{ backgroundColor: form.themeColor, color: themeText }}
            >
              <Send className="size-4" />
            </Button>
          </form>
        )}

        {/* Skip + send for the non-text question types */}
        {question && !isText ? (
          <div className="mt-3 flex items-center gap-3">
            {question.required ? null : (
              <button
                type="button"
                onClick={skipCurrent}
                disabled={phase === "submitting" || skipActive}
                className="text-[11px] underline underline-offset-4"
                style={{ color: PALETTE.textMuted }}
              >
                Skip
              </button>
            )}
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={phase === "submitting" || (!currentValue.trim() && !question.required)}
              size="sm"
              className={FOCUS_RING}
              style={{ backgroundColor: form.themeColor, color: themeText }}
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
