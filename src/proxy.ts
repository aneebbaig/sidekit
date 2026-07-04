import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/login", "/setup"];
const PUBLIC_PREFIXES = ["/api/auth", "/api/public", "/track", "/_next", "/favicon"];

// Optimistic cookie check only (edge-safe, no DB call). The real session is
// still validated server-side in layouts/actions via auth.api.getSession.
export default function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.includes(path);
  const isLoggedIn = !!getSessionCookie(req);

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isLoggedIn && (path === "/login" || path === "/setup")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
