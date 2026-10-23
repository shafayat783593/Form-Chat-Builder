import { Suspense } from "react";
import { requireUserPage } from "@/lib/session";
import { listPublishedTemplates } from "@/modules/template/template.service";
import { UseTemplateButton } from "@/modules/template/use-template-button";
import { DashboardPageHeader } from "@/modules/dashboard/ui/dashboard-page-header";

export default function OwnerTemplatesPage() {
  return <Suspense fallback={<div className="text-sm text-muted-foreground">Loading templates...</div>}><Templates /></Suspense>;
}

async function Templates() {
  await requireUserPage();
  const templates = await listPublishedTemplates();

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Templates" subtitle="Copy an admin-created template, then edit your private form in the builder." />
      {templates.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-muted/40 p-10 text-center text-sm text-muted-foreground">No published templates are available yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Template</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Questions</th><th className="px-4 py-3 text-right font-medium">Action</th></tr></thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{template.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{template.templateCategory ?? "General"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{template._count.questions}</td>
                  <td className="px-4 py-3 text-right"><div className="inline-flex"><UseTemplateButton templateId={template.id} templateSlug={template.templateSlug ?? template.id} signedIn /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
