import { requireAdminPage } from "@/lib/session";
import { getTemplateForAdmin } from "@/modules/template/template.service";
import { FormPreview } from "@/modules/builder/components/form-preview";
import type { RuntimeQuestion } from "@/modules/form-runtime/classic-form";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAdminPage();
  const template = await getTemplateForAdmin(user.id, id);

  const questions: RuntimeQuestion[] = template.questions
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
        title: template.title,
        description: template.description,
        welcomeText: template.welcomeText,
        completionText: template.completionText,
        themeColor: template.themeColor,
        submitButtonText: template.submitButtonText,
        displayMode: template.displayMode,
        showProgress: template.showProgress,
        multiPageForm: template.multiPageForm,
        questions,
      }}
      formName={template.title}
      backHref={`/admin/templates/${template.id}/edit`}
    />
  );
}