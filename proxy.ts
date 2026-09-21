import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";

/**
 * Next.js 16 request proxy (formerly middleware) — server-side route
 * protection and role-based authorization.
 *
 * Security model:
 * - Runs at the request boundary on EVERY matched path (see `config.matcher`),
 *   so /admin/* cannot be reached by typing a URL, regardless of the UI.
 * - Uses the JWT session via the shared authConfig — NO Prisma, NO bcrypt,
 *   NO database queries here. The role claim inside the JWT was set by the
 *   jwt callback in auth.config.ts at sign-in time.
 * - The full Auth.js instance (adapter + Credentials) in auth.ts remains the
 *   single source of truth for credential verification; this file only reads
 *   the already-verified session.
 *
 * Route rules:
 *   /admin/*                → requires session + role ADMIN
 *                             (unauthenticated → /login?callbackUrl=…,
 *                              STUDENT → /dashboard)
 *   /dashboard /courses /progress /profile /settings /learn/*
 *                             → requires an authenticated session
 *                             (→ /login?callbackUrl=…)
 *   /login /register         → authenticated users are sent to /dashboard
 *                             (safe: registration does not sign the user in,
 *                              so /login?registered=1 still renders for them)
 *   everything else          → public
 */

/** Student-area prefixes that require authentication. */
const STUDENT_PROTECTED_PREFIXES = [
  "/dashboard",
  "/courses",
  "/progress",
  "/profile",
  "/settings",
  "/learn",
];

function isStudentProtected(pathname: string): boolean {
  return STUDENT_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);
  const role = req.auth?.user?.role;

  // /admin/* — requires ADMIN role (future admin routes included automatically)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN") {
      // Authenticated STUDENT poking at admin URLs.
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Student area — requires any authenticated session
  if (isStudentProtected(pathname)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Auth pages — bounce already-authenticated users to /dashboard.
  // Does NOT interfere with registration: registering does not sign the user
  // in, so the post-registration redirect to /login?registered=1 still lands
  // on the login page with its success banner.
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

// Do not run on API routes (Auth.js handlers included), Next internals, or
// static assets — otherwise auth pages/assets could be blocked or redirected.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|woff|woff2)$).*)",
  ],
};
