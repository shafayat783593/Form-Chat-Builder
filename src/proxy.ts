import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";


export function proxy(req: NextRequest) {
  if (!getSessionCookie(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
