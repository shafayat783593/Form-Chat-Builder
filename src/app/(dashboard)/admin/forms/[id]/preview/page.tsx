import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/session";

export default async function AdminFormPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  redirect(`/owner/forms/${id}/preview`);
}
