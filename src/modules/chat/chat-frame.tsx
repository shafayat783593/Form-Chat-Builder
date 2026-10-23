"use client";

import { useState } from "react";
import { Chat } from "./chat";
import type { UseFormFlowArgs } from "./use-form-flow";
import { CloseBar } from "./close-bar";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/lib/field-types";

export interface ChatFrameForm {
  slug: string;
  title: string;
  description?: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  submitButtonText: string;
  displayMode: "CLASSIC" | "FOCUS";
  showProgress: boolean;
  multiPageForm: boolean;
  questions: Array<{
    id: string;
    type: QuestionType;
    label: string;
    options: string[] | null;
    required: boolean;
    prefillKey?: string | null;
    placeholder?: string | null;
    textColor?: string | null;
    fontSize?: number | null;
    fontWeight?: string | null;
    fontStyle?: string | null;
  }>;
}

interface ChatFrameProps {
  form: ChatFrameForm;
  previewMode?: boolean;
  searchParams?: UseFormFlowArgs["searchParams"];
  sourceOrigin?: string;
  closeMode?: "host" | "local";
  hideClose?: boolean;
  className?: string;
}

export function ChatFrame({
  form,
  previewMode = false,
  searchParams,
  sourceOrigin,
  closeMode = "host",
  hideClose = false,
  className,
}: ChatFrameProps) {
  const [resetKey, setResetKey] = useState(0);
  const [isClosed, setIsClosed] = useState(false);

  function handleClear() {
    if (closeMode === "host") {
      try {
        window.parent.postMessage({ type: "fw:close" }, "*");
      } catch {
        // A cross-origin parent can throw; the close is best-effort.
      }
    }
    setIsClosed(true);
  }

if (isClosed) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-full min-h-0 flex-col items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
              ✓ Thank you! Your response has been submitted successfully.
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Thank you! Your response has been submitted successfully.
            </p>
            <button
              type="button"
              onClick={() => setIsClosed(false)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Start a new response
            </button>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3" style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-medium shadow-sm" style={{ backgroundColor: form.themeColor, color: "#ffffff" }}>
              {form.title.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm font-medium" style={{ color: "#0f172a" }}>
              {form.title}
            </span>
          </div>
          <CloseBar onClose={handleClear} />
        </header>

        <div className="min-h-0 flex-1">
          <Chat
            form={form}
            previewMode={previewMode}
            searchParams={searchParams}
            sourceOrigin={sourceOrigin}
          />
        </div>
      </div>
);
  }
