"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ClientQuestion } from "../use-builder-state";
import { fieldMeta } from "../field-meta";

interface PreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  questions: ClientQuestion[];
}

export function PreviewSheet({
  open,
  onOpenChange,
  title,
  welcomeText,
  completionText,
  themeColor,
  questions,
}: PreviewSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <div className="inline hidden sm:flex" aria-label="Preview">
          <span className="sr-only">Preview</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            Chat preview uses unsaved local state; nothing is written to the DB.
          </DialogDescription>
        </DialogHeader>
        <div className="border-t">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
            <div
              className="size-8 rounded-full flex items-center justify-center text-[11px] font-medium shadow-lg"
              style={{ backgroundColor: themeColor, color: "#ffffff" }}
            >
              {title}
            </div>
            <div className="flex-1 text-sm text-muted-foreground">{welcomeText}</div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted aria-label:Close preview"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="p-3 max-h-[60vh] overflow-y-auto space-y-3">
            {questions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center">No questions yet.</p>
            ) : (
              questions.map((q, i) => (
                <div key={q.clientId} className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{q.label}</span>
                    {q.required && (
                      <span className="text-[10px] rounded-full bg-primary/10 px-1.5 py-0.5 text-primary text-[10px]">
                        required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fieldMeta(q.type).label}
                    {q.type === "CHOICE" && q.options.length > 0
                      ? ` · ${q.options.join(", ")}`
                      : ""}
                  </p>
                </div>
              ))
            )}
            <div className="pt-3 text-xs text-muted-foreground text-center">{completionText}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
