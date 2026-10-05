# Broken Database Hospital

Gamified SQL learning. The hospital database is broken. Patients are waiting. Fix it before the system collapses.

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + **Material UI**
- **Monaco Editor** (SQL editor UI)
- **PostgreSQL via Supabase** (client stub only — execution not wired yet)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional Supabase env vars (not required for the UI foundation):

```bash
cp .env.example .env.local
```

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
    supabase/           # Browser client stub
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

- UI foundation (dashboard, cases, Monaco editor — run disabled)
- Case 001 schema + seed (`patients` / `admissions`)
- No SQL execution, auth, or other case tables yet
