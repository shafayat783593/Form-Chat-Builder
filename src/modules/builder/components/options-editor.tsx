"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OptionEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
  error: string | null;
}

export function OptionsEditor({ options, onChange, error }: OptionEditorProps) {
  function setOption(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    onChange(next);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return; // keep the minimum of 2
    onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="size-4 shrink-0 rounded-full border border-input" />
          <Input
            value={option}
            onChange={(e) => setOption(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            maxLength={100}
            className="h-8"
          />
          <button
            type="button"
            onClick={() => removeOption(index)}
            disabled={options.length <= 2}
            className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-30 disabled:pointer-events-none"
            aria-label={`Remove option ${index + 1}`}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...options, ""])}
        disabled={options.length >= 10}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-input px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Plus className="size-3.5" /> Add option
      </button>
      {options.length >= 10 ? (
        <p className="text-[11px] text-muted-foreground">Maximum 10 options.</p>
      ) : null}
      {error ? <p role="alert" className="text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}
