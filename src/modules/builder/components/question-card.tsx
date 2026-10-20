"use client";

import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Settings2,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  FONT_STYLES,
  FONT_WEIGHTS,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  NPS_MAX,
  NPS_MIN,
  RANGE_MAX,
  RANGE_MIN,
  RATING_MAX,
  hasOptions,
} from "@/lib/field-types";
import type { ClientQuestion } from "../use-builder-state";
import { fieldMeta } from "../field-meta";
import { OptionsEditor } from "./options-editor";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: ClientQuestion;
  index: number;
  total: number;
  onUpdate: (clientId: string, patch: Partial<ClientQuestion>) => void;
  onRemove: (clientId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDuplicate: (clientId: string) => void;
}

export function QuestionCard({
  question,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
  onDuplicate,
}: QuestionCardProps) {
  const [open, setOpen] = useState(false);
  const meta = fieldMeta(question.type);
  const Icon = meta.icon;
  const isText = meta.kind === "text";
  const isYesNo = question.type === "YES_NO";

  const fontSize = question.fontSize ?? 14;
  const textColor = question.textColor ?? undefined;

  const labelStyle: React.CSSProperties = {
    fontSize: question.fontSize ? `${question.fontSize}px` : undefined,
    fontWeight: (question.fontWeight ?? undefined) as React.CSSProperties["fontWeight"],
    fontStyle: (question.fontStyle ?? undefined) as React.CSSProperties["fontStyle"],
    color: textColor,
  };

  const previewStyle: React.CSSProperties = {
    fontSize: question.fontSize ? `${question.fontSize}px` : undefined,
    fontWeight: (question.fontWeight ?? undefined) as React.CSSProperties["fontWeight"],
    fontStyle: (question.fontStyle ?? undefined) as React.CSSProperties["fontStyle"],
    color: textColor,
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-colors",
        open ? "border-foreground/25" : "border-input hover:border-foreground/15"
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-3.5" />
          </span>

          <div className="min-w-0 flex-1">
            {/* Label row */}
            <div className="flex items-start justify-between gap-3">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Question label</span>
                <Input
                  value={question.label}
                  onChange={(e) => onUpdate(question.clientId, { label: e.target.value })}
                  placeholder="Question label"
                  maxLength={200}
                  className="h-7 border-transparent bg-transparent px-1.5 text-sm font-semibold shadow-none hover:border-input focus:border-input"
                  style={labelStyle}
                />
              </label>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className={cn(
                    "grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted",
                    open && "bg-muted text-foreground"
                  )}
                  aria-label="Field settings"
                  aria-expanded={open}
                >
                  <Settings2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, index - 1)}
                  disabled={index === 0}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, index + 1)}
                  disabled={index === total - 1}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(question.clientId)}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                  aria-label="Duplicate question"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(question.clientId)}
                  className="grid size-7 place-items-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                  aria-label="Delete question"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Required marker */}
            <div className="mt-1 flex items-center gap-2 pl-1.5">
              {question.required ? (
                <span className="text-xs font-semibold text-destructive">*</span>
              ) : null}
              <span className="text-[11px] text-muted-foreground">Required</span>
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => onUpdate(question.clientId, { required: checked })}
                className="scale-75 origin-left"
                aria-label="Required"
              />
            </div>

            {/* Preview */}
            <div className="mt-2.5">
              {hasOptions(question.type) ? (
                <OptionsEditor
                  options={question.options}
                  onChange={(options) => onUpdate(question.clientId, { options })}
                  error={null}
                />
              ) : isYesNo ? (
                <div className="flex items-center gap-4 text-sm text-muted-foreground" style={previewStyle}>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 rounded-full border" />
                    Yes
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 rounded-full border" />
                    No
                  </span>
                </div>
              ) : question.type === "RATING" ? (
                <div className="flex items-center gap-1 text-muted-foreground" style={previewStyle}>
                  {Array.from({ length: RATING_MAX }).map((_, i) => (
                    <span key={i} className="text-lg leading-none">
                      ★
                    </span>
                  ))}
                </div>
              ) : question.type === "RANGE" ? (
                <div className="flex items-center gap-3" style={previewStyle}>
                  <span className="text-xs text-muted-foreground">{RANGE_MIN}</span>
                  <span className="h-1.5 flex-1 rounded-full bg-muted" />
                  <span className="text-xs text-muted-foreground">{RANGE_MAX}</span>
                </div>
              ) : question.type === "NPS" ? (
                <div className="flex flex-wrap items-center gap-1" style={previewStyle}>
                  {Array.from({ length: NPS_MAX - NPS_MIN + 1 }).map((_, i) => (
                    <span
                      key={i}
                      className="grid size-7 place-items-center rounded-md border text-xs text-muted-foreground"
                    >
                      {NPS_MIN + i}
                    </span>
                  ))}
                </div>
              ) : question.type === "TEXTAREA" ? (
                <Textarea
                  readOnly
                  value={question.placeholder ?? ""}
                  className="pointer-events-none min-h-20 resize-none bg-muted/40 text-muted-foreground"
                  style={previewStyle}
                />
              ) : question.type === "DATE" ? (
                <Input
                  readOnly
                  value={question.placeholder ?? ""}
                  placeholder="Select a date"
                  className="pointer-events-none h-9 bg-muted/40 text-muted-foreground"
                  style={previewStyle}
                />
              ) : (
                <Input
                  readOnly
                  value={question.placeholder ?? ""}
                  placeholder={question.placeholder || "Enter your answer"}
                  className="pointer-events-none h-9 bg-muted/40 text-muted-foreground"
                  style={previewStyle}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable field settings */}
      {open ? (
        <div className="border-t border-border bg-muted/30 px-4 py-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="size-3.5 rotate-180" />
            Hide field settings
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Placeholder */}
            {isText ? (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`ph-${question.clientId}`}>
                  Placeholder
                </label>
                <Input
                  id={`ph-${question.clientId}`}
                  value={question.placeholder ?? ""}
                  onChange={(e) => onUpdate(question.clientId, { placeholder: e.target.value || null })}
                  placeholder={meta.placeholder}
                  maxLength={120}
                  className="h-8"
                />
              </div>
            ) : null}

            {/* Text colour */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Text colour</span>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={question.textColor ?? "#000000"}
                  onChange={(e) => onUpdate(question.clientId, { textColor: e.target.value })}
                  className="h-8 w-9 cursor-pointer rounded-lg border-0 p-0"
                  aria-label="Text colour"
                />
                <Input
                  value={question.textColor ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    if (v === "") return onUpdate(question.clientId, { textColor: null });
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) onUpdate(question.clientId, { textColor: v });
                  }}
                  placeholder="#000000"
                  className="h-8 font-mono text-xs"
                  aria-label="Text colour hex"
                />
                <button
                  type="button"
                  onClick={() => onUpdate(question.clientId, { textColor: null })}
                  className="shrink-0 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Font size */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Font size</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdate(question.clientId, {
                      fontSize: Math.max(MIN_FONT_SIZE, fontSize - 1),
                    })
                  }
                  className="grid size-8 shrink-0 place-items-center rounded-md border border-input hover:bg-muted"
                  aria-label="Decrease font size"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-10 text-center text-sm tabular-nums">{fontSize}px</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate(question.clientId, {
                      fontSize: Math.min(MAX_FONT_SIZE, fontSize + 1),
                    })
                  }
                  className="grid size-8 shrink-0 place-items-center rounded-md border border-input hover:bg-muted"
                  aria-label="Increase font size"
                >
                  <Plus className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(question.clientId, { fontSize: null })}
                  className="shrink-0 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Font weight */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Font weight</span>
              <div className="grid grid-cols-4 gap-1">
                {FONT_WEIGHTS.map((weight) => (
                  <button
                    key={weight}
                    type="button"
                    onClick={() =>
                      onUpdate(question.clientId, {
                        fontWeight: question.fontWeight === weight ? null : weight,
                      })
                    }
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-[11px] transition-colors",
                      question.fontWeight === weight
                        ? "border-transparent bg-foreground text-background"
                        : "border-input hover:bg-muted"
                    )}
                    style={{ fontWeight: weight }}
                  >
                    {weight === "semibold" ? "SB" : weight === "medium" ? "Med" : weight === "bold" ? "B" : "Reg"}
                  </button>
                ))}
              </div>
            </div>

            {/* Font style */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Font style</span>
              <div className="grid grid-cols-2 gap-1">
                {FONT_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() =>
                      onUpdate(question.clientId, {
                        fontStyle: question.fontStyle === style ? null : style,
                      })
                    }
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-[11px] transition-colors",
                      question.fontStyle === style
                        ? "border-transparent bg-foreground text-background"
                        : "border-input hover:bg-muted"
                    )}
                    style={{ fontStyle: style }}
                  >
                    {style === "italic" ? "Italic" : "Normal"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
