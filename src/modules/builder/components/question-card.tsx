"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Settings2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fieldStyleCss, hasOptions } from "@/lib/field-types";
import { cn } from "@/lib/utils";
import type { BuilderActions, ClientQuestion } from "../builder-state";
import { fieldMeta } from "../field-meta";
import { IconButton } from "./builder-ui";
import { FieldPreview } from "./field-preview";
import { FieldSettings } from "./field-settings";
import { OptionsEditor } from "./options-editor";

/** The part of the builder a question card is allowed to use. */
export type QuestionActions = Pick<
  BuilderActions,
  "updateQuestion" | "removeQuestion" | "moveQuestion" | "duplicateQuestion"
>;

interface QuestionCardProps {
  question: ClientQuestion;
  index: number;
  /** How many questions the form has. Used to disable "move down" on the last one. */
  total: number;
  actions: QuestionActions;
}

/** One question in the middle panel: its label, buttons, and a preview of the input. */
export function QuestionCard({ question, index, total, actions }: QuestionCardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { clientId } = question;
  const Icon = fieldMeta(question.type).icon;
  const update = (patch: Partial<ClientQuestion>) => actions.updateQuestion(clientId, patch);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-colors",
        settingsOpen ? "border-foreground/25" : "border-input hover:border-foreground/15",
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Question label</span>
              <Input
                value={question.label}
                onChange={(event) => update({ label: event.target.value })}
                placeholder="Question label"
                maxLength={200}
                className="h-7 border-transparent bg-transparent px-1.5 text-sm font-semibold shadow-none hover:border-input focus:border-input"
                style={fieldStyleCss(question)}
              />
            </label>

            <div className="flex shrink-0 items-center gap-0.5">
              <IconButton
                label="Field settings"
                aria-expanded={settingsOpen}
                className={cn(settingsOpen && "bg-muted text-foreground")}
                onClick={() => setSettingsOpen((open) => !open)}
              >
                <Settings2 className="size-3.5" />
              </IconButton>
              <IconButton
                label="Move up"
                disabled={index === 0}
                onClick={() => actions.moveQuestion(index, index - 1)}
              >
                <ArrowUp className="size-3.5" />
              </IconButton>
              <IconButton
                label="Move down"
                disabled={index === total - 1}
                onClick={() => actions.moveQuestion(index, index + 1)}
              >
                <ArrowDown className="size-3.5" />
              </IconButton>
              <IconButton label="Duplicate question" onClick={() => actions.duplicateQuestion(clientId)}>
                <Copy className="size-3.5" />
              </IconButton>
              <IconButton
                label="Delete question"
                tone="danger"
                onClick={() => actions.removeQuestion(clientId)}
              >
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 pl-1.5">
            {question.required ? (
              <span className="text-xs font-semibold text-destructive">*</span>
            ) : null}
            <span className="text-[11px] text-muted-foreground">Required</span>
            <Switch
              checked={question.required}
              onCheckedChange={(required) => update({ required })}
              className="scale-75 origin-left"
              aria-label="Required"
            />
          </div>

          <div className="mt-2.5">
            {hasOptions(question.type) ? (
              <OptionsEditor options={question.options} onChange={(options) => update({ options })} />
            ) : (
              <FieldPreview question={question} />
            )}
          </div>
        </div>
      </div>

      {settingsOpen ? (
        <FieldSettings
          question={question}
          onChange={update}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}
