import { requireUserPage } from "@/lib/session";
import { listResponsesForOwner } from "@/modules/response/response.service";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export default async function ResponsesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const user = await requireUserPage();
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const data = await listResponsesForOwner(id, user.id, page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.form.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Responses · {data.total} total · page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}
          </p>
        </div>
        <Link
          href={`/dashboard/forms/${data.form.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ← Edit form
        </Link>
      </div>

      {data.total === 0 ? (
        <DashboardPanel title="No responses yet" subtitle="Embed your form to start collecting answers.">
          <p className="rounded-md border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            Once someone submits the form, their answers will appear here.
          </p>
        </DashboardPanel>
      ) : (
        <DashboardPanel title="Submissions" subtitle={`${data.total} response${data.total === 1 ? "" : "s"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">Submitted</th>
                  {data.questions.map((q) => (
                    <th key={q.id} className="px-3 py-2.5 font-medium max-w-[160px] truncate">
                      {q.label}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 font-medium">Source</th>
                  <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.responses.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      <Link
                        href={`/dashboard/forms/${data.form.id}/responses/${r.id}`}
                        className="hover:text-foreground"
                      >
                        {formatDate(r.createdAt)}
                      </Link>
                    </td>
                    {data.questions.map((q) => {
                      const value = r.answers[q.id];
                      const display = value ? (value.length > 60 ? value.slice(0, 60) + "…" : value) : "—";
                      return (
                        <td key={q.id} className="px-3 py-2.5 max-w-[160px]" title={value ?? undefined}>
                          <span className="block truncate">{display}</span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {r.sourceUrl ? (
                        <span className="rounded-md bg-muted px-2 py-0.5">{r.sourceUrl}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/dashboard/forms/${data.form.id}/responses/${r.id}`}
                        className="text-xs text-primary underline underline-offset-4"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total > data.pageSize ? (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {data.page} of {Math.ceil(data.total / data.pageSize)}
              </span>
              <div className="flex gap-2">
                {data.page > 1 ? (
                  <Link
                    href={`/dashboard/forms/${data.form.id}/responses?page=${data.page - 1}`}
                    className="rounded-md border px-3 py-1.5 text-xs"
                  >
                    Previous
                  </Link>
                ) : null}
                {data.page < Math.ceil(data.total / data.pageSize) ? (
                  <Link
                    href={`/dashboard/forms/${data.form.id}/responses?page=${data.page + 1}`}
                    className="rounded-md border px-3 py-1.5 text-xs"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </DashboardPanel>
      )}
    </div>
  );
}
