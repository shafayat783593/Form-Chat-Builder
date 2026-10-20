import { withErrorHandler, readJson, clientIp } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { submitResponseSchema } from "@/modules/response/response.schema";
import { submitResponse } from "@/modules/response/response.service";

type Ctx = { params: Promise<{ slug: string }> };

/** Submissions allowed per minute, per IP, per form. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000;

export const POST = withErrorHandler<Ctx>(async (req, { params }) => {
  const { slug } = await params;

  const limit = rateLimit(`${clientIp(req)}:${slug}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = submitResponseSchema.parse(await readJson(req));
  const saved = await submitResponse(slug, body);

  return Response.json({ ok: true, id: saved.id }, { status: 201 });
});

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
