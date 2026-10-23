import { requireUserPage } from "@/lib/session";
import { ResponseDetailPage } from "@/modules/response/components/response-detail-page";

export default async function OwnerResponseDetailRoute({ params }: { params: Promise<{ id: string; responseId: string }> }) {
  const [{ id, responseId }, user] = await Promise.all([params, requireUserPage()]);
  return <ResponseDetailPage formId={id} responseId={responseId} ownerId={user.id} formPathPrefix="/owner/forms" />;
}
