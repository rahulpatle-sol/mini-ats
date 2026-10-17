# Mini ATS

A small Applicant Tracking System: login-protected, manage jobs and candidates, upload resumes, track stages with notes, export CSV, and get email alerts.

**Stack:** Next.js 16 (App Router, Server Actions), NeonDB (Postgres), Drizzle ORM, Tailwind CSS v4, Zod, jose (sessions), Vitest.

## Features

- **Login / auth** — single recruiter account (`ADMIN_EMAIL` + `ADMIN_PASSWORD`), JWT session cookie via `AUTH_SECRET`, middleware protects every route except `/login`
- **Jobs table** — separate `jobs` table with title, department, open/closed status; candidates reference a job by UUID
- **Resume file upload** — PDF/DOC/DOCX up to 3 MB, magic-byte validation, stored as base64 in Postgres, served through an authenticated download API. A resume/portfolio **link** field is also available
- **Multiple notes** — `candidate_notes` table; add/delete any number of notes per candidate (plus stage-change notes in the event history)
- **Stage pipeline** — Applied → Screening → Interview → Offer → Hired; Rejected is terminal except reopen-to-Applied. Every move is logged
- **CSV export** — `/api/candidates/export` respects current search/stage/job filters
- **Email notifications** — new-candidate alert to admin; optional candidate stage-update email. Uses Resend when `RESEND_API_KEY` is set, otherwise logs to the server console
- **Dashboard** — totals, hire rate, pipeline bars, weekly applicants, busiest roles, recent activity
- **Board** — drag-and-drop kanban with optimistic updates

## Run it

```bash
npm install
cp .env.example .env.local   # fill DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET
npm run db:push              # create tables (or paste schema.sql in the Neon SQL editor)
npm run db:seed              # optional demo data
npm run dev                  # http://localhost:3000
```

Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Tests

```bash
npm test
```

Vitest covers stage rules, form validators, resume file checks, CSV escaping, and auth helpers.

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add environment variables: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, optional `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAIL`, `APP_URL`
4. Deploy — Vercel runs `next build` automatically

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon Postgres connection string |
| `ADMIN_EMAIL` | yes | Login email |
| `ADMIN_PASSWORD` | yes | Login password |
| `AUTH_SECRET` | yes | ≥32 random chars; signs the session cookie |
| `RESEND_API_KEY` | no | Enables real email; without it emails log to console |
| `EMAIL_FROM` | no | From header for Resend |
| `NOTIFY_EMAIL` | no | New-candidate alert recipient (defaults to `ADMIN_EMAIL`) |
| `APP_URL` | no | Public URL used in email links |

## Structure

```
src/
  app/
    login/          sign-in page (public)
    (app)/          protected: dashboard, candidates, jobs, board
    api/            resume download + CSV export (auth-guarded)
  actions/          server actions: auth, candidates (incl. notes), jobs
  components/       UI, forms, kanban board, notes
  db/               Drizzle schema, Neon client, seed
  lib/              session, auth, queries, validators, email, resume, csv
  middleware.ts     redirects unauthenticated users to /login
docs/DESIGN.md      features, DFD (Mermaid), ER diagram, system design
```

## DFD (PNG)

`docs/DESIGN.md` contains the DFD as Mermaid source. Export to PNG with:

```bash
npx @mermaid-js/mermaid-cli -i docs/dfd.mmd -o docs/dfd.png
```

or paste the Mermaid block into [mermaid.live](https://mermaid.live) and download the PNG.
