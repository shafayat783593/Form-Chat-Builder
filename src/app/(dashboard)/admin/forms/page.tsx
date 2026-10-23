import { Suspense } from "react";
import { FileText, MessageSquare, MousePointerClick } from "lucide-react";
import { requireAdminPage } from "@/lib/session";
import { listForms } from "@/modules/form/form.service";
import { listPublishedTemplates } from "@/modules/template/template.service";
import { CreateFormDialog } from "@/modules/form/components/create-form-dialog";
import { FormRow } from "@/modules/form/components/form-row";
import { DashboardPageHeader } from "@/modules/dashboard/ui/dashboard-page-header";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";
import { StatCards } from "@/modules/dashboard/ui/stat-cards";

export const metadata = { title: "Forms · Admin" };

export default function AdminFormsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading forms…</div>}>
      <AdminForms />
    </Suspense>
  );
}

async function AdminForms() {
  const user = await requireAdminPage();
  const [forms, templates] = await Promise.all([listForms(user.id), listPublishedTemplates()]);
  const responseCount = forms.reduce((total, form) => total + form._count.responses, 0);
  const publishedCount = forms.filter((form) => form.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Forms"
        subtitle="Create forms, publish them, and review every submission in one place."
        action={<CreateFormDialog templates={templates} formPathPrefix="/admin/forms" />}
      />

      <StatCards
        stats={[
          { label: "Forms", value: String(forms.length), hint: "Forms you own", icon: FileText, tone: "violet" },
          { label: "Published", value: String(publishedCount), hint: "Ready to collect answers", icon: MousePointerClick, tone: "green" },
          { label: "Responses", value: String(responseCount), hint: "Across all your forms", icon: MessageSquare, tone: "blue" },
        ]}
      />

      <DashboardPanel title="Your forms" subtitle="Open a form to edit it or view its responses.">
        {forms.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            No forms yet. Create one to start collecting responses.
          </p>
        ) : (
          <ul className="space-y-3">
            {forms.map((form) => (
              <FormRow
                key={form.id}
                form={{
                  id: form.id,
                  title: form.title,
                  slug: form.slug,
                  status: form.status,
                  questions: form._count.questions,
                  responses: form._count.responses,
                }}
                formPathPrefix="/admin/forms"
                allowTemplateCreation
              />
            ))}
          </ul>
        )}
      </DashboardPanel>
    </div>
  );
}
