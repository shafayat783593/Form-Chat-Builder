"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveFormAction } from "@/modules/form/form.actions";
import { setFormStatusAction } from "@/modules/form/form.actions";
import { setTemplateStatusAction } from "@/modules/template/template.actions";
import {
  useBuilderState,
  type ServerForm,
  type BuilderSettings,
  type ClientQuestion,
  type QuestionType,
} from "./use-builder-state";
import { BuilderShell } from "./components/builder-shell";
import { TopBar } from "./components/top-bar";
import { FieldPalette } from "./components/field-palette";
import { QuestionCanvas } from "./components/question-canvas";
import { SettingsPanel } from "./components/settings-panel";
import { ShareDialog } from "./components/share-dialog";
import { LiveBanner } from "./components/live-banner";

interface BuilderProps {
  initialForm: ServerForm;
  isTemplate?: boolean;
  /** Where the "back" button navigates to. Defaults to /dashboard. */
  backHref?: string;
  /** Number of responses received so far (shown in the "form is live" banner). */
  responseCount?: number;
}

export function Builder({
  initialForm,
  isTemplate = false,
  backHref = "/dashboard",
  responseCount = 0,
}: BuilderProps) {
  const router = useRouter();
  const {
    state,
    dispatch,
    dirty,
    resetDirty,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBuilderState(initialForm);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [statusOverride, setStatusOverride] = useState<"DRAFT" | "PUBLISHED" | null>(null);
  const expectedUpdatedAtRef = useRef(initialForm.updatedAt);

  const questions = state.questions;
  const settings = state.settings as BuilderSettings;
  const status = statusOverride ?? state.status;
  const isDirty = dirty();

  // Where the "Preview" button goes and the public share links.
  const previewHref = isTemplate
    ? `/admin/templates/${initialForm.id}/preview`
    : `/dashboard/forms/${initialForm.id}/preview`;
  const appUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? "";
  const formUrl = `${appUrl}/f/${initialForm.slug}`;
  const embedCode = `<script src="${appUrl}/widget.js" data-form="${initialForm.slug}"></script>`;

  const payloadQuestions = useCallback(() =>
    questions.map((q: ClientQuestion) => ({
      clientId: q.clientId,
      id: q.id,
      type: q.type,
      label: q.label,
      options: q.options.length > 0 ? q.options : undefined,
      required: q.required,
      prefillKey: q.prefillKey ?? undefined,
      placeholder: q.placeholder ?? undefined,
      textColor: q.textColor ?? undefined,
      fontSize: q.fontSize ?? undefined,
      fontWeight: q.fontWeight ?? undefined,
      fontStyle: q.fontStyle ?? undefined,
    })),
  [questions]
  );

  const remapIds = useCallback(
    (idMap: Array<{ clientId?: string; id: string }>) => {
      idMap.forEach((m) => {
        if (m.clientId) dispatch({ type: "UPDATE_QUESTION", clientId: m.clientId, patch: { id: m.id } });
      });
    },
    [dispatch]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await saveFormAction(
        {
          formId: initialForm.id,
          expectedUpdatedAt: expectedUpdatedAtRef.current,
          settings: {
            title: settings.title,
            description: settings.description,
            welcomeText: settings.welcomeText,
            completionText: settings.completionText,
            themeColor: settings.themeColor,
            launcherLabel: settings.launcherLabel,
            widgetPosition: settings.widgetPosition,
            submitButtonText: settings.submitButtonText,
            displayMode: settings.displayMode,
            showProgress: settings.showProgress,
            multiPageForm: settings.multiPageForm,
            notifyOnResponse: settings.notifyOnResponse,
            notifyEmails: settings.notifyEmails,
          },
          questions: payloadQuestions(),
        },
        isTemplate,
      );
      if (res.ok) {
        remapIds(res.data.questions);
        resetDirty();
        expectedUpdatedAtRef.current = res.data.form.updatedAt;
        toast.success("Saved");
      } else {
        toast.error(res.error ?? "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }, [initialForm.id, expectedUpdatedAtRef, settings, payloadQuestions, remapIds, resetDirty, isTemplate]);

  const handlePublish = useCallback(
    async (publish: boolean) => {
      setPublishing(true);
      try {
        if (isDirty) {
          const res = await saveFormAction(
            {
              formId: initialForm.id,
              expectedUpdatedAt: expectedUpdatedAtRef.current,
              settings: {
                title: settings.title,
                description: settings.description,
                welcomeText: settings.welcomeText,
                completionText: settings.completionText,
                themeColor: settings.themeColor,
                launcherLabel: settings.launcherLabel,
                widgetPosition: settings.widgetPosition,
                submitButtonText: settings.submitButtonText,
                displayMode: settings.displayMode,
                showProgress: settings.showProgress,
                multiPageForm: settings.multiPageForm,
                notifyOnResponse: settings.notifyOnResponse,
                notifyEmails: settings.notifyEmails,
              },
              questions: payloadQuestions(),
            },
            isTemplate,
          );
          if (!res.ok) {
            toast.error(res.error ?? "Save before publish failed");
            return;
          }
          remapIds(res.data.questions);
          expectedUpdatedAtRef.current = res.data.form.updatedAt;
          resetDirty();
        }
        // Templates use the admin-guarded action; regular forms the owner action.
        if (isTemplate) {
          await setTemplateStatusAction(initialForm.id, publish ? "PUBLISHED" : "DRAFT");
        } else {
          await setFormStatusAction(initialForm.id, publish ? "PUBLISHED" : "DRAFT");
        }
        setStatusOverride(publish ? "PUBLISHED" : "DRAFT");
        toast.success(publish ? "Published" : "Unpublished");
        if (publish) setShareOpen(true);
      } finally {
        setPublishing(false);
      }
    },
    [initialForm.id, expectedUpdatedAtRef, isDirty, settings, payloadQuestions, remapIds, resetDirty, isTemplate]
  );

  return (
    <BuilderShell>
      <TopBar
        title={settings.title}
        status={status}
        dirty={isDirty}
        saving={saving}
        publishing={publishing}
        onBack={() => router.push(backHref)}
        onTitleChange={(value: string) => dispatch({ type: "UPDATE_SETTINGS", patch: { title: value } })}
        onSave={handleSave}
        onPublish={() => handlePublish(true)}
        onUnpublish={() => handlePublish(false)}
        onPreview={() => router.push(previewHref)}
        onSettings={() => {}}
        onShare={() => setShareOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {status === "PUBLISHED" ? (
        <LiveBanner
          formUrl={formUrl}
          responseCount={responseCount}
          onShare={() => setShareOpen(true)}
          responsesHref={isTemplate ? undefined : `/dashboard/forms/${initialForm.id}/responses`}
        />
      ) : null}

      <div className="flex flex-1 min-w-0 overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-background lg:block">
          <FieldPalette
            onAdd={(type: QuestionType, label?: string) =>
              dispatch({ type: "ADD_QUESTION", question: { type, label: label ?? "" } })
            }
          />
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto bg-muted/20">
          <QuestionCanvas
            questions={questions}
            description={settings.description}
            onDescriptionChange={(value) =>
              dispatch({ type: "UPDATE_SETTINGS", patch: { description: value } })
            }
            onUpdate={(clientId: string, patch: Partial<ClientQuestion>) =>
              dispatch({ type: "UPDATE_QUESTION", clientId, patch })
            }
            onRemove={(clientId: string) => dispatch({ type: "REMOVE_QUESTION", clientId })}
            onMove={(fromIndex: number, toIndex: number) =>
              dispatch({ type: "MOVE_QUESTION", fromIndex, toIndex })
            }
            onDuplicate={(clientId: string) => dispatch({ type: "DUPLICATE_QUESTION", clientId })}
          />
        </div>

        <aside className="hidden w-80 shrink-0 border-l border-border bg-background lg:block">
          <SettingsPanel
            settings={settings}
            questions={questions}
            slug={initialForm.slug}
            status={status}
            publishing={publishing}
            onUpdate={(patch: Partial<BuilderSettings>) =>
              dispatch({ type: "UPDATE_SETTINGS", patch })
            }
            onUpdateQuestion={(clientId: string, patch: { prefillKey?: string | null }) =>
              dispatch({ type: "UPDATE_QUESTION", clientId, patch })
            }
            onShare={() => setShareOpen(true)}
            onUnpublish={() => handlePublish(false)}
          />
        </aside>
      </div>

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
