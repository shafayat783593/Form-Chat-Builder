"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FOCUS_RING, PALETTE } from "./chat-theme";
import {
  NPS_MAX,
  NPS_MIN,
  RANGE_MAX,
  RANGE_MIN,
  RATING_MAX,
  RATING_MIN,
  type QuestionType,
} from "@/lib/field-types";
import { fieldMeta } from "../builder/field-meta";
import { fieldStyleCss } from "@/lib/field-types";

export interface FieldInputProps {
  question: {
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
  value: string;
  onChange: (value: string) => void;
  onSubmit: (valueOverride?: string) => void;
  disabled: boolean;
  themeColor: string;
  error?: string;
  /** Send the answer straight away instead of waiting for the Send button. */
  autoSubmit?: boolean;
}

const TEXT_INPUT_TYPE: Partial<Record<QuestionType, string>> = {
  EMAIL: "email",
  NUMBER: "number",
  DATE: "date",
  PHONE: "tel",
};

const AUTO_COMPLETE: Partial<Record<QuestionType, string>> = {
  EMAIL: "email",
  PHONE: "tel",
  ADDRESS: "street-address",
  FULL_NAME: "name",
};

export function FieldInput({
  question,
  value,
  onChange,
  onSubmit,
  disabled,
  themeColor,
  error,
  autoSubmit = false,
}: FieldInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const style = fieldStyleCss(question);
  const meta = fieldMeta(question.type);
  const placeholder = question.placeholder || meta.placeholder;

  // Focus the primary control when a new question becomes active.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (question.type === "TEXTAREA") textareaRef.current?.focus();
      else if (question.type === "TEXT" || question.type === "CHOICE") inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [question.id, question.type]);

  /** Picking a value either stores it or sends it right away. */
  const pick = (next: string) => (autoSubmit ? onSubmit(next) : onChange(next));

  const inputStyle: React.CSSProperties = {
    ...style,
    borderColor: error ? PALETTE.danger : PALETTE.border,
    backgroundColor: PALETTE.surface,
  };

  const control = (() => {
    switch (question.type) {
      // ---- text-like ----
      case "TEXTAREA":
        return (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={question.label}
            aria-invalid={!!error}
            className={cn("min-h-20 text-base", FOCUS_RING)}
            style={inputStyle}
          />
        );

      case "TEXT":
      case "EMAIL":
      case "NUMBER":
      case "PHONE":
      case "DATE":
      case "ADDRESS":
      case "FULL_NAME":
        return (
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            type={TEXT_INPUT_TYPE[question.type] ?? "text"}
            autoComplete={AUTO_COMPLETE[question.type]}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={question.label}
            aria-invalid={!!error}
            className={cn("h-10 text-base", FOCUS_RING)}
            style={inputStyle}
          />
        );

      // ---- single choice ----
      case "YES_NO":
      case "RADIO":
        return (
          <div className="flex flex-wrap gap-2">
            {(question.type === "YES_NO" ? ["yes", "no"] : (question.options ?? [])).map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onSubmit(option)}
                className={cn("min-h-[44px] rounded-lg border px-4 py-2 text-sm transition-colors", FOCUS_RING)}
                style={{
                  borderColor: PALETTE.border,
                  backgroundColor: value === option ? themeColor : PALETTE.surface,
                  color: value === option ? PALETTE.visitorText : PALETTE.text,
                  ...style,
                }}
                aria-pressed={value === option}
              >
                {option === "yes" ? "Yes" : option === "no" ? "No" : option}
              </button>
            ))}
          </div>
        );

      case "CHOICE":
        return (
          <select
            value={value}
            onChange={(e) => pick(e.target.value)}
            disabled={disabled}
            aria-label={question.label}
            aria-invalid={!!error}
            className={cn("h-10 w-full rounded-lg border px-2.5 text-base", FOCUS_RING)}
            style={inputStyle}
          >
            <option value="">Select…</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      // ---- multi choice ----
      case "CHECKBOX": {
        const picked = value ? value.split(",").map((s) => s.trim()) : [];
        return (
          <div className="flex flex-col gap-2">
            {question.options?.map((option) => {
              const checked = picked.includes(option);
              return (
                <label
                  key={option}
                  className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface, color: PALETTE.text }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? picked.filter((p) => p !== option)
                        : [...picked, option];
                      pick(next.join(","));
                    }}
                    disabled={disabled}
                    className="size-4"
                    style={{ accentColor: themeColor }}
                    aria-label={option}
                  />
                  <span style={style}>{option}</span>
                </label>
              );
            })}
          </div>
        );
      }

      // ---- scales ----
      case "RATING":
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: RATING_MAX - RATING_MIN + 1 }).map((_, i) => {
              const n = RATING_MIN + i;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(String(n))}
                  className={cn("p-1 text-2xl leading-none", FOCUS_RING)}
                  style={{ color: Number(value) >= n ? "#f59e0b" : PALETTE.textMuted }}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                >
                  <Star className={Number(value) >= n ? "size-6 fill-current" : "size-6"} />
                </button>
              );
            })}
          </div>
        );

      case "NPS":
        return (
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: NPS_MAX - NPS_MIN + 1 }).map((_, i) => {
              const n = NPS_MIN + i;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(String(n))}
                  className={cn("grid size-8 place-items-center rounded-md border text-xs", FOCUS_RING)}
                  style={{
                    borderColor: PALETTE.border,
                    backgroundColor: value === String(n) ? themeColor : PALETTE.surface,
                    color: value === String(n) ? PALETTE.visitorText : PALETTE.textMuted,
                  }}
                  aria-label={`NPS ${n}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        );

      case "RANGE":
        return (
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min={RANGE_MIN}
              max={RANGE_MAX}
              value={value || String(RANGE_MIN)}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={cn("w-full", FOCUS_RING)}
              style={{ accentColor: themeColor }}
              aria-label={question.label}
            />
            <div className="flex justify-between text-[11px]" style={{ color: PALETTE.textMuted }}>
              <span>{RANGE_MIN}</span>
              <span className="font-medium">{value || RANGE_MIN}</span>
              <span>{RANGE_MAX}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  })();

  return (
    <div className="flex flex-col gap-1.5">
      {control}
      {error ? (
        <p id={`${question.id}-err`} role="alert" className="text-[11px]" style={{ color: PALETTE.danger }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
