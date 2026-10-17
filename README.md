# Mini ATS

A small Applicant Tracking System: manage candidates, move them through hiring stages, search and filter, and see pipeline metrics.

**Stack:** Next.js 16 (App Router, Server Components + Server Actions), NeonDB (Postgres), Drizzle ORM, Tailwind CSS v4, Zod.

## Run it

```bash
npm install
cp .env.example .env.local      # paste your Neon connection string as DATABASE_URL
npm run db:push                 # creates tables in Neon (or paste schema.sql in the Neon SQL editor)
npm run db:seed                 # optional: 28 demo candidates with stage history
npm run dev                     # http://localhost:3000
```

Needs Node 20.9 or newer.

## Features

- **Overview dashboard:** total, in progress, hired, hire rate, average days to hire, pipeline by stage, new applicants per week, busiest roles, recent activity
- **Candidates:** add, edit, delete, with validation and duplicate email checks
- **Hiring stages:** Applied, Screening, Interview, Offer, Hired, Rejected. Every move is logged with a time and optional note
- **Stage rules:** Hired is final. Rejected can only be reopened to Applied
- **Search and filter:** search name, email, role and skills; filter by stage and role; sort; pagination. All state lives in the URL, so links are shareable
- **Board:** drag candidates between columns (Move menu on touch screens), optimistic updates with rollback on error
- **UI:** light and dark mode, responsive, keyboard focus styles, loading and empty states

## Structure

```
src/
  app/            routes: / , /candidates, /candidates/new, /candidates/[id], /candidates/[id]/edit, /board
  actions/        server actions (create, update, delete, changeStage)
  components/     UI, filters, form, kanban board
  db/             Drizzle schema, Neon client, seed script
  lib/            queries, validators, constants, utils
docs/DESIGN.md    features, DFD, ER diagram, system design
```
