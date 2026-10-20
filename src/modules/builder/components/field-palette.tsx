"use client";

import { Plus } from "lucide-react";
import type { QuestionType } from "@/lib/field-types";
import { FIELD_TYPES } from "../field-meta";

interface FieldPaletteProps {
  onAdd: (type: QuestionType, label?: string) => void;
}

export function FieldPalette({ onAdd }: FieldPaletteProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
          <Plus className="size-3" />
          Builder cockpit
        </span>
        <h2 className="mt-3 text-sm font-bold tracking-tight">Form Fields</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Add fields, tune settings, then publish.
        </p>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-4">
        {FIELD_TYPES.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => onAdd(item.type, item.label)}
            className="group flex items-center gap-3 rounded-xl border border-input bg-card px-3 py-2.5 text-left transition-colors hover:border-foreground/20 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground text-background transition-transform group-hover:scale-105">
              <item.icon className="size-4" />
            </span>
            <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
