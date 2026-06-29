import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth/config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/setup"];
const PUBLIC_PREFIXES = ["/api/auth", "/api/public", "/track", "/_next", "/favicon"];

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.includes(path);
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isLoggedIn && (path === "/login" || path === "/setup")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
