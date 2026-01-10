# Livingbyte

Livingbyte is a personal operating system for planning and reflection. It brings together tasks, trackers, journals, and events so you can plan your day, capture progress, and reflect in one place.

## Features
- Tasks: categories, priorities, statuses, subtasks, and scheduling
- Trackers: recurring habits and long running goals with status and cadence
- Journals: rich text entries with dates and media attachments
- Events: single day and multi day events with tags
- Schedules: pinned and dated reminders
- Auth: NextAuth with GitHub provider

## Tech stack
- Next.js 16 (App Router)
- TypeScript
- tRPC
- Drizzle ORM with Postgres
- NextAuth
- Tailwind CSS
- BlockNote editor (journals)

## Local setup
1. Install dependencies
   ```bash
   bun install
   ```

2. Create a `.env` file (example)
   ```bash
   DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_JWT_SECRET=your-jwt-secret
   NEXTAUTH_URL=http://localhost:3000
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

3. Push the schema to the database
   ```bash
   bun db:push
   ```

4. Start the dev server
   ```bash
   bun dev
   ```

Open http://localhost:3000.

## Scripts
- `bun dev` - start the dev server
- `bun build` - production build
- `bun start` - run the production server
- `bun lint` - lint the codebase
- `bun generate` - generate Drizzle migrations
- `bun db:push` - push schema to database
- `bun db:studio` - open Drizzle Studio
- `bun db:reset` - reset the database (destructive)

## Database model highlights
The schema in `src/server/db/schema.ts` covers:
- Users and sessions
- Categories, tasks, and subtasks
- Trackers and task to tracker links
- Journals and journal content
- Events (single day and range)
- Schedules

## Project structure
- `src/app` - App Router routes and layouts
- `src/components` - UI components and feature modules
- `src/server` - auth, database, and server utilities
- `src/trpc` - tRPC router and client setup

## Notes
- Use `SKIP_ENV_VALIDATION=1` to bypass env checks for local builds.
- `db:reset` is destructive; use with care.
