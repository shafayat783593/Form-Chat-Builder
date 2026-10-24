"use client";

import {
  ArrowLeft,
  Check,
  Eye,
  Loader2,
  MousePointerClick,
  Redo2,
  Rocket,
  Save,
  Settings,
  Share2,
  Square,
  Undo2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FormStatus } from "../builder-state";
import { IconButton } from "./builder-ui";

const OUTLINE_BUTTON =
  "hidden h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none";

const SOLID_BUTTON =
  "inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90";

interface TopBarProps {
  title: string;
  status: FormStatus;
  hasUnsavedChanges: boolean;
  /** What the screen is waiting for right now, if anything. */
  busy: "saving" | "publishing" | null;
  /** False blocks saving, for example while an option contains a comma. */
  canSave: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onTogglePublish: () => void;
  onPreview: () => void;
  onSettings: () => void;
  onShare: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function TopBar({
  title,
  status,
  hasUnsavedChanges,
  busy,
  canSave,
  canUndo,
  canRedo,
  onBack,
  onTitleChange,
  onSave,
  onTogglePublish,
  onPreview,
  onSettings,
  onShare,
  onUndo,
  onRedo,
}: TopBarProps) {
  const isPublished = status === "PUBLISHED";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-3 sm:px-4">
      {/* Left: back button, name of the app, form title, status */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-90"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" />
        </button>
        <span className="hidden shrink-0 text-[15px] font-bold tracking-tight sm:inline">
          FormChat
        </span>
        <span className="hidden text-muted-foreground md:inline">·</span>
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={120}
          aria-label="Form name"
          className="h-8 w-40 min-w-0 border-transparent bg-transparent px-2 text-sm font-semibold shadow-none hover:border-input focus:border-input sm:w-56 lg:w-72"
          placeholder="Untitled form"
        />
        <StatusBadge isPublished={isPublished} />
      </div>

      <div className="flex-1" />

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="hidden items-center gap-0.5 sm:flex">
          <IconButton label="Undo" size="medium" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="size-4" />
          </IconButton>
          <IconButton label="Redo" size="medium" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="size-4" />
          </IconButton>
        </div>

        <IconButton label="Preview" size="medium" onClick={onPreview}>
          <Eye className="size-4" />
        </IconButton>

        <button
          type="button"
          onClick={onSettings}
          className={cn(OUTLINE_BUTTON, "lg:inline-flex")}
          aria-label="Settings"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!hasUnsavedChanges || !canSave || busy !== null}
          className={cn(OUTLINE_BUTTON, "sm:inline-flex")}
          aria-label="Save"
        >
          {busy === "saving" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>{busy === "saving" ? "Saving…" : "Save"}</span>
        </button>

        <button
          type="button"
          onClick={onShare}
          disabled={!isPublished}
          className={cn(SOLID_BUTTON, "px-3 disabled:opacity-40")}
          aria-label="Share form"
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Share</span>
          {isPublished ? <span className="size-1.5 rounded-full bg-success" /> : null}
        </button>

        <button
          type="button"
          onClick={onTogglePublish}
          disabled={busy !== null}
          className={cn(SOLID_BUTTON, "px-3.5 disabled:opacity-50")}
          aria-label={isPublished ? "Unpublish" : "Publish"}
        >
          <PublishLabel isPublished={isPublished} busy={busy === "publishing"} />
        </button>

        <SaveIndicator hasUnsavedChanges={hasUnsavedChanges} />

        {/* Avatar */}
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          S
        </span>
      </div>
    </header>
  );
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge
      variant="outline"
      className="hidden shrink-0 gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex"
    >
      {isPublished ? (
        <span className="size-2 rounded-full bg-success" />
      ) : (
        <Square className="size-2 fill-current" />
      )}
      {isPublished ? "Live" : "Draft"}
    </Badge>
  );
}

/** Icon and text of the publish button, which changes with the form's state. */
function PublishLabel({ isPublished, busy }: { isPublished: boolean; busy: boolean }) {
  if (busy) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" />
        <span className="hidden sm:inline">{isPublished ? "Unpublishing…" : "Publishing…"}</span>
      </>
    );
  }

  const Icon = isPublished ? MousePointerClick : Rocket;
  return (
    <>
      <Icon className="size-4" />
      <span className="hidden sm:inline">{isPublished ? "Unpublish" : "Publish"}</span>
    </>
  );
}

function SaveIndicator({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) {
  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:inline-flex">
      {hasUnsavedChanges ? (
        <>
          <span className="size-1.5 rounded-full bg-primary" />
          Unsaved changes
        </>
      ) : (
        <>
          <Check className="size-3.5 text-success" />
          Saved
        </>
      )}
    </span>
  );
}
