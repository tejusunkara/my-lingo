# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint via next lint

npm run db:push      # Push schema changes to Neon PostgreSQL (uses bunx drizzle-kit)
npm run db:seed      # Seed the database with courses/units/lessons/challenges
npm run db:studio    # Open Drizzle Studio (visual DB browser)
```

No test suite is configured yet.

## Architecture

**My Lingo** is a Duolingo-style language learning SaaS built with Next.js 14 App Router, Drizzle ORM, Neon (serverless PostgreSQL), and Clerk for auth.

### Route groups

- `app/(landing)/` — unauthenticated marketing/landing pages
- `app/(main)/` — authenticated app shell with sidebar + mobile header; all learning routes live here
- `app/buttons/` — component playground

### Data layer (`db/`)

- `db/drizzle.ts` — Neon HTTP client + Drizzle instance with full schema (used at runtime)
- `db/schema.ts` — single source of truth for all tables
- `db/queries.ts` — React-cached read queries (`getUserProgress`, `getUnits`, `getCourses`, `getCourseById`)
- `actions/user-progress.ts` — Server Actions that mutate DB, then `revalidatePath` + `redirect`

### Schema hierarchy

```
courses → units → lessons → challenges → challengeOptions
                                       ↘ challengeProgress (per userId)
userProgress (userId PK, activeCourseId FK → courses)
```

`challengeProgress` is keyed by `userId` (Clerk user ID as plain text, not a FK) + `challengeId`. A lesson is considered completed when all its challenges have at least one `challengeProgress` row with `completed: true`.

### Auth

Clerk is the auth provider. `middleware.ts` protects all routes via `clerkMiddleware()`. Server-side auth is accessed with `auth()` and `currentUser()` from `@clerk/nextjs/server`.

### UI

Components use `shadcn/ui` (configured in `components.json`) with Tailwind CSS. Custom button variants (`secondary`, `primaryOutline`, etc.) are defined in `components/ui/button.tsx` using `class-variance-authority`.

### Environment variables required

- `DATABASE_URL` — Neon connection string
- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `tejusunkara/my-lingo`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
