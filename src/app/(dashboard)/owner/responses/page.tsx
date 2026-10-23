import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { requireUserPage } from "@/lib/session";
import { listForms } from "@/modules/form/form.service";
import { DashboardPageHeader } from "@/modules/dashboard/ui/dashboard-page-header";
import { DashboardPanel } from "@/modules/dashboard/ui/dashboard-panel";

export default function OwnerResponsesPage() {
  return <Suspense fallback={<div className="text-sm text-muted-foreground">Loading responses…</div>}><Responses /></Suspense>;
}

async function Responses() {
  const user = await requireUserPage();
  const forms = await listForms(user.id);
  const total = forms.reduce((count, form) => count + form._count.responses, 0);
  return <div className="space-y-6"><DashboardPageHeader title="Responses" subtitle={`${total} response${total === 1 ? "" : "s"} across your forms.`} /><DashboardPanel title="Form responses" subtitle="Choose a form to review its submissions.">{forms.length === 0 ? <p className="rounded-xl border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">Create and publish a form before collecting responses.</p> : <ul className="divide-y rounded-xl border bg-card">{forms.map((form) => <li key={form.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><MessageSquare className="size-5" /></span><div><p className="font-semibold">{form.title}</p><p className="text-sm text-muted-foreground">{form._count.responses} response{form._count.responses === 1 ? "" : "s"} · {form._count.questions} field{form._count.questions === 1 ? "" : "s"}</p></div></div><Link href={`/owner/forms/${form.id}/responses`} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">View responses <ArrowRight className="size-4" /></Link></li>)}</ul>}</DashboardPanel></div>;
}
