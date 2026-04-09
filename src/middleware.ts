import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_MATCHERS = [
  "/dashboard",
  "/cases",
  "/reports",
  "/settings",
  "/api/admin",
  "/api/reports",
  "/api/uploads",
];

function isAdminPath(pathname: string) {
  return ADMIN_MATCHERS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Security headers (no third-party tracking scripts required)
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), clipboard-read=(), clipboard-write=()",
  );
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' blob: data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "font-src 'self'",
    ].join("; "),
  );

  if (!isAdminPath(req.nextUrl.pathname)) return res;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) return res;

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

