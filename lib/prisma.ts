import "server-only";

import { PrismaClient } from "./generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Server-only Prisma Client for LearnHub.
 *
 * - Uses the Neon serverless driver adapter over the POOLED connection string
 *   (DATABASE_URL) — correct for Next.js serverless / Node runtimes.
 * - `import "server-only"` guarantees this module can never be pulled into a
 *   Client Component bundle; the build fails if anyone tries.
 * - Global singleton avoids spawning a new PrismaClient (and exhausting Neon
 *   connections) on every hot reload during development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy the pooled Neon connection string (with -pooler in the host) into .env."
    );
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
