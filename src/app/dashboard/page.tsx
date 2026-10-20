import { requireUserPage } from "@/lib/session";
import { DashboardPageHeader } from "@/modules/dashboard/ui/dashboard-page-header";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";
import { StatCards } from "@/modules/dashboard/ui/stat-cards";
import { FormRow } from "@/modules/form/components/form-row";
import { NewFormForm } from "@/modules/form/components/new-form-form";
import { getDashboardStats, listForms } from "@/modules/form/form.service";
import {
  ClipboardList,
  FileText,
  MessageSquare,
  MousePointerClick,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUserPage();
  const [stats, forms] = await Promise.all([
    getDashboardStats(user.id),
    listForms(user.id),
  ]);

  const published = forms.filter((f) => f.status === "PUBLISHED").length;
  const totalAnswers = forms.reduce((sum, f) => sum + f._count.responses, 0);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user.name}. Build a form, publish it, and embed the widget on any site.`}
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
        title="Create a form"
        subtitle="Give your form a title. You can add questions right after."
      >
        <NewFormForm />
      </DashboardPanel>

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
          <p className="rounded-md border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            No forms yet. Create your first one above.
          </p>
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
    </div>
  );
}
