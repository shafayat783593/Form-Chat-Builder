import { requireAdminPage } from "@/lib/session";
import { getTemplateForAdmin } from "@/modules/template/template.service";
import { Builder, type ServerForm } from "@/modules/builder";

export default async function TemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAdminPage();
  const template = await getTemplateForAdmin(user.id, id);

  const initialForm: ServerForm = {
    id: template.id,
    slug: template.slug,
    title: template.title,
    description: template.description,
    welcomeText: template.welcomeText,
    completionText: template.completionText,
    themeColor: template.themeColor,
    launcherLabel: template.launcherLabel,
    widgetPosition: template.widgetPosition,
    submitButtonText: template.submitButtonText,
    displayMode: template.displayMode,
    showProgress: template.showProgress,
    multiPageForm: template.multiPageForm,
    status: template.status,
    updatedAt: template.updatedAt.toISOString(),
    notifyOnResponse: template.notifyOnResponse,
    notifyEmails: Array.isArray(template.notifyEmails) ? template.notifyEmails : [],
    questions: template.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : null,
      required: q.required,
      order: q.order,
      prefillKey: q.prefillKey,
    })),
  };

  return <Builder initialForm={initialForm} isTemplate backHref="/admin/templates" />;
}