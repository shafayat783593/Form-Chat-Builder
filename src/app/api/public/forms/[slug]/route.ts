import { withErrorHandler } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getPublishedFormBySlug } from "@/modules/form/form.service";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = withErrorHandler<Ctx>(async (_req, { params }) => {
  const { slug } = await params;
  const form = await getPublishedFormBySlug(slug);
  if (!form) throw new AppError(404, "Form not found");
  return Response.json(form);
});