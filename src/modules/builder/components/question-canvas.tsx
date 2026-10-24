"use client";

import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { ClientQuestion } from "../builder-state";
import { QuestionCard, type QuestionActions } from "./question-card";

interface QuestionCanvasProps {
  questions: ClientQuestion[];
  description: string | null;
  onDescriptionChange: (description: string | null) => void;
  actions: QuestionActions;
}

/** The middle panel: the form description and the list of questions. */
export function QuestionCanvas({
  questions,
  description,
  onDescriptionChange,
  actions,
}: QuestionCanvasProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <Textarea
        value={description ?? ""}
        onChange={(event) => onDescriptionChange(event.target.value || null)}
        maxLength={500}
        placeholder="Describe your form…"
        className="min-h-20 resize-none rounded-xl border-input bg-card text-sm"
        aria-label="Form description"
      />

      <div className="mt-8 flex items-end justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight">Form Fields</h2>
        <span className="text-xs text-muted-foreground">
          {questions.length} field{questions.length === 1 ? "" : "s"}
        </span>
      </div>

      {questions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.clientId}
              question={question}
              index={index}
              total={questions.length}
              actions={actions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-12 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Plus className="size-4" />
      </span>
      <p className="text-sm text-muted-foreground">Add your first field from the left.</p>
    </div>
  );
}
