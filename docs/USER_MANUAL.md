# Mini ATS — User Manual (for recruiters)

## Who is this for?

Hiring managers and recruiters who want a simple pipeline: **Applied → Screening → Interview → Offer → Hired**. No training required — if you can use a spreadsheet, you can use this.

## Getting started

1. Open the app URL (e.g. your Vercel link).
2. Click **Get started** and create an account (name, email, password ≥ 8 characters).
3. You land on **Dashboard** — metrics appear once you add candidates.

Demo login (local seed only): `admin@example.com` / `admin123`.

## 1. Create a job (role)

1. Go to **Jobs → New job**.
2. Enter the role title (e.g. "Frontend Engineer") and optional description.
3. Save. The job appears in the Jobs table with status **Open**.
4. Close a job anytime from its edit page — candidates keep their history.

*Why jobs first?* Candidates always belong to a role. That keeps search, filters and CSV export clean.

## 2. Add a candidate

1. **Candidates → New candidate** (or the **+** button in the sidebar).
2. Fill in:
   - **Name / Email / Phone** — email must be unique (per your account).
   - **Job** — pick an open role.
   - **Stage** — usually start at *Applied*.
   - **Skills, experience, source** — optional but useful for search.
3. **Resume**: upload PDF/DOC/DOCX (max 3 MB) **or** paste a portfolio/GitHub link.
4. Save. The candidate is added and their profile opens.

You'll get an **email alert** (to the recruiter inbox) that a new candidate was added.

## 3. Move candidates through the pipeline

### Board (drag & drop)

Open **Board**. Columns are stages. Drag a card to the next column.

Rules (built in so mistakes can't happen):
- After **Offered** you can only go to **Hired** or back.
- **Hired** is final — no more moves.
- **Rejected** can only be reopened to **Applied**.

### Profile

Open a candidate → **Change stage**. Add an optional note (e.g. "Strong system design"). Tick **Notify candidate by email** if you want them to receive a stage update.

Every move is logged with time and note under **Stage history**.

## 4. Notes

On the candidate profile, **Add note** for interview feedback, salary discussion, etc. Notes stack newest-first; you can delete any note. Unlimited notes per candidate.

## 5. Search & filter

On **Candidates**:
- **Search** by name, email, role title or skill.
- **Filter** by stage (chips with counts) or by job.
- **Sort** by newest, oldest, name or experience.
- **Page** through results at the bottom.

Filters stay in the URL — copy the link to share a view with a teammate.

## 6. Export CSV (with preview)

1. On **Candidates**, click **Export CSV**.
2. A **preview dialog** opens — check the first rows, page through with Prev/Next.
3. If it looks right, click **Download full CSV**.

The file respects your current search/filters. Columns:

`Name, Email, Phone, Role, Stage, Experience, Skills, Source, Resume link, Applied on`

Open it in Excel / Google Sheets for reporting.

## 7. Dashboard metrics

- **Total / In progress / Hired** — quick counts.
- **Hire rate** and **avg days to hire**.
- **Pipeline bars** — click a stage to filter candidates.
- **New applicants** — last 8 weeks.
- **Busiest roles** — where the volume is.
- **Recent activity** — latest stage moves.

## 8. Emails

| When | Who gets it |
| --- | --- |
| New candidate added | Recruiter inbox (`NOTIFY_EMAIL`) |
| Stage change (if you tick notify) | The candidate |

## Tips

- Close jobs you're done hiring for — they stay out of the "New candidate" dropdown noise but keep history.
- Use **source** (LinkedIn, Referral, Careers page) to see where great hires come from.
- Rejected candidates can come back: drag them to **Applied**.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Can't log in | Check email/password. Demo: `admin@example.com` / `admin123`. |
| Resume won't upload | Must be PDF/DOC/DOCX under 3 MB. |
| Email not received | Check server logs / Resend dashboard; without API key emails only log to console. |
| CSV looks empty | Clear filters — export follows active filters. |
