import Link from "next/link";
import { CalendarDays, MessageSquare, TrendingUp } from "lucide-react";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";
import { StatCards } from "@/modules/dashboard/ui/stat-cards";
import { listResponsesForOwner } from "../response.service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

interface ResponsesPageProps {
  formId: string;
  ownerId: string;
  page: number;
  formPathPrefix: string;
}

export async function ResponsesPage({ formId, ownerId, page, formPathPrefix }: ResponsesPageProps) {
  const data = await listResponsesForOwner(formId, ownerId, page);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.form.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Responses · {data.total} total · page {data.page} of {totalPages}
          </p>
        </div>
        <Link
          href={`${formPathPrefix}/${data.form.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ← Edit form
        </Link>
      </div>

      <StatCards
        stats={[
          { label: "Respondent responses", value: String(data.total), hint: "All submitted responses", icon: MessageSquare, tone: "violet" },
          { label: "Last 7 days", value: String(data.last7DaysTotal), hint: "Recent submissions", icon: TrendingUp, tone: "green" },
          { label: "Last 30 days", value: String(data.last30DaysTotal), hint: "Responses this month", icon: CalendarDays, tone: "blue" },
        ]}
      />

      {data.total === 0 ? (
        <DashboardPanel title="No responses yet" subtitle="Embed your form to start collecting answers.">
          <p className="rounded-md border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            Once someone submits the form, their answers will appear here.
          </p>
        </DashboardPanel>
      ) : (
        <DashboardPanel title="Form responses" subtitle={`Showing ${data.responses.length} of ${data.total} responses.`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">Submitted</th>
                  {data.questions.map((question) => <th key={question.id} className="max-w-[160px] px-3 py-2.5 font-medium truncate">{question.label}</th>)}
                  <th className="px-3 py-2.5 font-medium">Source</th>
                  <th className="px-3 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.responses.map((response) => (
                  <tr key={response.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      <Link href={`${formPathPrefix}/${data.form.id}/responses/${response.id}`} className="hover:text-foreground">
                        {formatDate(response.createdAt)}
                      </Link>
                    </td>
                    {data.questions.map((question) => {
                      const value = response.answers[question.id];
                      const display = value ? (value.length > 60 ? `${value.slice(0, 60)}…` : value) : "—";
                      return <td key={question.id} className="max-w-[160px] px-3 py-2.5" title={value ?? undefined}><span className="block truncate">{display}</span></td>;
                    })}
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{response.sourceUrl ? <span className="rounded-md bg-muted px-2 py-0.5">{response.sourceUrl}</span> : "—"}</td>
                    <td className="px-3 py-2.5 text-right"><Link href={`${formPathPrefix}/${data.form.id}/responses/${response.id}`} className="text-xs text-primary underline underline-offset-4">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.total > data.pageSize ? (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {data.page} of {totalPages}</span>
              <div className="flex gap-2">
                {data.page > 1 ? <Link href={`${formPathPrefix}/${data.form.id}/responses?page=${data.page - 1}`} className="rounded-md border px-3 py-1.5 text-xs">Previous</Link> : null}
                {data.page < totalPages ? <Link href={`${formPathPrefix}/${data.form.id}/responses?page=${data.page + 1}`} className="rounded-md border px-3 py-1.5 text-xs">Next</Link> : null}
              </div>
            </div>
          ) : null}
        </DashboardPanel>
      )}
    </div>
  );
}
