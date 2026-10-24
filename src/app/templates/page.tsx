import { Suspense } from "react";
import { connection } from "next/server";
import { listPublishedTemplates } from "@/modules/template/template.service";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = { title: "Templates · FormChat" };

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Templates</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Start from a published template and customize it in the builder.
        </p>
      </div>

      <Suspense fallback={
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <div className="h-6 w-3/4 rounded bg-muted animate-pulse mb-3" />
              <div className="h-4 w-1/2 rounded bg-muted animate-pulse mb-4" />
              <div className="h-8 rounded bg-muted/50 animate-pulse" />
            </div>
          ))}
        </div>
      }>
        <TemplateGrid />
      </Suspense>
    </div>
  );
}

async function TemplateGrid() {
  await connection();
  let templates: Awaited<ReturnType<typeof listPublishedTemplates>> = [];
  try {
    templates = await listPublishedTemplates();
  } catch (error) {
    console.error("Failed to load templates:", error);
  }

  if (templates.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed bg-card p-12 text-center">
        <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="font-medium text-lg">No templates yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Templates published by the admin will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t, index) => (
        <div
          key={t.id}
          className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 to-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />
          
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors truncate">
                {t.title}
              </h2>
              {t.templateCategory && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {t.templateCategory}
                </Badge>
              )}
            </div>
            <div className="flex-shrink-0 size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t._count.questions} question{t._count.questions === 1 ? "" : "s"}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2">
            <Link
              href={`/templates/${t.templateSlug}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Link>
            <Link
              href={`/signup?next=${encodeURIComponent(`/owner?template=${t.templateSlug}`)}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted hover:border-primary/20"
            >
              Use
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
