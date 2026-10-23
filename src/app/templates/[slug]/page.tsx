import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/session";
import { getPublishedTemplateBySlug } from "@/modules/template/template.service";
import { UseTemplateButton } from "@/modules/template/use-template-button";
import { fieldMeta } from "@/modules/builder/field-meta";
import { Badge } from "@/components/ui/badge";

export default function TemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading template…</div>}>
        <TemplateContent params={params} />
      </Suspense>
    </div>
  );
}

async function TemplateContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const template = await getPublishedTemplateBySlug(slug);
  if (!template) notFound();

  const session = await getSession();

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {template.templateCategory ? (
          <Badge variant="secondary">{template.templateCategory}</Badge>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {template.questions.length} question{template.questions.length === 1 ? "" : "s"}
        </span>
      </div>

      <h1 className="mt-3 text-3xl font-bold tracking-tight">{template.title}</h1>
      {template.description ? (
        <p className="mt-2 text-muted-foreground">{template.description}</p>
      ) : null}

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_280px]">
        <section aria-label="Template questions">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Questions
          </h2>
          <ol className="mt-3 space-y-3">
            {template.questions.map((q, i) => (
              <li key={q.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{q.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fieldMeta(q.type).label}
                      {q.type === "CHOICE" && q.options ? ` · ${q.options.join(", ")}` : ""}
                      {q.required ? " · required" : " · optional"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="md:sticky md:top-8 md:self-start">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Start from this template</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              You can edit every question afterwards.
            </p>
            <div className="mt-4">
              <UseTemplateButton
                templateId={template.id}
                templateSlug={template.templateSlug ?? slug}
                signedIn={!!session}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
