import { requireAdminPage } from "@/lib/session";
import { countResponsesForOwner, getFormForOwner } from "@/modules/form/form.service";
import { Builder, type ServerForm } from "@/modules/builder";

export default async function AdminFormEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdminPage();
  const [form, responseCount] = await Promise.all([
    getFormForOwner(id, user.id),
    countResponsesForOwner(id, user.id),
  ]);

  const initialForm: ServerForm = {
    id: form.id,
    slug: form.slug,
    title: form.title,
    description: form.description,
    welcomeText: form.welcomeText,
    completionText: form.completionText,
    themeColor: form.themeColor,
    launcherLabel: form.launcherLabel,
    widgetPosition: form.widgetPosition,
    submitButtonText: form.submitButtonText,
    displayMode: form.displayMode,
    showProgress: form.showProgress,
    multiPageForm: form.multiPageForm,
    status: form.status,
    updatedAt: form.updatedAt.toISOString(),
    notifyOnResponse: form.notifyOnResponse,
    notifyEmails: Array.isArray(form.notifyEmails) ? form.notifyEmails : [],
    questions: form.questions.map((question) => ({
      id: question.id,
      type: question.type,
      label: question.label,
      options: Array.isArray(question.options) ? (question.options as string[]) : null,
      required: question.required,
      order: question.order,
      prefillKey: question.prefillKey,
    })),
  };

  return (
    <Builder
      initialForm={initialForm}
      responseCount={responseCount}
      backHref="/admin/forms"
      formPathPrefix="/admin/forms"
    />
  );
}
