import { requireAdminPage } from "@/lib/session";
import { getTemplateForAdmin } from "@/modules/template/template.service";
import { FormPreview } from "@/modules/builder/components/form-preview";
import type { ClientQuestion } from "@/modules/builder";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAdminPage();
  const template = await getTemplateForAdmin(user.id, id);

  const questions: ClientQuestion[] = template.questions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((q, index) => ({
      clientId: q.id,
      id: q.id,
      type: q.type,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      required: q.required,
      order: index,
      prefillKey: q.prefillKey ?? undefined,
      placeholder: q.placeholder ?? null,
      textColor: q.textColor ?? null,
      fontSize: q.fontSize ?? null,
      fontWeight: q.fontWeight ?? null,
      fontStyle: q.fontStyle ?? null,
    }));

  return (
    <FormPreview
      form={{
        title: template.title,
        description: template.description,
        themeColor: template.themeColor,
        questions,
      }}
      formName={template.title}
      backHref={`/admin/templates/${template.id}/edit`}
    />
  );
}
