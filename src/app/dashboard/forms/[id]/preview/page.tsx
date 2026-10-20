import { requireUserPage } from "@/lib/session";
import { getFormForOwner } from "@/modules/form/form.service";
import { FormPreview } from "@/modules/builder/components/form-preview";
import type { ClientQuestion } from "@/modules/builder";

export default async function FormPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUserPage();
  const form = await getFormForOwner(id, user.id);

  const questions: ClientQuestion[] = form.questions
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
        title: form.title,
        description: form.description,
        themeColor: form.themeColor,
        questions,
      }}
      formName={form.title}
      backHref={`/dashboard/forms/${form.id}/edit`}
      liveHref={form.status === "PUBLISHED" ? `/f/${form.slug}` : undefined}
    />
  );
}
