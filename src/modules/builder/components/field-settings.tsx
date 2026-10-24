"use client";

import { ChevronDown, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_FONT_SIZE,
  FONT_STYLES,
  FONT_WEIGHTS,
  MAX_FONT_SIZE,
  MAX_PLACEHOLDER,
  MIN_FONT_SIZE,
} from "@/lib/field-types";
import { cn } from "@/lib/utils";
import type { ClientQuestion } from "../builder-state";
import { fieldMeta } from "../field-meta";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const WEIGHT_LABELS: Record<string, string> = {
  normal: "Reg",
  medium: "Med",
  semibold: "SB",
  bold: "B",
};

const STYLE_LABELS: Record<string, string> = {
  normal: "Normal",
  italic: "Italic",
};

const SMALL_BUTTON = "shrink-0 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted";
const STEP_BUTTON =
  "grid size-8 shrink-0 place-items-center rounded-md border border-input hover:bg-muted";

interface FieldSettingsProps {
  question: ClientQuestion;
  onChange: (patch: Partial<ClientQuestion>) => void;
  onClose: () => void;
}

/** The panel that opens under a question: placeholder, text colour, font size, weight, style. */
export function FieldSettings({ question, onChange, onClose }: FieldSettingsProps) {
  const meta = fieldMeta(question.type);

  return (
    <div className="border-t border-border bg-muted/30 px-4 py-4">
      <button
        type="button"
        onClick={onClose}
        className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronDown className="size-3.5 rotate-180" />
        Hide field settings
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
        {meta.kind === "text" ? (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor={`placeholder-${question.clientId}`}
            >
              Placeholder
            </label>
            <Input
              id={`placeholder-${question.clientId}`}
              value={question.placeholder ?? ""}
              onChange={(event) => onChange({ placeholder: event.target.value || null })}
              placeholder={meta.placeholder}
              maxLength={MAX_PLACEHOLDER}
              className="h-8"
            />
          </div>
        ) : null}

        <TextColorControl color={question.textColor} onChange={(textColor) => onChange({ textColor })} />
        <FontSizeControl size={question.fontSize} onChange={(fontSize) => onChange({ fontSize })} />

        <ChoiceButtons
          label="Font weight"
          columns="grid-cols-4"
          choices={FONT_WEIGHTS}
          labels={WEIGHT_LABELS}
          selected={question.fontWeight}
          onSelect={(fontWeight) => onChange({ fontWeight })}
          previewStyle={(choice) => ({ fontWeight: choice })}
        />
        <ChoiceButtons
          label="Font style"
          columns="grid-cols-2"
          choices={FONT_STYLES}
          labels={STYLE_LABELS}
          selected={question.fontStyle}
          onSelect={(fontStyle) => onChange({ fontStyle })}
          previewStyle={(choice) => ({ fontStyle: choice })}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The individual controls
// ---------------------------------------------------------------------------

function ControlLabel({ children }: { children: string }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

interface TextColorControlProps {
  color: string | null | undefined;
  onChange: (color: string | null) => void;
}

function TextColorControl({ color, onChange }: TextColorControlProps) {
  function handleHexInput(text: string) {
    const value = text.trim();
    if (value === "") onChange(null);
    else if (HEX_COLOR.test(value)) onChange(value);
    // Anything else is a half-typed colour: ignore it until it is complete.
  }

  return (
    <div className="flex flex-col gap-1.5">
      <ControlLabel>Text colour</ControlLabel>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={color ?? "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-9 cursor-pointer rounded-lg border-0 p-0"
          aria-label="Text colour"
        />
        <Input
          value={color ?? ""}
          onChange={(event) => handleHexInput(event.target.value)}
          placeholder="#000000"
          className="h-8 font-mono text-xs"
          aria-label="Text colour hex"
        />
        <button type="button" onClick={() => onChange(null)} className={SMALL_BUTTON}>
          Reset
        </button>
      </div>
    </div>
  );
}

interface FontSizeControlProps {
  size: number | null | undefined;
  onChange: (size: number | null) => void;
}

function FontSizeControl({ size, onChange }: FontSizeControlProps) {
  const current = size ?? DEFAULT_FONT_SIZE;

  return (
    <div className="flex flex-col gap-1.5">
      <ControlLabel>Font size</ControlLabel>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(MIN_FONT_SIZE, current - 1))}
          className={STEP_BUTTON}
          aria-label="Decrease font size"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-10 text-center text-sm tabular-nums">{current}px</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX_FONT_SIZE, current + 1))}
          className={STEP_BUTTON}
          aria-label="Increase font size"
        >
          <Plus className="size-3.5" />
        </button>
        <button type="button" onClick={() => onChange(null)} className={SMALL_BUTTON}>
          Reset
        </button>
      </div>
    </div>
  );
}

interface ChoiceButtonsProps {
  label: string;
  columns: string;
  choices: readonly string[];
  labels: Record<string, string>;
  selected: string | null | undefined;
  /** Clicking the selected choice again clears it (null = use the default). */
  onSelect: (choice: string | null) => void;
  /** Lets each button show its own choice, e.g. bold text on the "Bold" button. */
  previewStyle: (choice: string) => React.CSSProperties;
}

/** A row of buttons where at most one can be selected. */
function ChoiceButtons({
  label,
  columns,
  choices,
  labels,
  selected,
  onSelect,
  previewStyle,
}: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <ControlLabel>{label}</ControlLabel>
      <div className={cn("grid gap-1", columns)}>
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onSelect(selected === choice ? null : choice)}
            className={cn(
              "rounded-md border px-2 py-1.5 text-[11px] transition-colors",
              selected === choice
                ? "border-transparent bg-foreground text-background"
                : "border-input hover:bg-muted",
            )}
            style={previewStyle(choice)}
          >
            {labels[choice]}
          </button>
        ))}
      </div>
    </div>
  );
}
