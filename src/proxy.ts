import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth-edge";

export const runtime = "edge";

export async function proxy(req: NextRequest) {
  // Read session cookie
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  const isAuth = !!user;

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isProtected =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/editor");

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isProtected && !isAuth) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/auth/:path*"],
};
