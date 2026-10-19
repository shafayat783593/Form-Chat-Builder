import { ZodError } from "zod";
import { AppError } from "./errors";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof AppError) return { ok: false, error: e.message };
    if (e instanceof ZodError) return { ok: false, error: "Invalid input" };
    console.error(e);
    return { ok: false, error: "Something went wrong" };
  }
}