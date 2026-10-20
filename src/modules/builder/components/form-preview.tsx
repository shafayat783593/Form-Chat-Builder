"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NPS_MAX,
  NPS_MIN,
  RANGE_MAX,
  RANGE_MIN,
  RATING_MAX,
  RATING_MIN,
  hasOptions,
} from "@/lib/field-types";
import { fieldMeta } from "../field-meta";
import type { ClientQuestion } from "../use-builder-state";

type Device = "desktop" | "tablet" | "mobile";

const DEVICES: { id: Device; label: string; icon: typeof Monitor; width: string }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "max-w-3xl" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "max-w-xl" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "max-w-sm" },
];

export interface PreviewFormData {
  title: string;
  description: string | null;
  themeColor: string;
  questions: ClientQuestion[];
}

interface FormPreviewProps {
  form: PreviewFormData;
  backHref: string;
  liveHref?: string;
  formName?: string;
}

export function FormPreview({ form, backHref, liveHref, formName }: FormPreviewProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const active = DEVICES.find((d) => d.id === device)!;

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: string, option: string, current: string) {
    const picked = current ? current.split(",").map((s) => s.trim()) : [];
    const next = picked.includes(option)
      ? picked.filter((p) => p !== option)
      : [...picked, option];
    setValue(id, next.join(","));
  }

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-sm font-bold tracking-tight">Form Preview</span>
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {formName ?? form.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-0.5 rounded-lg border bg-card p-0.5 sm:flex">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    device === d.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <d.icon className="size-3.5" />
                  {d.label}
                </button>
              ))}
            </div>
            <a
              href={backHref}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to Editor
            </a>
          </div>
        </div>
      </header>

      {/* Preview banner */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span>
            Preview only. Responses and files are not sent or saved.{" "}
            {liveHref ? (
              <a href={liveHref} target="_blank" rel="noopener noreferrer" className="underline">
                Reset preview
              </a>
            ) : null}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto px-4 py-8">
        <div
          className={cn(
            "mx-auto rounded-xl border bg-card p-6 shadow-sm transition-all sm:p-10",
            active.width
          )}
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: form.themeColor }}
          >
            {form.title}
          </h1>
          {form.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
          ) : null}

          {submitted ? (
            <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm font-medium">This was a preview — nothing was submitted.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setSubmitted(false)}>
                Fill in again
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="mt-8 flex flex-col gap-6"
            >
              {form.questions.map((q) => (
                <PreviewField
                  key={q.clientId}
                  question={q}
                  value={values[q.clientId] ?? ""}
                  onChange={(v) => setValue(q.clientId, v)}
                  onToggle={(opt) => toggleMulti(q.clientId, opt, values[q.clientId] ?? "")}
                />
              ))}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  style={{ backgroundColor: form.themeColor, color: "#ffffff" }}
                >
                  Submit
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewField({
  question,
  value,
  onChange,
  onToggle,
}: {
  question: ClientQuestion;
  value: string;
  onChange: (value: string) => void;
  onToggle: (option: string) => void;
}) {
  const meta = fieldMeta(question.type);
  const style: React.CSSProperties = {
    fontSize: question.fontSize ? `${question.fontSize}px` : undefined,
    fontWeight: (question.fontWeight ?? undefined) as React.CSSProperties["fontWeight"],
    fontStyle: (question.fontStyle ?? undefined) as React.CSSProperties["fontStyle"],
    color: question.textColor ?? undefined,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={style}>
        {question.label}
        {question.required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>

      {hasOptions(question.type) ? (
        question.type === "CHOICE" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <label key={opt} className="flex items-center gap-2 text-sm">
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
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={question.clientId}
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
            <label key={v} className="flex items-center gap-2">
              <input
                type="radio"
                name={question.clientId}
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
                ★
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
          style={style}
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
          style={style}
        />
      )}
    </div>
  );
}
