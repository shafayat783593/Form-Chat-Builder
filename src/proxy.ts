import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * UX-only guard: it checks that a session cookie is present and redirects to
 * /login when it is not. This is NOT a security boundary - every page and
 * server action must authorise on its own (see lib/session.ts).
 */
export function proxy(req: NextRequest) {
  if (!getSessionCookie(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
