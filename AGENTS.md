<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Learnings (LearnHub)

## Architecture

- Auth.js v5 config is split: `auth.config.ts` (node-dep-free base: session strategy + jwt/session callbacks, single source of truth) is composed by BOTH root `auth.ts` (adds PrismaAdapter + Credentials provider) and `proxy.ts` (JWT-only `NextAuth(authConfig)` for route protection). Never import `@/lib/prisma` or `bcryptjs` into `proxy.ts`/`auth.config.ts`.
- Credentials provider REQUIRES JWT sessions: `@auth/core` throws `UnsupportedStrategy` for credentials + database sessions (verified in source). The `Session` model stays unused until OAuth arrives; `PrismaAdapter` stays attached.
- Next 16 uses root `proxy.ts` (`export default` + optional `config.matcher`), NOT `middleware.ts` (deprecated). Verify conventions in `node_modules/next/dist/docs/` — `read_files` is blocked there but `code_search` works.
- Proxy matcher excludes `api`, `_next`, static assets; API routes (incl. `/api/auth/*`) are intentionally outside protection.

## Environment & tooling quirks

- Harness exports `PORT=0` → Next.js treats it as "random port"; always pass explicit `-p <port>` (preview uses 3000). `AUTH_TRUST_HOST=true` is required outside production.
- Freebuff preview server on Windows: detached PowerShell `Start-Process -FilePath 'npm.cmd' ... -PassThru` (see `.freebuff/run.md`); stdout/stderr must be different files.
- Neon compute suspends on idle → first request may fail with misleading `P1001 Can't reach database` even when TCP:5432 is reachable; retry or use `connect_timeout=15`.
- `read_url`/docs fetches can be flaky (SSL), `read_files` can't read outside project; npm registry access works.
- Prisma 7: datasource URL lives in `prisma.config.ts` (`DIRECT_URL` for CLI/migrations) + `@prisma/adapter-neon` with pooled `DATABASE_URL` at runtime in `lib/prisma.ts`; client generated to gitignored `lib/generated/prisma` via the `prisma-client` generator (import from `./generated/prisma/client`).
- `"use server"` files may only export async functions — const/interface exports break the Turbopack build (type-only exports are erased and fine).
- Testing users/sessions: JWT cookies survive user deletion. Signout: GET `/api/auth/signout`, then POST the form's `csrfToken` as an **urlencoded** body (a FormData/multipart POST hits MissingCSRF; the signout form's action host — localhost vs 127.0.0.1 — must match the session's cookie host). `curl -c jar` + `/api/auth/csrf` + POST `/api/auth/callback/credentials` (urlencoded) works for scripted auth tests.
- Next 16 resolves Server Actions **per route**: a POST with another route's action fields arrives as "Failed to find Server Action" (500). Cross-route action invocation is blocked by the framework itself (verified dev + prod); testing a guard without the proxy therefore needs a route the action is exported from.
- Testing an admin Server Action end-to-end: sign in as ADMIN in the browser, load the admin page, then swap the session to STUDENT via same-origin `fetch` to `/api/auth/callback/credentials` and submit the real form — exercises proxy + action layers with real React machinery. `form.requestSubmit()` twice in the same tick creates no duplicates (React serializes).
