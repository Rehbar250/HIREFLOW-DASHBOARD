# HireFlow

A production-structured recruitment / applicant-tracking app: track candidates, post roles, rank applicants by fit, import résumés (PDF / DOCX / XML / CSV), and send templated email — with the Google Gemini key and email credentials kept **server-side**.

Built with Next.js 14 (App Router) · TypeScript · Prisma · Tailwind CSS.

---

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
#    then edit .env — at minimum set ADMIN_PASSWORD and AUTH_SECRET.
#    Add GEMINI_API_KEY to enable PDF/DOCX résumé parsing.

# 3. Create the database and seed sample data
npm run setup

# 4. Run
npm run dev
```

Open http://localhost:3000 and sign in with the password from `ADMIN_PASSWORD`.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Database connection. Defaults to local SQLite (`file:./dev.db`). |
| `AUTH_SECRET` | yes | Long random string used to sign the session cookie. |
| `ADMIN_PASSWORD` | yes | The password you log in with. |
| `GEMINI_API_KEY` | for PDF/DOCX | Google Gemini key. Stored server-side, never sent to the browser. |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.0-flash`. |
| `COMPANY_NAME` | no | Default company name (also editable in Settings). |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | for real email | SMTP server. If `SMTP_HOST` is blank, emails are logged to the server console instead of sent. |
| `EMAIL_FROM` | no | From address on outgoing email. |

> **Security:** never commit `.env`, and never paste your live API key into a chat, screenshot, or shared doc. If a key is exposed, regenerate it. Keys belong only in `.env` (local) or your host's secret manager (production).

---

## How it works

- **Candidates / Jobs** — full CRUD via REST routes under `/api`, persisted with Prisma.
- **Match & shortlist** — pure scoring function (`src/lib/match.ts`): 70% required-skill overlap + 30% experience fit. Select the top N and bulk-email them.
- **Import** — files are parsed **on the server** (`/api/parse`). CSV and XML are read structurally; PDF and DOCX are read with Gemini (DOCX text is first extracted with `mammoth`). Extracted drafts are shown for review before anything is saved.
- **Email** — templated via `{{name}}`, `{{role}}`, `{{company}}`; sent with Nodemailer and recorded in an audit log. New applicants can be auto-acknowledged (toggle in Settings).
- **Auth** — single-admin password → signed JWT in an httpOnly cookie, enforced by `src/middleware.ts` on every route.

---

## Going to real production

This is a solid, self-contained foundation. For a hardened multi-user deployment, plan for:

1. **Managed database** — switch the Prisma datasource to PostgreSQL: set `provider = "postgresql"` in `prisma/schema.prisma`, point `DATABASE_URL` at your managed Postgres, then `npx prisma migrate deploy`.
2. **Real email** — configure SMTP, or swap `src/lib/email.ts` for a provider SDK (Resend, SendGrid, SES).
3. **File storage** — uploads are parsed in-memory and discarded. To keep originals, stream them to S3 / R2 / GCS and store the URL on the candidate.
4. **Multi-user auth** — replace the single-password gate with per-user accounts and roles (e.g. NextAuth / Auth.js, or your SSO).
5. **Hardening** — rate-limit `/api/auth/login` and `/api/parse`, add request validation (e.g. zod), structured logging, and error monitoring (Sentry).
6. **Deploy** — Vercel is the smoothest path (set all env vars in the dashboard). Any Node host works with `npm run build && npm run start`.

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run setup` | `prisma db push` + seed sample data |
| `npm run db:push` | Sync schema to the database |
| `npm run db:seed` | Seed templates, settings, sample jobs & candidates |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
