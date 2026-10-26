"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveFormAction, setFormStatusAction } from "@/modules/form/form.actions";
import { setTemplateStatusAction } from "@/modules/template/template.actions";
import { hasForbiddenOptionChar, type QuestionType } from "@/lib/field-types";
import { toSaveQuestion, type FormStatus, type ServerForm } from "./builder-state";
import { useBuilderState } from "./use-builder-state";
import { useAppOrigin } from "./use-app-origin";
import { BuilderShell } from "./components/builder-shell";
import { TopBar } from "./components/top-bar";
import { FieldPalette } from "./components/field-palette";
import { QuestionCanvas } from "./components/question-canvas";
import { SettingsPanel } from "./components/settings-panel";
import { ShareDialog } from "./components/share-dialog";
import { LiveBanner } from "./components/live-banner";

const SETTINGS_PANEL_ID = "form-settings";
const COMMA_ERROR = "Options cannot contain commas";

interface BuilderProps {
  initialForm: ServerForm;
  /** True when an admin is editing a template instead of a normal form. */
  isTemplate?: boolean;
  /** Where the back button goes. */
  backHref?: string;
  /** Shown in the "your form is live" banner. */
  responseCount?: number;
  /** Start of the form pages, e.g. "/owner/forms". Used for the preview and responses links. */
  formPathPrefix?: string;
}

export function Builder({
  initialForm,
  isTemplate = false,
  backHref = "/owner",
  responseCount = 0,
  formPathPrefix = "/owner/forms",
}: BuilderProps) {
  const router = useRouter();
  const origin = useAppOrigin();
  const { settings, questions, hasUnsavedChanges, canUndo, canRedo, actions } = useBuilderState(initialForm);

  const [status, setStatus] = useState<FormStatus>(initialForm.status);
  const [busy, setBusy] = useState<"saving" | "publishing" | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"fields" | "settings" | null>(null);

  function handleAddQuestion(type: QuestionType) {
    actions.addQuestion(type);
    toast.success("Field added");
  }

  // Sent with every save so the server can refuse to overwrite newer changes.
  const lastUpdatedAt = useRef(initialForm.updatedAt);

  const hasInvalidOptions = questions.some((q) => hasForbiddenOptionChar(q.options));

  const formBasePath = `${formPathPrefix}/${initialForm.id}`;
  const previewHref = isTemplate
    ? `/admin/templates/${initialForm.id}/preview`
    : `${formBasePath}/preview`;
  const formUrl = `${origin}/f/${initialForm.slug}`;
  const embedCode = `<script src="${origin}/widget.js" data-form="${initialForm.slug}"></script>`;

  /** Sends the current content to the server. Returns true when it was saved. */
  async function saveChanges(): Promise<boolean> {
    const result = await saveFormAction(
      {
        formId: initialForm.id,
        expectedUpdatedAt: lastUpdatedAt.current,
        settings,
        questions: questions.map(toSaveQuestion),
      },
      isTemplate,
    );

    if (!result.ok) {
      toast.error(result.error);
      return false;
    }

    actions.markSaved(result.data.questions);
    lastUpdatedAt.current = result.data.form.updatedAt;
    return true;
  }

  async function handleSave() {
    if (hasInvalidOptions) {
      toast.error(COMMA_ERROR);
      return;
    }

    setBusy("saving");
    try {
      if (await saveChanges()) toast.success("Saved");
    } finally {
      setBusy(null);
    }
  }

  async function handleTogglePublish() {
    if (hasInvalidOptions) {
      toast.error(COMMA_ERROR);
      return;
    }

    const publish = status !== "PUBLISHED";
    const newStatus: FormStatus = publish ? "PUBLISHED" : "DRAFT";

    setBusy("publishing");
    try {
      // Publish what is on screen, not an older saved version.
      if (hasUnsavedChanges && !(await saveChanges())) return;

      const result = isTemplate
        ? await setTemplateStatusAction(initialForm.id, newStatus)
        : await setFormStatusAction(initialForm.id, newStatus);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setStatus(newStatus);
      toast.success(publish ? "Published" : "Unpublished");
      if (publish) setShareOpen(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <BuilderShell>
      <TopBar
        title={settings.title}
        status={status}
        hasUnsavedChanges={hasUnsavedChanges}
        busy={busy}
        canSave={!hasInvalidOptions}
        canUndo={canUndo}
        canRedo={canRedo}
        onBack={() => router.push(backHref)}
        onTitleChange={(title) => actions.updateSettings({ title })}
        onSave={handleSave}
        onTogglePublish={handleTogglePublish}
        onPreview={() => router.push(previewHref)}
        onSettings={() => setMobilePanel("settings")}
        onShare={() => setShareOpen(true)}
        onUndo={actions.undo}
        onRedo={actions.redo}
      />

      {status === "PUBLISHED" ? (
        <LiveBanner
          formUrl={formUrl}
          responseCount={responseCount}
          onShare={() => setShareOpen(true)}
          responsesHref={isTemplate ? undefined : `${formBasePath}/responses`}
        />
      ) : null}

      <div className="flex shrink-0 items-center justify-center gap-3 border-b bg-background px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePanel("fields")}
          className="rounded-full border bg-card px-4 py-2 text-xs font-semibold shadow-soft"
        >
          Fields
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel("settings")}
          className="rounded-full border bg-card px-4 py-2 text-xs font-semibold shadow-soft"
        >
          Settings
        </button>
      </div>

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-background lg:block">
          <FieldPalette onAdd={handleAddQuestion} />
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto bg-muted/20">
          <QuestionCanvas
            questions={questions}
            description={settings.description}
            onDescriptionChange={(description) => actions.updateSettings({ description })}
            actions={actions}
          />
        </div>

        <aside
          id={SETTINGS_PANEL_ID}
          tabIndex={-1}
          className="hidden w-80 shrink-0 border-l border-border bg-background outline-none lg:block"
        >
          <SettingsPanel
            settings={settings}
            questions={questions}
            slug={initialForm.slug}
            status={status}
            publishing={busy === "publishing"}
            onUpdateSettings={actions.updateSettings}
            onUpdateQuestion={actions.updateQuestion}
            onShare={() => setShareOpen(true)}
            onUnpublish={handleTogglePublish}
          />
        </aside>
      </div>

      {mobilePanel ? (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobilePanel(null)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85svh] overflow-y-auto rounded-t-2xl border-t bg-background p-2 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-sm font-semibold">
                {mobilePanel === "fields" ? "Form Fields" : "Form Settings"}
              </span>
              <button
                type="button"
                onClick={() => setMobilePanel(null)}
                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
            {mobilePanel === "fields" ? (
              <FieldPalette onAdd={handleAddQuestion} />
            ) : (
              <SettingsPanel
                settings={settings}
                questions={questions}
                slug={initialForm.slug}
                status={status}
                publishing={busy === "publishing"}
                onUpdateSettings={actions.updateSettings}
                onUpdateQuestion={actions.updateQuestion}
                onShare={() => setShareOpen(true)}
                onUnpublish={handleTogglePublish}
              />
            )}
          </div>
        </div>
      ) : null}

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        formUrl={formUrl}
        formTitle={settings.title}
        embedCode={embedCode}
      />
    </BuilderShell>
  );
}
