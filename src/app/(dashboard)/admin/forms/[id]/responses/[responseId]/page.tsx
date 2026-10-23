import { requireAdminPage } from "@/lib/session";
import { ResponseDetailPage } from "@/modules/response/components/response-detail-page";

export default async function AdminResponseDetailRoute({ params }: { params: Promise<{ id: string; responseId: string }> }) {
  const [{ id, responseId }, user] = await Promise.all([params, requireAdminPage()]);
  return <ResponseDetailPage formId={id} responseId={responseId} ownerId={user.id} formPathPrefix="/admin/forms" />;
}
