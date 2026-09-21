import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 CLI configuration.
 *
 * The CLI (migrations, introspection, studio) connects DIRECTLY to Neon using
 * the unpooled connection string (DIRECT_URL). The pooled DATABASE_URL is used
 * at runtime by the app via the @prisma/adapter-neon driver adapter
 * (see lib/prisma.ts).
 *
 * No credentials are hardcoded here — values are loaded from the environment
 * via .env (gitignored) / process env.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI uses this for migrations: Neon requires a DIRECT (unpooled)
    // connection for schema operations.
    url: env("DIRECT_URL"),
  },
});
