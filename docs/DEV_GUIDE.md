# Mini ATS — Developer Guide

## What is this?

A lightweight **Applicant Tracking System (ATS)** for small hiring teams. Recruiters create jobs, add candidates, move them through a stage pipeline, attach resumes, leave notes, and export everything to CSV.

## Tech stack (and why)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) | Server components for fast first paint; server actions for mutations without hand-rolled API layers; one repo for UI + API. |
| Language | **TypeScript** (strict) | Safer refactors; Drizzle types flow into queries automatically. |
| Database | **PostgreSQL (Neon)** | Managed serverless Postgres — scales to zero, pooled HTTP driver fits serverless functions. |
| ORM | **Drizzle ORM** | Thin SQL-like API, zero runtime overhead, migrations you can read. Neon's `neon-http` driver works without connection pools in Vercel functions. |
| Auth | **JWT session cookie** (`jose`) + **scrypt** (`node:crypto`) | No external auth service; passwords hashed with Node's built-in scrypt (no extra native deps). Session is an HMAC-signed HttpOnly cookie. |
| Styling | **Tailwind CSS v4** | Utility-first, design tokens as CSS variables (light/dark for free). |
| Validation | **Zod v4** | One schema shared by forms (client hints) and server actions (source of truth). |
| Email | **Resend** | Simple HTTP API; without a key, emails log to console so dev still works. |
| File upload | **Magic-byte validation** (no storage vendor) | Resumes stored in Postgres (bytea) for the assignment; swap `resumeFiles` table for S3/R2 in production. |
| Tests | **Vitest** | Fast unit tests for stage rules, CSV, auth helpers, email templates. |
| Deploy | **Vercel** | First-class Next.js support; env vars per environment. |

## Project layout

```
src/
  actions/          Server actions (auth, candidates, jobs, notes)
  app/
    page.tsx        Public landing (Turion-style)
    login/ signup/  Auth pages (desert scene)
    (app)/          Protected app: dashboard, candidates, jobs, board
    api/            resume download, CSV export (+preview), health
  components/       UI pieces (forms, tables, scene, CSV dialog)
  db/               Drizzle schema, client, seed, migrate
  lib/              queries, session, auth, email, csv, constants
  middleware.ts     Session gate for all (app) + mutating APIs
```

## Auth model

1. Signup/login → scrypt-verify password → JWT (`{ uid, sub }`) in `ats_session` HttpOnly cookie.
2. `middleware.ts` redirects unauthenticated users to `/login` for every route except `/`, `/login`, `/signup`, `/api/health`.
3. Every query takes `userId` — one recruiter never sees another's data.
4. Fallback env admin (`ADMIN_EMAIL` + hashed password) exists for first-run setups; the seed creates `admin@example.com` / `admin123`.

## Pipeline rules

Stages: `applied → screening → interview → offered → hired`, plus `rejected`.

- **Hired is terminal** — no further moves.
- **Rejected → applied** is the only reopen path.
- Stage change + `stageEvents` history insert run in one `db.batch` (atomic).

Rules live in `src/lib/constants.ts` and are enforced in server actions.

## API surface

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | public | Env/DB smoke check |
| GET | `/api/resume/[id]` | session | Download resume (PDF/DOC/DOCX) |
| GET | `/api/candidates/export` | session | Full CSV download |
| GET | `/api/candidates/export?preview=1&page=1&pageSize=8` | session | JSON preview (paginated) for the export dialog |

Mutations are **server actions** (`src/actions/*.ts`), not REST — Next.js handles CSRF-ish protection via action IDs and the cookie is HttpOnly.

## Email

- **New candidate** → notify `NOTIFY_EMAIL` (falls back to `ADMIN_EMAIL`).
- **Stage change** → optionally email the candidate (`stageEmail`).
- `RESEND_API_KEY` set → real send via `https://api.resend.com/emails`.
- No key → `[email:skipped]` printed to server logs (dev-friendly).
- Emails send **after** the response via `after()` so they never block the UI.

### Vercel environment variables

Set all of these in **Project → Settings → Environment Variables** (Production + Preview + Development), then **redeploy**:

```
DATABASE_URL=...          # Neon pooled connection string
AUTH_SECRET=...           # openssl rand -base64 32
RESEND_API_KEY=re_...
EMAIL_FROM=Mini ATS <onboarding@resend.dev>
NOTIFY_EMAIL=your-inbox@example.com
APP_URL=https://your-app.vercel.app
ADMIN_EMAIL=...           # optional fallback
ADMIN_PASSWORD=...        # optional fallback
```

Notes:
- On the **Resend free plan**, you can only send to your own account email until a domain is verified. Use `NOTIFY_EMAIL` = the email tied to your Resend account for testing.
- `APP_URL` must be the public Vercel URL so email links open the right app.

## Database

- Schema: `src/db/schema.ts` (users, jobs, candidates, candidateNotes, resumeFiles, stageEvents).
- Local/dev push: `npm run db:push` (interactive) or `npx tsx --env-file=.env src/db/migrate.ts`.
- Seed demo data: `npm run db:seed`.

## Scripts

```bash
npm run dev        # Next.js dev (Turbopack)
npm run build      # production build
npm test           # Vitest unit tests
npm run db:seed    # seed demo user + data
npm run db:push    # push schema (interactive)
```

## Testing

`npm test` covers stage transition rules, CSV escaping, password hash/verify, `safeNext` open-redirect guard, and email template shape.

## Performance notes

- Landing is static-friendly; app pages are `force-dynamic` (per-user data).
- `loading.tsx` under `(app)/` gives an instant skeleton while the server queries run.
- Dashboard queries run in `Promise.all` (parallel).
- CSV export streams from a route handler; the preview dialog pages 8 rows at a time.
