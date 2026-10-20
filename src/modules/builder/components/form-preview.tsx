"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, ArrowLeft } from "lucide-react";
import { ClassicForm, type RuntimeForm } from "@/modules/form-runtime/classic-form";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";

const DEVICES: { id: Device; label: string; icon: typeof Monitor; width: string }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "max-w-3xl" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "max-w-xl" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "max-w-sm" },
];

export interface PreviewFormData {
  title: string;
  description: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  submitButtonText: string;
  displayMode: "CLASSIC" | "FOCUS";
  showProgress: boolean;
  multiPageForm: boolean;
  questions: RuntimeForm["questions"];
}

interface FormPreviewProps {
  form: PreviewFormData;
  backHref: string;
  liveHref?: string;
  formName?: string;
  responseCount?: number;
}

export function FormPreview({
  form,
  backHref,
  liveHref,
  formName,
  responseCount = 0,
}: FormPreviewProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const active = DEVICES.find((d) => d.id === device)!;

  const runtimeForm: RuntimeForm = {
    slug: "preview",
    title: form.title,
    description: form.description,
    welcomeText: form.welcomeText,
    completionText: form.completionText,
    themeColor: form.themeColor,
    submitButtonText: form.submitButtonText,
    displayMode: form.displayMode,
    showProgress: form.showProgress,
    multiPageForm: form.multiPageForm,
    questions: form.questions,
  };

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-sm font-bold tracking-tight">Form Preview</span>
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {formName ?? form.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-0.5 rounded-lg border bg-card p-0.5 sm:flex">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    device === d.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <d.icon className="size-3.5" />
                  {d.label}
                </button>
              ))}
            </div>
            <a
              href={backHref}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to Editor
            </a>
          </div>
        </div>
      </header>

      {/* Preview banner */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span>Preview only. Responses and files are not sent or saved.</span>
          {liveHref ? (
            <a
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Open the live form ({responseCount} response{responseCount === 1 ? "" : "s"})
            </a>
          ) : null}
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto px-4 py-8">
        <div
          className={cn(
            "mx-auto rounded-xl border bg-card p-6 shadow-sm transition-all sm:p-10",
            active.width
          )}
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: form.themeColor }}
          >
            {form.title}
          </h1>
          {form.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
          ) : null}

          <div className="mt-8">
            <ClassicForm form={runtimeForm} live={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
