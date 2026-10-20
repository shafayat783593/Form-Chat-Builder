"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTemplateAction } from "@/modules/template/template.actions";

type TemplateRow = {
  id: string;
  title: string;
  templateSlug: string | null;
  templateCategory: string | null;
  status: string;
  _count: { questions: number; copies: number };
};

interface TemplatesTableProps {
  templates: TemplateRow[];
  onChange?: () => void;
}

export function TemplatesTable({ templates, onChange }: TemplatesTableProps) {
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  async function handleDelete(templateId: string) {
    setOpenDelete(null);
    setPendingDelete(true);
    try {
      await deleteTemplateAction(templateId);
      onChange?.();
      router.refresh();
    } finally {
      setPendingDelete(false);
    }
  }

  return (
    <div className="space-y-6">
      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">No templates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first template to offer it to owners.
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
                <th className="px-4 py-3 font-medium text-right">Actions</th>
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/templates/${template.id}/edit`}
                        className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        Edit
                      </Link>
                      {template.templateSlug && (
                        <Link
                          href={`/templates/${template.templateSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-slate-600"
                        >
                          Preview
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => setOpenDelete(template.id)}
                        disabled={pendingDelete}
                        className="text-xs text-destructive underline underline-offset-4 hover:text-destructive/80 disabled:opacity-50"
                      >
                        Delete
                      </button>
                      {openDelete === template.id && (
                        <div className="flex flex-col items-start gap-2">
                          <p className="text-xs text-muted-foreground">
                            Delete this template? Copies keep working.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                              disabled={pendingDelete}
                            >
                              {pendingDelete ? "Deleting…" : "Delete"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setOpenDelete(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
