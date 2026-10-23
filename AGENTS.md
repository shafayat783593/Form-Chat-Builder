# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router application for building and embedding conversational forms. Routes live in `src/app/`, including public pages, dashboard pages, API routes, `/f/[slug]`, and `/embed/[slug]`. Keep domain behavior in `src/modules/<feature>/`; modules group components, Zod schemas, actions, and services. Shared infrastructure belongs in `src/lib/`; reusable UI and layouts belong in `src/components/`.

Database schema, seed data, and migrations are in `prisma/`. The standalone embed script is `public/widget.js`; preserve its dependency-free, `fw-`-prefixed design. Product and architecture detail is in `docs/PRD.md`.

## Build, Test, and Development Commands

- `npm install` installs dependencies and generates the Prisma client via `postinstall`.
- `npm run dev` starts the local Next.js development server.
- `npm run lint` runs ESLint with Next.js Core Web Vitals and TypeScript rules.
- `npm run build` creates a production build; use it before submitting routing or server-side changes.
- `npm run start` serves the production build locally.
- `npx prisma migrate deploy` applies committed migrations; `npx tsx prisma/seed.ts` loads demo data.
- `node scripts/verify-widget.mjs` and `node scripts/verify-chat.mjs` provide focused checks for the embed widget and chat flow.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Match existing formatting: two-space indentation, semicolons, double-quoted strings, and Tailwind utilities in JSX. Use kebab-case filenames (`form-preview.tsx`), PascalCase component exports, and camelCase functions, variables, and hooks (`use-form-flow.ts`). Validate external inputs with Zod and enforce authorization in services, not only UI guards. Run `npm run lint` after changes.

## Testing Guidelines

There is no configured unit-test runner or coverage threshold. Add targeted coverage for non-trivial logic, near the feature or in `scripts/` for runtime integrations. Before a pull request, run lint, build, and relevant verification scripts; manually test changed public, dashboard, and embed paths.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, lower-case summaries such as `add rate-limit and update form` and `create chat system`. Keep each commit focused and describe the user-visible change. Pull requests should include a concise summary, linked issue or task when available, validation commands run, and screenshots or a short recording for UI, builder, or widget changes. Call out database migrations, required environment variables, and any changed API or embed contract explicitly.

## Security & Configuration

Never commit `.env`, secrets, database URLs, or auth credentials. Start from `.env.example`. For schema changes, commit the generated Prisma migration and review public API validation, rate limiting, and cross-origin behavior.
