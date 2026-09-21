# LearnHub — Preview Run Doc

Next.js 16 (Turbopack) dev server for the LearnHub LMS. This workspace IS the
main checkout, so there is normally nothing to copy.

## 1. Reproduce the uncommitted artifacts

A fresh checkout needs these before the server will start:

1. **Install dependencies** (npm; `package-lock.json` is committed):

   ```
   npm install
   ```

2. **Copy `.env` from the main checkout**
   (`E:\Development\WebDev\learnhub\.env`). It must define `DATABASE_URL`
   (pooled Neon string), `DIRECT_URL` (unpooled Neon string), and
   `AUTH_SECRET`. Never copy real values into any committed file.

3. **Generate the Prisma client** (output is gitignored):

   ```
   npx prisma generate
   ```

No build artifacts are required for dev mode; `.next/` regenerates itself.

## 2. Run the server

Important environment quirk: the harness may export `PORT=0`, which Next.js
treats as "pick a random port". Always pass the port explicitly.

```
AUTH_TRUST_HOST=true PORT=3000 npm run dev -- -p 3000
```

- URL: http://127.0.0.1:3000
- `AUTH_TRUST_HOST=true` is required for Auth.js to accept the preview host
  header outside production.
- Logs for the managed preview process: `.freebuff/preview-612742ad-82c7-4301-8c22-1b43a115aa38.log`
  (stdout) and the same path with `.err` appended (stderr).

Detached launch (Windows), as used for the Freebuff preview:

```
powershell -NoProfile -Command "$env:AUTH_TRUST_HOST='true'; $env:PORT='3000'; (Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','-p','3000' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

`Start-Process` requires the full executable name (`npm.cmd`); stdout and
stderr must point at different files. Then confirm the pid:

```
powershell -NoProfile -Command "Get-Process -Id <pid>"
```

## Notes

- Port 3000 is the project default (create-next-app). If it is occupied, pass
  any free port to `-p`/`PORT` and use it in the preview URL.
- The Neon compute suspends on idle; the first request after a pause may take
  a few seconds (connection strings carry `connect_timeout=15`).
