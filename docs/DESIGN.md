# Mini ATS: features, DFD and system design

## 1. Features

| Area | What it does |
|---|---|
| Authentication | Single recruiter login (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), JWT session cookie, middleware guards all app routes |
| Job management | Separate `jobs` table (title, department, open/closed). CRUD + close/reopen/delete. Candidates must reference a job |
| Candidate management | Create, view, edit, delete. Name, email, phone, role (job FK), skills, experience, source |
| Resume upload | PDF/DOC/DOCX file ≤ 3 MB, magic-byte validation, stored base64 in Postgres, authenticated download API. Optional external resume/portfolio link |
| Notes | Multiple free-form notes per candidate (`candidate_notes`), with author and timestamp; delete any note |
| Hiring pipeline | Applied, Screening, Interview, Offer, Hired, Rejected, with a rule set for valid moves |
| Stage history | Every change stored in `stage_events` with from/to stage, note and timestamp |
| Email | New-candidate alert to admin; optional candidate stage-update email (Resend or console) |
| Search | Name, email, role title and skills (case-insensitive) |
| Filters and sort | Stage, job, newest, oldest, name, experience. Paginated, URL-driven |
| CSV export | Auth-guarded `/api/candidates/export` respects current filters |
| Dashboard | Totals, hire rate, average days to hire, per-stage counts, weekly applicants, top roles, recent activity |
| Board | Drag and drop between stages with optimistic updates |

## 2. Data flow diagram (level 1)

Export this block to PNG: paste into [mermaid.live](https://mermaid.live) and download, or run `npx @mermaid-js/mermaid-cli -i docs/dfd.mmd -o docs/dfd.png`.

```mermaid
flowchart LR
  R[Recruiter]
  AUTH((0.0 Login / session))
  P1((1.0 Manage jobs))
  P2((2.0 Manage candidates))
  P3((3.0 Move stage + notify))
  P4((4.0 Notes))
  P5((5.0 Search / export))
  P6((6.0 Dashboard))
  D1[(D1 jobs)]
  D2[(D2 candidates)]
  D3[(D3 stage_events)]
  D4[(D4 candidate_notes)]
  D5[(D5 resume_files)]
  EXT[(Email / Resend)]

  R -->|credentials| AUTH
  AUTH -->|session cookie| R
  R -->|job details| P1
  R -->|candidate + resume file| P2
  R -->|new stage, note, notify?| P3
  R -->|note body| P4
  R -->|query, filters| P5
  R -->|open overview| P6

  P1 -->|insert, update, close| D1
  P2 -->|insert, update, delete| D2
  P2 -->|store file| D5
  P2 -->|initial Applied event| D3
  P3 -->|update stage| D2
  P3 -->|log transition| D3
  P3 -->|optional stage email| EXT
  P4 -->|insert, delete| D4
  D1 -->|job list for FK| P2
  D2 -->|join for search| P5
  D2 -->|stage counts| P6
  D3 -->|timestamps, activity| P6
  D2 -->|rows| P5
  P5 -->|CSV file| R
  P6 -->|metrics| R
```

## 3. Data model

```mermaid
erDiagram
  JOBS ||--o{ CANDIDATES : receives
  CANDIDATES ||--o{ STAGE_EVENTS : has
  CANDIDATES ||--o{ CANDIDATES_NOTES : has
  CANDIDATES ||--o| RESUME_FILES : has

  JOBS {
    uuid id PK
    text title UK
    text department
    job_status status
    timestamptz created_at
    timestamptz updated_at
  }
  CANDIDATES {
    uuid id PK
    text name
    text email UK
    text phone
    uuid job_id FK
    stage stage
    text_array skills
    int experience_years
    text source
    text resume_url
    timestamptz created_at
    timestamptz updated_at
  }
  CANDIDATES_NOTES {
    uuid id PK
    uuid candidate_id FK
    text body
    text author
    timestamptz created_at
  }
  RESUME_FILES {
    uuid id PK
    uuid candidate_id FK
    text filename
    text content_type
    int size
    text data
    timestamptz created_at
  }
  STAGE_EVENTS {
    uuid id PK
    uuid candidate_id FK
    stage from_stage
    stage to_stage
    text note
    timestamptz created_at
  }
```

Indexes: `jobs(status)`, `candidates(stage, job_id, created_at)`, `candidate_notes(candidate_id)`, `resume_files(candidate_id)`, `stage_events(candidate_id)`. Unique: `jobs(title)`, `candidates(email)`.

## 4. System design

```
Browser
  |  RSC payload / Server Action POST / authenticated file download
  v
Next.js middleware  -- unauthenticated -> /login
  |
  v
Next.js 16 (App Router)
  - Server Components read data directly (no REST layer needed)
  - Server Actions write data: requireUser -> Zod validate -> rules -> db.batch([...])
  - Route handlers: /api/resume/[id], /api/candidates/export (session-guarded)
  - Client Components only where interaction needs it: filters, forms, board, notes
  |  HTTPS (Neon serverless driver)
  v
NeonDB (Postgres)
```

**Key decisions**

- **Server Components and Server Actions over a REST API.** Fewer moving parts, types shared end to end.
- **Separate jobs table.** Role is a real entity with status; candidates hold a UUID FK, not free text.
- **Resume in Postgres as base64.** Keeps the stack to one database; files capped at 3 MB to stay under Vercel request limits; magic-byte check rejects renamed files.
- **Multiple notes table.** Notes are append-only rows with author + timestamp, not a single overwritten column.
- **Filters live in the URL.** Back button works, results are shareable.
- **Atomic stage changes.** Candidate update and history insert run in one `db.batch`.
- **Stage rules in one function** (`canMove`), used by server and UI.
- **Email is optional.** Without `RESEND_API_KEY`, emails log to the server console so local dev still works.
- **Lazy DB client.** `next build` works without a database connection.

**Request flows**

- *Login:* form -> `credentialsMatch` -> signed JWT cookie (`AUTH_SECRET`) -> redirect. Middleware checks the cookie on every request.
- *Move stage:* UI -> `changeStage(id, to, note, notify)` -> load current -> `canMove` -> batch -> optional `after(() => sendEmail)` -> revalidate.
- *Add candidate:* form + optional file -> validate -> job status check -> duplicate email check -> batch insert candidate + event + resume row -> admin email queued.
- *Export:* `/api/candidates/export?q=&stage=&job=` -> session check -> join query -> CSV response with Content-Disposition attachment.

**Edge cases handled:** duplicate email, invalid UUID (404), invalid stage transition, closed job cannot receive candidates, job with candidates cannot be deleted, oversized/malformed resume files, open-redirect on login `next` param, empty search results, failed optimistic board move (rollback), pagination reset on filter change, LIKE wildcards escaped.

**Tests (Vitest):** stage rules, candidate/job/note validators, resume size/type/signature checks, CSV escaping, `safeNext` and `credentialsMatch`.
