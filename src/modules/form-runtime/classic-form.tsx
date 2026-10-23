// UNUSED: the visitor experience is chat-only (see modules/chat). This file is
// kept for reference and for a future multi-page form mode; nothing renders it.
"use client";

import { useState } from "react";
import { Star, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  NPS_MAX,
  NPS_MIN,
  RANGE_MAX,
  RANGE_MIN,
  RATING_MAX,
  RATING_MIN,
  hasOptions,
  validateAnswer,
  type QuestionType,
} from "@/lib/field-types";
import { fieldMeta } from "@/modules/builder/field-meta";
import { collectPrefill, type SearchParams } from "./prefill";

export interface RuntimeQuestion {
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
}

export interface RuntimeForm {
  slug: string;
  title: string;
  description: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  submitButtonText: string;
  displayMode: "CLASSIC" | "FOCUS";
  showProgress: boolean;
  multiPageForm: boolean;
  questions: RuntimeQuestion[];
}

interface ClassicFormProps {
  form: RuntimeForm;
  /** When set the form actually submits to the public API. */
  live?: boolean;
  onComplete?: () => void;
  /** Query string used to pre-answer questions that have a prefillKey. */
  searchParams?: SearchParams;
}

export function ClassicForm({ form, live = false, onComplete, searchParams }: ClassicFormProps) {
  // Prefill: only values that pass the normal validation are accepted.
  const [values, setValues] = useState<Record<string, string>>(() =>
    collectPrefill(form.questions, searchParams),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const perPage = form.multiPageForm ? 4 : form.questions.length;
  const pages = form.multiPageForm
    ? Array.from({ length: Math.ceil(form.questions.length / perPage) }, (_, i) =>
        form.questions.slice(i * perPage, (i + 1) * perPage)
      )
    : [form.questions];
  const currentPage = Math.min(page, pages.length - 1);
  const visible = pages[currentPage];

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function toggleMulti(id: string, option: string, current: string) {
    const picked = current ? current.split(",").map((s) => s.trim()) : [];
    const next = picked.includes(option)
      ? picked.filter((p) => p !== option)
      : [...picked, option];
    setValue(id, next.join(","));
  }

  function validatePage(): boolean {
    const next: Record<string, string> = {};
    for (const q of visible) {
      const value = (values[q.id] ?? "").trim();
      if (q.required && !value) {
        next[q.id] = "This question is required";
        continue;
      }
      if (!value) continue;
      const message = validateAnswer(q.type, value, q.options);
      if (message) next[q.id] = message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePage()) return;

    if (form.multiPageForm && currentPage < pages.length - 1) {
      setPage(currentPage + 1);
      return;
    }

    if (!live) {
      setDone(true);
      onComplete?.();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/forms/${form.slug}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(values)
            .filter(([, v]) => v.trim() !== "")
            .map(([questionId, value]) => ({ questionId, value: value.trim() })),
        }),
      });
      if (res.status === 422) {
        const body = await res.json().catch(() => ({}));
        const details: Record<string, string> = body?.details ?? {};
        setErrors(details);
        const failingId = Object.keys(details)[0];
        if (failingId) {
          const idx = form.questions.findIndex((q) => q.id === failingId);
          if (idx >= 0) setPage(Math.floor(idx / perPage));
        }
        return;
      }
      if (!res.ok) throw new Error("failed");
      setDone(true);
      onComplete?.();
    } catch {
      setErrors({ __form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="size-12 rounded-full bg-success/10 text-success">✓</div>
        <p className="text-lg font-semibold">Thanks!</p>
        <p className="text-sm text-muted-foreground">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {visible.map((q) => (
        <RuntimeField
          key={q.id}
          question={q}
          value={values[q.id] ?? ""}
          error={errors[q.id]}
          onChange={(v) => setValue(q.id, v)}
          onToggle={(opt) => toggleMulti(q.id, opt, values[q.id] ?? "")}
        />
      ))}

      {errors.__form ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.__form}
        </p>
      ) : null}

      {form.showProgress && form.multiPageForm ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((currentPage + 1) / pages.length) * 100}%`,
                backgroundColor: form.themeColor,
              }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {currentPage + 1} / {pages.length}
          </span>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {form.multiPageForm && currentPage > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage(currentPage - 1)}
            className="gap-1.5"
          >
            <ChevronLeft className="size-4" /> Back
          </Button>
        ) : (
          <span />
        )}

        <Button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: form.themeColor, color: "#ffffff" }}
        >
          {submitting
            ? "Sending…"
            : form.multiPageForm && currentPage < pages.length - 1
              ? "Next"
              : form.submitButtonText || "Submit"}
        </Button>
      </div>
    </form>
  );
}

function RuntimeField({
  question,
  value,
  error,
  onChange,
  onToggle,
}: {
  question: RuntimeQuestion;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onToggle: (option: string) => void;
}) {
  const meta = fieldMeta(question.type);
  const style: React.CSSProperties = {
    fontSize: `${question.fontSize ?? DEFAULT_FONT_SIZE}px`,
    fontWeight: (question.fontWeight ?? DEFAULT_FONT_WEIGHT) as React.CSSProperties["fontWeight"],
    fontStyle: (question.fontStyle ?? "normal") as React.CSSProperties["fontStyle"],
    color: question.textColor ?? undefined,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={style}>
        {question.label}
        {question.required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>

      {hasOptions(question.type) ? (
        question.type === "CHOICE" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={question.label}
          >
            <option value="">Select an option</option>
            {question.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : question.type === "CHECKBOX" ? (
          <div className="flex flex-col gap-2">
            {question.options?.map((opt) => {
              const checked = value.split(",").map((s) => s.trim()).includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2.5 text-sm font-normal">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(opt)}
                    className="size-4 rounded accent-primary"
                  />
                  <span style={style}>{opt}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {question.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 text-sm font-normal">
                <input
                  type="radio"
                  name={question.id}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="size-4 accent-primary"
                />
                <span style={style}>{opt}</span>
              </label>
            ))}
          </div>
        )
      ) : question.type === "YES_NO" ? (
        <div className="flex items-center gap-4 text-sm">
          {["yes", "no"].map((v) => (
            <label key={v} className="flex items-center gap-2 font-normal">
              <input
                type="radio"
                name={question.id}
                checked={value === v}
                onChange={() => onChange(v)}
                className="size-4 accent-primary"
              />
              <span className="capitalize" style={style}>
                {v}
              </span>
            </label>
          ))}
        </div>
      ) : question.type === "RATING" ? (
        <div className="flex items-center gap-1">
          {Array.from({ length: RATING_MAX - RATING_MIN + 1 }).map((_, i) => {
            const n = RATING_MIN + i;
            const active = Number(value) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(String(n))}
                className="p-0.5 text-2xl leading-none transition-colors"
                style={{ color: active ? "#f59e0b" : undefined }}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
              >
                <Star className={active ? "size-6 fill-current" : "size-6"} />
              </button>
            );
          })}
        </div>
      ) : question.type === "RANGE" ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{RANGE_MIN}</span>
          <input
            type="range"
            min={RANGE_MIN}
            max={RANGE_MAX}
            value={value || String(RANGE_MIN)}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 accent-primary"
            aria-label={question.label}
          />
          <span className="text-xs text-muted-foreground">{RANGE_MAX}</span>
        </div>
      ) : question.type === "NPS" ? (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: NPS_MAX - NPS_MIN + 1 }).map((_, i) => {
            const n = NPS_MIN + i;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(String(n))}
                className={cn(
                  "grid size-8 place-items-center rounded-md border text-xs transition-colors",
                  value === String(n)
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-input hover:bg-muted"
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
      ) : question.type === "TEXTAREA" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || meta.placeholder}
          className="min-h-24 resize-y"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={
            question.type === "EMAIL"
              ? "email"
              : question.type === "NUMBER"
                ? "number"
                : question.type === "DATE"
                  ? "date"
                  : question.type === "PHONE"
                    ? "tel"
                    : "text"
          }
          placeholder={question.placeholder || meta.placeholder}
          className="h-9"
        />
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
