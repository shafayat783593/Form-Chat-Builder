import { withErrorHandler } from "@/lib/api";
import { submitResponseSchema } from "@/modules/response/response.schema";
import { submitResponse } from "@/modules/response/response.service";

type Ctx = { params: Promise<{ slug: string }> };

export const POST = withErrorHandler<Ctx>(async (req, { params }) => {
  const { slug } = await params;
  const body = submitResponseSchema.parse(await req.json());
  const saved = await submitResponse(slug, body);
  return Response.json({ ok: true, id: saved.id }, { status: 201 });
});

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}