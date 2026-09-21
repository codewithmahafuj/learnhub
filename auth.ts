import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Provider } from "next-auth/providers";
import type { Adapter } from "next-auth/adapters";

import type { Role } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * LearnHub Auth.js (NextAuth v5) configuration — server-side only.
 *
 * Session strategy: JWT (cookie-embedded). This is REQUIRED for the Credentials
 * provider: @auth/core explicitly throws `UnsupportedStrategy` when Credentials
 * is combined with database sessions. The PrismaAdapter is still attached so
 * that OAuth (Step 6+) can persist Account/Session/User records with the exact
 * same setup, and the existing Session model remains ready for that switch.
 *
 * The user's database role (STUDENT | ADMIN) is preserved into the session via
 * the jwt/session callbacks below. passwordHash is NEVER returned from
 * authorize, so it can never reach the cookie or the client.
 */

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const email = credentials?.email;
      const password = credentials?.password;

      if (typeof email !== "string" || typeof password !== "string") {
        return null;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // bcrypt.compare against a constant dummy hash when the user does not
      // exist: equalizes response time so attackers can't enumerate emails
      // via timing. Falls back to comparing against nothing if the field is
      // missing (OAuth-only account).
      const DUMMY_HASH =
        "$2a$10$CwTycUXWue0Thq9StjUM0uJ8DGxAiyPBM1v4Dd1y0b5W9XhFh5S1m";
      const passwordHash = user?.passwordHash ?? DUMMY_HASH;
      const isValid = await bcrypt.compare(password, passwordHash);

      if (!user || !user.passwordHash || !isValid) {
        return null;
      }

      // Only plain, non-sensitive fields are returned — no passwordHash.
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    // Keep Auth.js defaults for now; a custom branded sign-in page comes with
    // the login UI step (the existing (auth)/login page is NOT touched here).
  },
  callbacks: {
    /** Copy the DB role (and other claim fields) into the JWT at sign-in. */
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
});
