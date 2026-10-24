"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  OPTION_FORBIDDEN_CHAR,
  hasForbiddenOptionChar,
} from "@/lib/field-types";

interface OptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

/** Edits the list of choices of a dropdown, radio or checkbox question. */
export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const canRemove = options.length > MIN_OPTIONS;
  const canAdd = options.length < MAX_OPTIONS;

  function changeOption(index: number, value: string) {
    onChange(options.map((option, i) => (i === index ? value : option)));
  }

  function removeOption(index: number) {
    if (canRemove) onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((option, index) => {
        const invalid = option.includes(OPTION_FORBIDDEN_CHAR);
        return (
          <div key={index} className="flex items-center gap-2">
            <span className="size-4 shrink-0 rounded-full border border-input" />
            <Input
              value={option}
              onChange={(event) => changeOption(index, event.target.value)}
              placeholder={`Option ${index + 1}`}
              maxLength={100}
              aria-invalid={invalid}
              className={`h-8 ${invalid ? "border-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={!canRemove}
              className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-30 disabled:pointer-events-none"
              aria-label={`Remove option ${index + 1}`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...options, ""])}
        disabled={!canAdd}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-input px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Plus className="size-3.5" /> Add option
      </button>

      {!canAdd ? (
        <p className="text-[11px] text-muted-foreground">Maximum {MAX_OPTIONS} options.</p>
      ) : null}
      {hasForbiddenOptionChar(options) ? (
        <p role="alert" className="text-[11px] text-destructive">
          Options cannot contain commas
        </p>
      ) : null}
    </div>
  );
}
