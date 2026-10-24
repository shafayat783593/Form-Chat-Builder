import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  FolderTree,
  LayoutTemplate,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/session";
import { listTemplatesForAdmin } from "@/modules/template/template.service";
import { CreateTemplateDialog } from "@/modules/template/create-template-dialog";
import { DashboardPageHeader } from "@/modules/dashboard/ui/dashboard-page-header";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";
import { StatCards } from "@/modules/dashboard/ui/stat-cards";

export const metadata = { title: "Overview · Admin" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<OverviewSkeleton />}>
        <AdminOverview />
      </Suspense>
    </div>
  );
}

async function AdminOverview() {
  const user = await requireAdminPage();
  let templates: Awaited<ReturnType<typeof listTemplatesForAdmin>> = [];
  try {
    templates = await listTemplatesForAdmin(user.id);
  } catch (error) {
    console.error("Failed to load templates:", error);
  }

  const total = templates.length;
  const published = templates.filter((t) => t.status === "PUBLISHED").length;
  const drafts = total - published;
  const totalCopies = templates.reduce((sum, t) => sum + t._count.copies, 0);
  const totalQuestions = templates.reduce((sum, t) => sum + t._count.questions, 0);

  const recent = templates.slice(0, 5);

  const categories = new Map<string, number>();
  for (const t of templates) {
    const key = t.templateCategory?.trim() || "Uncategorized";
    categories.set(key, (categories.get(key) ?? 0) + 1);
  }
  const categoryList = [...categories.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <DashboardPageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Create and publish form templates, then watch owners copy them into their own forms."
        action={<CreateTemplateDialog />}
      />

      <StatCards
        stats={[
          {
            label: "Total templates",
            value: String(total),
            hint: `${totalQuestions} question${totalQuestions === 1 ? "" : "s"} in total`,
            icon: LayoutTemplate,
            tone: "violet",
          },
          {
            label: "Published",
            value: String(published),
            hint: "Visible in the public gallery",
            icon: CheckCircle2,
            tone: "green",
          },
          {
            label: "Drafts",
            value: String(drafts),
            hint: "Not published yet",
            icon: ClipboardList,
            tone: "amber",
          },
          {
            label: "Template copies",
            value: String(totalCopies),
            hint: "Forms created from templates",
            icon: Copy,
            tone: "blue",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardPanel
            title="Recent templates"
            subtitle="Your most recently updated templates."
            action={
              <Link
                href="/admin/templates"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
              >
                View all
                <ArrowUpRight className="size-3.5" />
              </Link>
            }
          >
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/40 p-10 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </div>
                <p className="mt-3 font-semibold">No templates yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first template to offer it to owners.
                </p>
                <div className="mt-4 flex justify-center">
                  <CreateTemplateDialog />
                </div>
              </div>
            ) : (
              <ul className="divide-y">
                {recent.map((template) => (
                  <li
                    key={template.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="size-4" />
                        </span>
                        <p className="truncate text-sm font-semibold">{template.title}</p>
                      </div>
                      <p className="mt-1 pl-10 text-xs text-muted-foreground">
                        {template.templateCategory ?? "Uncategorized"} ·{" "}
                        {template._count.questions} question
                        {template._count.questions === 1 ? "" : "s"} ·{" "}
                        {template._count.copies} cop
                        {template._count.copies === 1 ? "y" : "ies"} · updated{" "}
                        {formatDate(template.updatedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pl-10 sm:pl-0">
                      <Badge
                        variant={template.status === "PUBLISHED" ? "default" : "secondary"}
                      >
                        {template.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>
                      <Link
                        href={`/admin/templates/${template.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                      >
                        Edit
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <DashboardPanel title="Quick actions" subtitle="Jump straight to work.">
            <div className="space-y-2">
              <QuickLink
                href="/admin/templates"
                icon={<LayoutTemplate className="size-4" />}
                title="Manage templates"
                description="Edit, publish or delete"
              />
              <QuickLink
                href="/admin/forms"
                icon={<FileText className="size-4" />}
                title="My forms and responses"
                description="Manage forms you own"
              />
              <QuickLink
                href="/admin/responses"
                icon={<MessageSquare className="size-4" />}
                title="Review responses"
                description="Browse submissions by form"
              />
              <QuickLink
                href="/templates"
                icon={<FolderTree className="size-4" />}
                title="Public gallery"
                description="See what owners see"
              />
              <QuickLink
                href="/"
                icon={<Sparkles className="size-4" />}
                title="Public site"
                description="Back to the homepage"
              />
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Categories"
            subtitle={`${categoryList.length} categor${categoryList.length === 1 ? "y" : "ies"} in use.`}
          >
            {categoryList.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Add a category when creating a template.
              </p>
            ) : (
              <ul className="space-y-2">
                {categoryList.map(([category, count]) => (
                  <li
                    key={category}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2"
                  >
                    <span className="truncate text-sm font-medium">{category}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/50"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{description}</span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl border bg-muted/40 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl border bg-muted/40" />
      </div>
    </>
  );
}
