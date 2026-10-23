import { Suspense } from "react";
import { connection } from "next/server";
import { listPublishedTemplates } from "@/modules/template/template.service";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = { title: "Templates · FormChat" };

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from a published template and customize it in the builder.
        </p>
      </div>

      <Suspense fallback={<div className="mt-8 text-sm text-muted-foreground">Loading templates…</div>}>
        <TemplateGrid />
      </Suspense>
    </div>
  );
}

async function TemplateGrid() {
  await connection();
  const templates = await listPublishedTemplates();

  if (templates.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed p-12 text-center">
        <p className="font-medium">No templates yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Templates published by the admin will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <div key={t.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold tracking-tight">{t.title}</h2>
            {t.templateCategory ? (
              <Badge variant="secondary">{t.templateCategory}</Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {t._count.questions} question{t._count.questions === 1 ? "" : "s"}
          </p>
          <div className="mt-auto flex items-center gap-3">
            <Link
              href={`/templates/${t.templateSlug}`}
              className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Preview
            </Link>
            <Link
              href={`/signup?next=${encodeURIComponent(`/owner?template=${t.templateSlug}`)}`}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Use template
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
