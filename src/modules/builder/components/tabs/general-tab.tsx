"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneralTabProps {
  settings: {
    title: string;
    description: string | null;
    welcomeText: string;
    completionText: string;
    submitButtonText: string;
    displayMode: "CLASSIC" | "FOCUS";
    showProgress: boolean;
    multiPageForm: boolean;
  };
  status: "DRAFT" | "PUBLISHED";
  onUpdate: (patch: Partial<GeneralTabProps["settings"]>) => void;
  onShare?: () => void;
  onUnpublish?: () => void;
  publishing?: boolean;
}

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      {counter ? <p className="text-[11px] text-muted-foreground">{counter}</p> : null}
    </div>
  );
}

export function GeneralTab({
  settings,
  status,
  onUpdate,
  onShare,
  onUnpublish,
  publishing,
}: GeneralTabProps) {
  const isPublished = status === "PUBLISHED";

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Submit button text */}
      <Field label="Submit Button Text">
        <Input
          value={settings.submitButtonText}
          onChange={(e) => onUpdate({ submitButtonText: e.target.value })}
          maxLength={30}
          className="h-9"
        />
      </Field>

      {/* Form status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">Form Status</span>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 rounded-full px-2 py-0.5 text-[11px]",
              isPublished ? "border-success/40 text-success" : "text-muted-foreground"
            )}
          >
            <span
              className={cn("size-1.5 rounded-full", isPublished ? "bg-success" : "bg-muted-foreground")}
            />
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        {isPublished ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onUnpublish}
              disabled={publishing}
              className="w-full border-warning/40 text-warning hover:bg-warning/10"
            >
              <Undo2 className="size-4" />
              Unpublish Form
            </Button>
            <Button type="button" onClick={onShare} className="w-full">
              <Share2 className="size-4" />
              Share Form
            </Button>
          </>
        ) : null}
      </div>

      {/* Form structure */}
      <div className="flex flex-col gap-3 border-t pt-4">
        <span className="text-xs font-semibold text-foreground">Form Structure</span>

        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Switch
            checked={settings.multiPageForm}
            onCheckedChange={(checked) => onUpdate({ multiPageForm: checked })}
          />
          Multi-page form
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Display mode</span>
          <div className="flex flex-col gap-2">
            {(
              [
                { id: "CLASSIC", label: "Classic", hint: "All questions shown together on one page" },
                { id: "FOCUS", label: "Focus", hint: "One question at a time; page breaks are ignored" },
              ] as const
            ).map((mode) => (
              <label key={mode.id} className="flex cursor-pointer items-start gap-2 text-xs">
                <input
                  type="radio"
                  name="displayMode"
                  checked={settings.displayMode === mode.id}
                  onChange={() => onUpdate({ displayMode: mode.id })}
                  className="mt-0.5 size-3.5 accent-primary"
                />
                <span>
                  <span className="font-medium">{mode.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{mode.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Switch
            checked={settings.showProgress}
            onCheckedChange={(checked) => onUpdate({ showProgress: checked })}
          />
          Show progress indicator
        </label>
      </div>

      {/* Text content */}
      <div className="flex flex-col gap-5 border-t pt-4">
        <Field label="Form title" counter={`${settings.title.length}/120`}>
          <Input
            value={settings.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            maxLength={120}
            className="h-9"
          />
        </Field>

        <Field
          label="Description"
          hint="Shown at the top of the form."
          counter={`${(settings.description ?? "").length}/500`}
        >
          <Textarea
            value={settings.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value || null })}
            maxLength={500}
            className="min-h-20 resize-none"
          />
        </Field>

        <Field
          label="Welcome message"
          hint="The first bubble a visitor sees."
          counter={`${settings.welcomeText.length}/300`}
        >
          <Textarea
            value={settings.welcomeText}
            onChange={(e) => onUpdate({ welcomeText: e.target.value })}
            maxLength={300}
            className="min-h-20 resize-none"
          />
        </Field>

        <Field
          label="Completion message"
          hint="Shown after the visitor submits the form."
          counter={`${settings.completionText.length}/300`}
        >
          <Textarea
            value={settings.completionText}
            onChange={(e) => onUpdate({ completionText: e.target.value })}
            maxLength={300}
            className="min-h-20 resize-none"
          />
        </Field>
      </div>
    </div>
  );
}
