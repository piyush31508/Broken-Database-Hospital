# Broken Database Hospital

Gamified SQL learning. The hospital database is broken. Patients are waiting. Fix it before the system collapses.

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + **Material UI**
- **Monaco Editor** (SQL editor UI)
- **PostgreSQL + Auth via Supabase**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

```bash
copy .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
`.env.local` using your Supabase project's API settings. The legacy
`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported. Never put a service-role key
in a `NEXT_PUBLIC_` variable.

Email/password sign-up and sign-in use Supabase Auth. If email confirmation is
enabled, add `http://localhost:3000/auth/callback` to the Supabase project's
allowed redirect URLs. Add the production callback URL there when deploying.
The dashboard and SQL query endpoint require an authenticated session.

## Project structure

```
src/
  app/                  # App Router entry (layout, page, global styles)
  components/
    layout/             # AppShell, Header, Sidebar
    cases/              # Case detail panel
    player/             # XP, rank, hospital status
    editor/             # Monaco SQL editor (UI only)
    ui/                 # Reusable badges, progress, pulse
  lib/
    data/               # Mock cases & player stats
    supabase/           # Supabase browser/server clients and configuration
    theme.ts            # MUI dark hospital theme
    types/              # Shared TypeScript types
  providers/            # Theme + MUI App Router cache
```

## Database (Case 001)

Apply the migration in the Supabase SQL Editor:

`supabase/migrations/20260304120000_case_001_missing_patient_records.sql`

Then set `.env.local` from `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, keys).

Server config lives in `src/lib/supabase/config.ts` + `server.ts`.

## Current scope

- Dashboard, cases, Monaco editor, and Supabase email/password authentication
- Case 001 schema + seed (`patients` / `admissions`)
- No persistent player progress or other case tables yet
