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

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => (
            <li key={t.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{t.title}</h3>
                {t.templateCategory ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {t.templateCategory}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t._count.questions} question{t._count.questions === 1 ? "" : "s"}
              </p>
              <Link
                href={`/templates/${t.templateSlug}`}
                className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
              >
                Preview →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
