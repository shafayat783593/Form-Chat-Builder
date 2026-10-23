import Link from "next/link";
import { getResponseForOwner } from "../response.service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date);
}

interface ResponseDetailPageProps {
  formId: string;
  responseId: string;
  ownerId: string;
  formPathPrefix: string;
}

export async function ResponseDetailPage({ formId, responseId, ownerId, formPathPrefix }: ResponseDetailPageProps) {
  const response = await getResponseForOwner(responseId, ownerId);
  if (response.form.id !== formId) throw new Error("Response not found");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{response.form.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submitted {formatDate(response.createdAt)}</p>
          {response.sourceUrl ? <p className="mt-1 text-xs text-muted-foreground">From <span className="rounded-md bg-muted px-2 py-0.5">{response.sourceUrl}</span></p> : null}
        </div>
        <Link href={`${formPathPrefix}/${formId}/responses`} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">← Back to responses</Link>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Answers</h2>
        <dl className="mt-4 space-y-4">
          {response.answers.map((answer) => <div key={answer.questionId} className="border-b pb-3 last:border-0 last:pb-0"><dt className="text-xs font-medium text-muted-foreground">{answer.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{answer.value || "—"}</dd></div>)}
        </dl>
      </div>
    </div>
  );
}
