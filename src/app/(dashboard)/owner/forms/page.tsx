import { Suspense } from "react";
import { requireUserPage } from "@/lib/session";
import { listForms } from "@/modules/form/form.service";
import { listPublishedTemplates } from "@/modules/template/template.service";
import { CreateFormDialog } from "@/modules/form/components/create-form-dialog";
import { FormRow } from "@/modules/form/components/form-row";
import { DashboardPageHeader } from "@/modules/dashboard/ui/dashboard-page-header";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";

export default function OwnerFormsPage() {
  return <Suspense fallback={<div className="text-sm text-muted-foreground">Loading forms…</div>}><Forms /></Suspense>;
}

async function Forms() {
  const user = await requireUserPage();
  const [forms, templates] = await Promise.all([listForms(user.id), listPublishedTemplates()]);
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Forms" subtitle="Create a form from scratch or start with an admin template." action={<CreateFormDialog templates={templates} />} />
      <DashboardPanel title="Your forms" subtitle={`${forms.length} form${forms.length === 1 ? "" : "s"} you can edit and publish.`}>
        {forms.length === 0 ? <p className="rounded-xl border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">No forms yet. Create one or use a template.</p> : <ul className="space-y-3">{forms.map((form) => <FormRow key={form.id} form={{ id: form.id, title: form.title, slug: form.slug, status: form.status, questions: form._count.questions, responses: form._count.responses }} />)}</ul>}
      </DashboardPanel>
    </div>
  );
}
