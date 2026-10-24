"use client";

import { Share2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BuilderSettings, FormStatus } from "../../builder-state";
import { Field } from "../builder-ui";

interface GeneralTabProps {
  settings: BuilderSettings;
  status: FormStatus;
  publishing: boolean;
  onUpdate: (patch: Partial<BuilderSettings>) => void;
  onShare: () => void;
  onUnpublish: () => void;
}

/** Title, messages, submit button text and the published / draft state. */
export function GeneralTab({
  settings,
  status,
  publishing,
  onUpdate,
  onShare,
  onUnpublish,
}: GeneralTabProps) {
  const isPublished = status === "PUBLISHED";

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Field label="Submit Button Text">
        <Input
          value={settings.submitButtonText}
          onChange={(event) => onUpdate({ submitButtonText: event.target.value })}
          maxLength={30}
          className="h-9"
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">Form Status</span>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 rounded-full px-2 py-0.5 text-[11px]",
              isPublished ? "border-success/40 text-success" : "text-muted-foreground",
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

      <div className="flex flex-col gap-3 border-t pt-4">
        <span className="text-xs font-semibold text-foreground">Form Structure</span>

        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Switch
            checked={settings.multiPageForm}
            onCheckedChange={(multiPageForm) => onUpdate({ multiPageForm })}
          />
          Multi-page form <span className="text-muted-foreground">(not used in chat)</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Switch
            checked={settings.showProgress}
            onCheckedChange={(showProgress) => onUpdate({ showProgress })}
          />
          Show progress indicator
        </label>
      </div>

      <div className="flex flex-col gap-5 border-t pt-4">
        <Field label="Form title" counter={`${settings.title.length}/120`}>
          <Input
            value={settings.title}
            onChange={(event) => onUpdate({ title: event.target.value })}
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
            onChange={(event) => onUpdate({ description: event.target.value || null })}
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
            onChange={(event) => onUpdate({ welcomeText: event.target.value })}
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
            onChange={(event) => onUpdate({ completionText: event.target.value })}
            maxLength={300}
            className="min-h-20 resize-none"
          />
        </Field>
      </div>
    </div>
  );
}
