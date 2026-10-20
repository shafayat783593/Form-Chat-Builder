import { requireAdminPage } from "@/lib/session";
import { listTemplatesForAdmin } from "@/modules/template/template.service";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Templates · Admin" };

export default async function AdminTemplatesPage() {
  // Guarded again here: the layout is not the security boundary.
  const user = await requireAdminPage();
  const templates = await listTemplatesForAdmin(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Form templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Templates are published here and offered to owners when they create a form.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">No templates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Templates you create will be listed here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Questions</th>
                <th className="px-4 py-3 font-medium">Copies</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{template.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {template.templateCategory ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {template.templateSlug ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={template.status === "PUBLISHED" ? "default" : "secondary"}>
                      {template.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {template._count.questions}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{template._count.copies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
