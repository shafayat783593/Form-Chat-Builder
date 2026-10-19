import { ZodError } from "zod";
import { AppError } from "./errors";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

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