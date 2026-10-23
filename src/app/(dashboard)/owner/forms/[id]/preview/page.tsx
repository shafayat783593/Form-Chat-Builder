import { requireUserPage } from "@/lib/session";
import { countResponsesForOwner, getFormForOwner } from "@/modules/form/form.service";
import { FormPreview } from "@/modules/builder/components/form-preview";
import type { RuntimeQuestion } from "@/modules/form-runtime/classic-form";

export default async function FormPreviewPage({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const user = await requireUserPage();
  const [form, responseCount] = await Promise.all([
    getFormForOwner(id, user.id),
    countResponsesForOwner(id, user.id),
  ]);

  const questions: RuntimeQuestion[] = form.questions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : null,
      required: q.required,
      placeholder: q.placeholder,
      textColor: q.textColor,
      fontSize: q.fontSize,
      fontWeight: q.fontWeight,
      fontStyle: q.fontStyle,
    }));

  return (
    <FormPreview
      form={{
        title: form.title,
        description: form.description,
        welcomeText: form.welcomeText,
        completionText: form.completionText,
        themeColor: form.themeColor,
        submitButtonText: form.submitButtonText,
        displayMode: form.displayMode,
        showProgress: form.showProgress,
        multiPageForm: form.multiPageForm,
        questions,
      }}
      formName={form.title}
      backHref={`/owner/forms/${form.id}/edit`}
      liveHref={form.status === "PUBLISHED" ? `/f/${form.slug}` : undefined}
      responseCount={responseCount}
    />
  );
}
