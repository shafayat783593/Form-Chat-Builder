import { ZodError } from "zod";
import { AppError } from "./errors";

/** Maximum size of a public submission body (PRD section 7.1). */
export const MAX_BODY_BYTES = 32 * 1024;

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

// error handeler
export function withErrorHandler<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof AppError)
        return Response.json({ error: e.message, details: e.details }, { status: e.status });
      if (e instanceof ZodError)
        return Response.json({ error: "Invalid input", details: e.flatten() }, { status: 400 });
      console.error(e);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

/**
 * Reads and parses a JSON request body.

 */
export async function readJson(req: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new AppError(400, "Request body too large");
  }

  const raw = await req.text();
  if (raw.length > maxBytes) {
    throw new AppError(400, "Request body too large");
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError(400, "Invalid JSON body");
  }
}

/** Best-effort client IP, used as part of the rate-limit key. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
