import { Suspense } from "react";
import { requireAdminPage } from "@/lib/session";
import { ResponsesPage } from "@/modules/response/components/responses-page";

export default function AdminResponsesRoute({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  return <Suspense fallback={<div className="text-sm text-muted-foreground">Loading responses…</div>}><AdminResponses params={params} searchParams={searchParams} /></Suspense>;
}

async function AdminResponses({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ id }, { page }, user] = await Promise.all([params, searchParams, requireAdminPage()]);
  return <ResponsesPage formId={id} ownerId={user.id} page={Math.max(1, Number.parseInt(page ?? "1", 10) || 1)} formPathPrefix="/admin/forms" />;
}
