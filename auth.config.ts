import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";

import type { Role } from "@/lib/generated/prisma/client";

/**
 * Shared, node-dependency-free Auth.js base configuration.
 *
 * This module is imported by BOTH:
 *   - auth.ts (full instance: Prisma adapter + Credentials provider), and
 *   - proxy.ts (lightweight JWT-only instance for route protection).
 *
 * It must therefore never import `@/lib/prisma`, `bcryptjs`, or anything else
 * that pulls Node-only/database code. The callbacks here are the SINGLE source
 * of truth — they are defined once and shared, not duplicated.
 */
export const authConfig = {
  providers: [] as Provider[],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    // Auth.js defaults for now; the custom (auth) pages call signIn directly.
  },
  callbacks: {
    /** Copy the DB role (and id) into the JWT at sign-in. */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    /** Copy id/role from the JWT into the session object read by the app. */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
