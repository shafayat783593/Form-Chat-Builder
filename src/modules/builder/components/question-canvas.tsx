"use client";

import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { ClientQuestion } from "../use-builder-state";
import { QuestionCard } from "./question-card";

interface QuestionCanvasProps {
  questions: ClientQuestion[];
  description: string | null;
  onDescriptionChange: (value: string | null) => void;
  onUpdate: (clientId: string, patch: Partial<ClientQuestion>) => void;
  onRemove: (clientId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDuplicate: (clientId: string) => void;
}

export function QuestionCanvas({
  questions,
  description,
  onDescriptionChange,
  onUpdate,
  onRemove,
  onMove,
  onDuplicate,
}: QuestionCanvasProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Form description */}
      <Textarea
        value={description ?? ""}
        onChange={(e) => onDescriptionChange(e.target.value || null)}
        maxLength={500}
        placeholder="Describe your form…"
        className="min-h-20 resize-none rounded-xl border-input bg-card text-sm"
        aria-label="Form description"
      />

      {/* Fields header */}
      <div className="mt-8 flex items-end justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight">Form Fields</h2>
        <span className="text-xs text-muted-foreground">
          {questions.length} field{questions.length === 1 ? "" : "s"}
        </span>
      </div>

      {questions.length === 0 ? (
        <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-12 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <Plus className="size-4" />
          </span>
          <p className="text-sm text-muted-foreground">Add your first field from the left.</p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {questions.map((q, index) => (
            <QuestionCard
              key={q.clientId}
              question={q}
              index={index}
              total={questions.length}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMove={onMove}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
