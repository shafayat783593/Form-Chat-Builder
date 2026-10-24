import Link from "next/link";
import { connection } from "next/server";
import { listPublishedTemplates } from "@/modules/template/template.service";

export async function TemplatesStrip() {
  await connection();
  let templates: Awaited<ReturnType<typeof listPublishedTemplates>> = [];
  try {
    templates = await listPublishedTemplates();
  } catch (error) {
    console.error("Failed to load templates:", error);
  }
  const shown = templates.slice(0, 6);

  if (shown.length === 0) return null;

  return (
    <section id="templates" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Templates to start fast</h2>
            <p className="mt-2 max-w-prose text-muted-foreground">
              Pick a published template, copy it into your account, and edit from there.
            </p>
          </div>
          <Link
            href="/templates"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Browse all templates →
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t, index) => (
            <li
              key={t.id}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 to-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {t.title}
                </h3>
                {t.templateCategory ? (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {t.templateCategory}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t._count.questions} question{t._count.questions === 1 ? "" : "s"}
              </p>
              <Link
                href={`/templates/${t.templateSlug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all hover:gap-2.5"
              >
                Preview
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
