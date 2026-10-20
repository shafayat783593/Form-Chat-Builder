import { requireAdminPage } from "@/lib/session";
import { listTemplatesForAdmin } from "@/modules/template/template.service";
import { TemplatesTable } from "@/modules/template/templates-table";
import { CreateTemplateDialog } from "@/modules/template/create-template-dialog";

export const metadata = { title: "Templates · Admin" };

export default async function AdminTemplatesPage() {
  // Guarded here: the layout is not the security boundary.
  const user = await requireAdminPage();
  const templates = await listTemplatesForAdmin(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Form templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Templates are published here and offered to owners when they create a form.
          </p>
        </div>
        <CreateTemplateDialog />
      </div>

      <TemplatesTable templates={templates} />
    </div>
  );
}
