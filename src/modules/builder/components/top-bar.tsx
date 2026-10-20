"use client";

import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  Settings,
  Save,
  Rocket,
  Check,
  X,
  Square,
  MousePointerClick,
  Share2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  title: string;
  status: "DRAFT" | "PUBLISHED";
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  onBack: () => void;
  onTitleChange: (value: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
  onSettings: () => void;
  onShare: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function TopBar({
  title,
  status,
  dirty,
  saving,
  publishing,
  onBack,
  onTitleChange,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  onSettings,
  onShare,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: TopBarProps) {
  const isPublished = status === "PUBLISHED";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-3 sm:px-4">
      {/* Brand + form name */}
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
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={120}
          aria-label="Form name"
          className="h-8 w-40 min-w-0 border-transparent bg-transparent px-2 text-sm font-semibold shadow-none hover:border-input focus:border-input sm:w-56 lg:w-72"
          placeholder="Untitled form"
        />
        <Badge
          variant="outline"
          className="hidden shrink-0 gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex"
        >
          {isPublished ? (
            <>
              <span className="size-2 rounded-full bg-success" />
              Live
            </>
          ) : (
            <>
              <Square className="size-2 fill-current" />
              Draft
            </>
          )}
        </Badge>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="hidden items-center gap-0.5 sm:flex">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Undo"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Redo"
          >
            <Redo2 className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Preview"
        >
          <Eye className="size-4" />
        </button>

        <button
          type="button"
          onClick={onSettings}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted lg:inline-flex"
          aria-label="Settings"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving || publishing}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none sm:inline-flex"
          aria-label="Save"
        >
          {saving ? (
            <>
              <Save className="size-4 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Save</span>
            </>
          )}
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={onShare}
          disabled={!isPublished}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Share form"
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Share</span>
          {isPublished ? <span className="size-1.5 rounded-full bg-success" /> : null}
        </button>

        <button
          type="button"
          onClick={isPublished ? onUnpublish : onPublish}
          disabled={saving || publishing}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label={isPublished ? "Unpublish" : "Publish"}
        >
          {publishing ? (
            <>
              <X className="size-4 animate-spin" />
              <span className="hidden sm:inline">{isPublished ? "Unpublishing…" : "Publishing…"}</span>
            </>
          ) : isPublished ? (
            <>
              <MousePointerClick className="size-4" />
              <span className="hidden sm:inline">Unpublish</span>
            </>
          ) : (
            <>
              <Rocket className="size-4" />
              <span className="hidden sm:inline">Publish</span>
            </>
          )}
        </button>

        {/* Unsaved indicator */}
        {dirty ? (
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:inline-flex">
            <span className="size-1.5 rounded-full bg-primary" />
            Unsaved changes
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:inline-flex">
            <Check className="size-3.5 text-success" />
            Saved
          </span>
        )}

        {/* Avatar */}
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          S
        </span>
      </div>
    </header>
  );
}
