"use client";

import { useState } from "react";
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import { ChatFrame, type ChatFrameForm } from "@/modules/chat/chat-frame";
import { cn } from "@/lib/utils";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "max-w-3xl" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "max-w-xl" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "max-w-sm" },
] as const;

export type PreviewFormData = Omit<ChatFrameForm, "slug">;

interface FormPreviewProps {
  form: PreviewFormData;
  /** Link of the "Back to Editor" button. */
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
  const [deviceId, setDeviceId] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const device = DEVICES.find((item) => item.id === deviceId) ?? DEVICES[0];

  return (
    <div className="min-h-svh bg-muted/30">
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
              {DEVICES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDeviceId(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    deviceId === item.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
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

      <div className="mx-auto px-4 py-8">
        <div
          className={cn(
            "mx-auto rounded-xl border bg-card p-6 shadow-sm transition-all sm:p-10",
            device.width,
          )}
        >
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: form.themeColor }}>
            {form.title}
          </h1>
          {form.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
          ) : null}

          <div className="mt-8">
            <div className="h-[640px] overflow-hidden rounded-xl border border-slate-200 bg-white">
              <ChatFrame form={{ ...form, slug: "preview" }} previewMode hideClose />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
