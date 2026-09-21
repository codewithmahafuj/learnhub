import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/generated/prisma/client";

/**
 * Auth.js module augmentation.
 *
 * Makes `session.user.id` and `session.user.role` type-safe across the app.
 * The role reuses the Prisma `Role` enum type (STUDENT | ADMIN) — no duplicate
 * string union, so the session type and the database stay in sync.
 *
 * The `authorize` callback in auth.ts returns `role` on the user object, which
 * the jwt callback copies into the token, and the session callback copies from
 * the token into the session — this augmentation is what makes those fields
 * visible to TypeScript everywhere else.
 */
declare module "next-auth" {
  interface User {
    /** Database role, present on users returned from authorize(). */
    role?: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
