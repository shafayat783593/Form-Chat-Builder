import { requireUserPage } from "@/lib/session";
import { getFormForOwner } from "@/modules/form/form.service";
import { Builder, type ServerForm } from "@/modules/builder";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUserPage();
  const form = await getFormForOwner(id, user.id);

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
    status: form.status,
    updatedAt: form.updatedAt.toISOString(),
    notifyOnResponse: form.notifyOnResponse,
    notifyEmails: Array.isArray(form.notifyEmails) ? form.notifyEmails : [],
    questions: form.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : null,
      required: q.required,
      order: q.order,
      prefillKey: q.prefillKey,
    })),
  };

  return <Builder initialForm={initialForm} />;
}
