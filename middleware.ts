import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

/**
 * Route protection for the client workspace and admin console.
 * Visitors without a session are sent to the sign-in page (the root URL)
 * before any protected page renders.
 *
 * In this showcase the session marker is a demo cookie (see
 * lib/auth/session-cookie.ts). With production authentication, verify the
 * provider's signed session here instead of checking for presence only.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
