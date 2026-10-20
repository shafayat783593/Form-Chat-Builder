import { Suspense } from "react";
import { requireUserPage } from "@/lib/session";
import { DashboardPageHeader } from "@/modules/dashboard/ui/dashboard-page-header";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";
import { StatCards } from "@/modules/dashboard/ui/stat-cards";
import { FormRow } from "@/modules/form/components/form-row";
import { CreateFormDialog } from "@/modules/form/components/create-form-dialog";
import { getDashboardStats, listForms } from "@/modules/form/form.service";
import { listPublishedTemplates } from "@/modules/template/template.service";
import {
  ClipboardList,
  FileText,
  MessageSquare,
  MousePointerClick,
} from "lucide-react";

async function DashboardData() {
  const user = await requireUserPage();
  const [stats, forms, templates] = await Promise.all([
    getDashboardStats(user.id),
    listForms(user.id),
    listPublishedTemplates(),
  ]);

  const published = forms.filter((f) => f.status === "PUBLISHED").length;
  const totalAnswers = forms.reduce((sum, f) => sum + f._count.responses, 0);

  return (
    <>
      <DashboardPageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user.name}. Build a form, publish it, and embed the widget on any site.`}
        action={<CreateFormDialog templates={templates} />}
      />

      <StatCards
        stats={[
          {
            label: "Total forms",
            value: String(stats.forms),
            hint: "All forms you own",
            icon: FileText,
            tone: "violet",
          },
          {
            label: "Published",
            value: String(published),
            hint: "Live on the widget",
            icon: MousePointerClick,
            tone: "green",
          },
          {
            label: "Total responses",
            value: String(stats.responses),
            hint: "Submissions collected",
            icon: MessageSquare,
            tone: "blue",
          },
          {
            label: "Drafts",
            value: String(stats.forms - published),
            hint: "Not published yet",
            icon: ClipboardList,
            tone: "amber",
          },
        ]}
      />

      <DashboardPanel
        id="forms"
        title="Your forms"
        subtitle={
          forms.length === 0
            ? undefined
            : `${forms.length} form${forms.length === 1 ? "" : "s"} · ${totalAnswers} response${totalAnswers === 1 ? "" : "s"}`
        }
      >
        {forms.length === 0 ? (
          <div className="rounded-md border border-dashed bg-muted/40 p-8 text-center text-sm">
            No forms yet. Use the <b>Create new form</b> button above to start.
          </div>
        ) : (
          <ul className="space-y-3">
            {forms.map((f) => (
              <FormRow
                key={f.id}
                form={{
                  id: f.id,
                  title: f.title,
                  slug: f.slug,
                  status: f.status,
                  responses: f._count.responses,
                  questions: f._count.questions,
                }}
              />
            ))}
          </ul>
        )}
      </DashboardPanel>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading dashboard…</div>}>
      <DashboardData />
    </Suspense>
  );
}
