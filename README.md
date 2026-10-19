# PRD & Task List — Interactive Form Builder with Chatbot Widget

> **Audience:** AI coding agent (and the human developer reviewing it).
> **Rule zero:** never claim something works unless you ran it. Mark anything you could not verify as `UNVERIFIED` in your report.

---

## 1. Product summary

A web app where a signed-in user (the **form owner**) builds forms, publishes them, and embeds a **floating chatbot widget** on any external website with one `<script>` tag. Website visitors answer the form one question at a time in a chat-style UI. Responses are stored in the database and shown to the owner in a dashboard.

**Context:** Software Engineer Intern assignment. Deliverable is a working MVP with clean code, responsive design, proper validation, a GitHub repo with README, and a deployed demo URL.

### Completion criteria (the only thing that really matters)
A user can: **sign up → create a form → add questions → publish → embed the widget on a separate test website → submit a response from that site → see the saved submission (with timestamp) in the dashboard.** If this end-to-end flow does not work, nothing else counts.

### Out of scope (do NOT build)
AI features, payments, subscriptions, advanced integrations, conditional logic, file-upload questions, CSV export, custom domains, analytics charts, team/roles, email verification, password reset, OAuth. If you think one is needed, stop and ask.

---

## 2. Tech stack (as actually installed — verify in `package.json`)

| Area | Choice | Notes |
|---|---|---|
| Framework | Next.js **16.x** (App Router, Turbopack), React, TypeScript | `params` / `searchParams` are **Promises**. `middleware.ts` is deprecated → use `src/proxy.ts` exporting `proxy`. |
| Styling | Tailwind CSS v4 + shadcn/ui (initialised; use its components for new UI) | Mobile-first. Semantic theme tokens (`bg-card`, `text-muted-foreground`, `bg-primary`) so light/dark both work; `next-themes` with `attribute="class"`. Toasts via `sonner` (`<Toaster />` in root layout). Do not add react-hook-form. Prefer `buttonVariants` on `<Link>` over `asChild`/`render` (these differ between Radix and Base UI flavours — check the generated `components/ui/*.tsx` before using either). |
| DB | PostgreSQL (hosted Prisma Postgres, pooled host) | |
| ORM | **Prisma 7.x** | See "Prisma 7 rules" below. |
| Auth | **Better Auth** (email + password, Prisma adapter) | Endpoints come from the catch-all route; do not hand-write auth endpoints. |
| Validation | Zod | At every boundary (server actions, route handlers). |
| Drag & drop | `@dnd-kit` | For question reordering. |
| Env | Windows dev machine (PowerShell / Git Bash) | Avoid bash-only commands in docs without a PowerShell equivalent. |

### Prisma 7 rules (these caused real bugs already)
- Generator is `provider = "prisma-client"` with `output = "../src/generated/prisma"`. The datasource block has **no `url`** — it lives in the Prisma config file (currently `prisma7.config.ts`; keep exactly one config file).
- **Never** `import ... from "@prisma/client"`. Import from `@/generated/prisma/client`.
- `PrismaClient` needs the driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. Use the `globalThis` singleton in `src/lib/prisma.ts`.
- `prisma migrate dev` does **not** run `generate` anymore. After any schema change run: `npx prisma migrate dev --name <name>` **then** `npx prisma generate`, then restart the dev server (`rm -rf .next` if stale).
- `.env` is not auto-loaded by the Prisma CLI → config file imports `dotenv/config`.
- `src/generated` is gitignored; `package.json` has `"postinstall": "prisma generate"` (required for Vercel).
- `prisma/seed.ts` runs under `tsx`, which does **not** resolve the `@/` alias → use relative imports there.

### Next.js 16 note
`cacheComponents` (Cache Components) is currently enabled in `next.config.ts`. Any component that reads session/`headers()` must sit inside `<Suspense>`. If it causes friction, **ask the developer** before disabling it; the MVP does not need it.

---

## 3. Architecture rules

### 3.1 Single Next.js project, module-based
No separate Express server. Business logic lives in services; route handlers and server actions are thin.

```
src/
├─ app/
│  ├─ (marketing)/page.tsx                 # landing
│  ├─ (auth)/login/page.tsx, signup/page.tsx
│  ├─ dashboard/
│  │  ├─ layout.tsx                        # guard + shell (inside <Suspense>)
│  │  ├─ page.tsx                          # stats + form list
│  │  └─ forms/[id]/
│  │     ├─ edit/page.tsx                  # form builder
│  │     └─ responses/page.tsx (+ [responseId]/page.tsx)
│  ├─ f/[slug]/page.tsx                    # public full-page chat form
│  ├─ embed/[slug]/page.tsx                # iframe content for the widget
│  └─ api/
│     ├─ auth/[...all]/route.ts            # Better Auth handler
│     └─ public/forms/[slug]/{route.ts, responses/route.ts}
├─ modules/{form,question,response,auth,chat}/
│  ├─ *.schema.ts   # Zod
│  ├─ *.service.ts  # Prisma + business rules + ownership checks
│  ├─ *.actions.ts  # "use server", thin
│  └─ components/
├─ components/ui/
├─ lib/ {prisma, auth, auth-client, session, errors, api, action}.ts
└─ proxy.ts
public/widget.js
prisma/{schema.prisma, seed.ts, migrations/}
```

### 3.2 Hard rules
1. **Auth ≠ authorization.** Better Auth answers "who are you". Every service function that touches owned data takes `ownerId` and scopes the query (`where: { id, ownerId }` or `form: { ownerId }`). Use `findFirst/updateMany/deleteMany` with `ownerId` in the same query so check and write are atomic.
2. Every server action starts with `const user = await requireUser()` and Zod-parses its input. Pages call `requireUserPage()`. **Layouts are not a security boundary** — pages and actions must check on their own. `proxy.ts` only checks cookie presence (UX redirect) and must **not** redirect away from `/login` (stale-cookie redirect loop).
3. Server actions return `ActionResult<T>` via `run()` from `lib/action.ts` (`{ ok: true, data } | { ok: false, error }`), never throw to the client.
4. Public routes (`/api/public/*`, `/embed/*`, `/f/*`) need no auth and must never leak `ownerId`, `status`, or internal ids beyond what the widget needs. Use `select`, not `include`.
5. Public POST must validate **again on the server** (required, email format, choice membership, yes/no, unknown question ids, form must be `PUBLISHED`). Client-side validation is UX only.
6. Public API responses use `withErrorHandler` from `lib/api.ts` and `AppError(status, message, details)`.
7. No `any`. No secrets in the repo. `.env.example` is committed (names only).
8. Do not change `schema.prisma` without telling the developer; schema changes require a migration.
9. No out-of-scope features. Small commits with clear messages.

---

## 4. Data model (see `prisma/schema.prisma` for the source of truth)

- **User / Session / Account / Verification** — Better Auth core models, mapped to lowercase tables (`@@map("user")` etc.). Password hash lives in `Account.password`, not `User`.
- **Form**: `id, slug (unique, 8-char base64url), title, description?, welcomeText, completionText, themeColor (#rrggbb), status (DRAFT|PUBLISHED), ownerId, createdAt, updatedAt`.
- **Question**: `id, formId, type (TEXT|EMAIL|CHOICE|YES_NO), label, options Json? (string[] for CHOICE), required, order`. Type is immutable after creation.
- **Response**: `id, formId, createdAt`.
- **Answer**: `id, responseId, questionId, value (string)`; unique `(responseId, questionId)`. YES_NO values are `"yes"`/`"no"`; CHOICE values must be one of `options`.

---

## 5. API contracts

### Public (CORS-enabled, unauthenticated)

`GET /api/public/forms/{slug}` → `200`
```json
{ "slug": "...", "title": "...", "description": null, "welcomeText": "...",
  "completionText": "...", "themeColor": "#4f46e5",
  "questions": [{ "id": "...", "type": "TEXT|EMAIL|CHOICE|YES_NO", "label": "...", "options": null, "required": true }] }
```
`404` if not found **or not published**.

`POST /api/public/forms/{slug}/responses` body `{ "answers": [{ "questionId": "...", "value": "..." }] }`
- `201 { ok: true, id }`
- `400` unknown question · `404` not found/unpublished · `422 { error, details: { [questionId]: message } }` · `429` rate limited (see T9)
- `OPTIONS` → `204` (CORS preflight).

### Auth (Better Auth, do not reimplement)
`POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`, `POST /api/auth/sign-out`, `GET /api/auth/get-session`. Cookie-bearing POSTs require an `Origin` header (CSRF protection) — browsers send it; curl/Postman must add it. Do **not** add wildcard CORS to `/api/auth/*`.

### Server actions (owner-side; not callable via curl/Postman)
- Forms: `createFormAction({title})`, `updateFormAction(id, {title?, description?, welcomeText?, completionText?, themeColor?})`, `deleteFormAction(id)`, `setFormStatusAction(id, "DRAFT"|"PUBLISHED")` (publish requires ≥ 1 question).
- Questions: `addQuestionAction(formId, input)`, `updateQuestionAction(id, {label?, required?, options?})`, `deleteQuestionAction(id)` (blocked for the last question of a published form), `reorderQuestionsAction(formId, orderedIds)` (must be an exact permutation of the form's question ids). Max 50 questions per form; CHOICE needs 2–10 unique options.
- Responses: `deleteResponseAction(id)`; reads via `listResponsesForOwner(formId, ownerId, page)` and `getResponseForOwner(id, ownerId)` called directly from server components (page size 20).

### Required `next.config.ts` headers
```ts
async headers() {
  return [
    { source: "/embed/:path*", headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }] },
    { source: "/api/public/:path*", headers: [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type" },
    ]},
  ];
}
```
`frame-ancestors *` lets any site embed any published form — acceptable for the MVP, **document it as a known limitation in the README** (a per-form allowed-domains list would be the production fix).

---

## 6. Current status

> Status was assembled from the developer's chat. "Verified" = the developer ran it and pasted the output. Everything else was written but **not confirmed to compile or run** — treat as `UNVERIFIED` until you run `npx tsc --noEmit` and test it.

**Verified**
- [x] Next.js + Prisma 7 + Better Auth wired up; DB tables exist (8 models).
- [x] Auth via curl: sign-up `200`, sign-in `200`, `get-session` returns user, wrong password `401`, duplicate email `422`, short password `400`.

**Written, UNVERIFIED**
- [ ] Sign-out with `Origin` header, then `get-session` → `null`.
- [ ] `lib/*` (prisma, errors, api, action, session), `proxy.ts` (the old `middleware.ts` may still exist — remove it).
- [ ] Public API routes (GET form, POST response, OPTIONS) and `prisma/seed.ts` (demo form slug `demo123`; unknown if seeded).
- [ ] `modules/form` (schema/service/actions), `modules/question` (schema/service/actions), `modules/response` (schema, submit service, owner queries, delete action).
- [ ] Auth UI (`AuthForm`, `/login`, `/signup`, `SignOutButton`), dashboard layout + page, `NewFormForm`, `FormRow`.
- [ ] `public/widget.js` loader (floating button + iframe → `/embed/{slug}`, mobile fullscreen, listens for `postMessage {type:"fw:close"}`, optional `data-color`).
- [ ] CORS / frame-ancestors headers in `next.config.ts`.
- [ ] Landing page components (`components/landing/{hero,features,how-it-works,demo-section,footer}.tsx`), `components/navbar.tsx`, `components/mode-toggle.tsx`, `(marketing)/layout.tsx` + `page.tsx`, theme provider. The demo section loads `/widget.js` with `NEXT_PUBLIC_DEMO_FORM_SLUG` and removes the injected DOM on unmount. The demo chat shows a 404 until T5 (`/embed/[slug]`) exists. Footer email/GitHub are placeholders to replace. Remove the default `src/app/page.tsx` if it still exists.

**Not started:** everything in section 7 from T3 onward.

---

## 7. Tasks (do in order; each has acceptance criteria)

### T1 — Stabilise what exists
- Run `npx tsc --noEmit` and `npm run lint`; fix errors without changing behavior.
- Run `npx @next/codemod@canary middleware-to-proxy .` if `middleware.ts` still exists; ensure only `proxy.ts` remains.
- Seed the demo form (add a few questions of each type) and run the public API checks below.
- **Accept:** typecheck clean; GET `/api/public/forms/demo123` returns questions without `ownerId`; POST with bad data returns `400/422`; POST valid returns `201` and rows appear in `Response`/`Answer`; setting the form to `DRAFT` makes both return `404`.

### T2 — Verify owner flows through the UI (no code unless broken)
- **Accept:** `/dashboard` redirects to `/login` when logged out; signup → dashboard; create / publish-blocked-without-questions / delete form work; logout works; **a second user cannot see or modify the first user's forms** (test with a second browser profile).

### T3 — Form builder UI: `/dashboard/forms/[id]/edit`
- Edit form settings: title, description, welcome text, completion text, theme color (color input, `#rrggbb`).
- Add question (type select; label; required toggle; options editor for CHOICE with add/remove, 2–10, unique), edit label/required/options, delete (confirm), **reorder** using accessible **Move up / Move down buttons first** (cheap, keyboard-friendly, satisfies the brief). Add `@dnd-kit` drag-and-drop only if time remains after T11. Optimistic UI with rollback on failure.
- **Preview**: renders the exact same chat component used by the embed (T5) in a panel, without saving responses (`previewMode` prop).
- Publish/unpublish toggle with the same server rule (≥ 1 question); show clear error messages from `ActionResult`.
- Show the public URL and the **embed snippet with a copy button** once published.
- **Accept:** all question operations persist after refresh; reorder persists; invalid input shows inline errors; editing a published form updates the live widget on next load.

### T4 — Responses UI
- `/dashboard/forms/[id]/responses`: table with submission time and one column per question (truncate long text), pagination (20/page), empty state, link to detail, delete with confirm.
- `/dashboard/forms/[id]/responses/[responseId]`: all answers in question order + timestamp.
- Format dates with an explicit locale + `timeZone` to avoid hydration mismatches.
- **Accept:** a response submitted from the widget appears here with the correct timestamp; another user's response id returns 404.

### T5 — Chat component + `/embed/[slug]` + `/f/[slug]`
Shared `modules/chat/` component used by embed, public page, and builder preview.
- Flow: welcome bubble → question 1 → …; **one question at a time**; user answers shown as right-aligned bubbles.
- TEXT/EMAIL: text input + send; CHOICE/YES_NO: answer **buttons**; optional questions get a "Skip" button.
- Client validation: required non-empty; email format; max length 2000. Show the error inline and keep the same question active.
- On finish: POST once (disable inputs, prevent double-submit). On `422`, map `details` to the question and return to it. On success show `completionText` and stop. Network error → retry button.
- Theme: `themeColor` via CSS variable; pick readable text color (compute contrast).
- Mobile: `100dvh` layout, input pinned at bottom, input font-size ≥ 16px (prevents iOS zoom), scroll to latest message, `aria-live="polite"` message list, visible focus states.
- `/embed/[slug]`: no site chrome, transparent/clean background, a close button that does `window.parent.postMessage({ type: "fw:close" }, "*")` (no sensitive data is sent).
- `/f/[slug]`: same chat, centered full page. Both pages call `notFound()` for unpublished/missing forms.
- Must work with **no cookies / no login**.
- Embed and public chat pages must **not** use dashboard theme tokens (`bg-background` etc.) — visitors' OS dark mode must not change the widget. Use fixed light colors + the form's `themeColor`.
- **Accept:** works on desktop and a 375px viewport; full submit flow stores a response; unpublished form shows a not-found page.

### T6 — Embed on a separate origin
- `public/widget.js` is the loader (floating button, iframe, fullscreen on ≤ 480px). Verify it against the `/embed` page; fix, don't rewrite from scratch.
- Create `test-site/index.html` (outside the Next app, served on a different port, e.g. `npx serve test-site -l 5000`) containing only the snippet:
  `<script src="http://localhost:3000/widget.js" data-form="demo123"></script>`
- **Accept:** from `localhost:5000` the bubble appears, opens the chat, submits successfully (CORS + frame-ancestors working), and the response shows in the dashboard. Also verify `data-color` override.

### T7 — Dashboard polish
- Stats (total forms, total responses — already implemented) correct after create/delete/submit.
- Loading states, empty states, error toasts, responsive layout, accessible buttons/labels.
- **Accept:** usable at 375px and 1280px; no layout overflow.

### T8 — Landing page `/`
Responsive: **Hero** (headline, description, CTA buttons → `/signup`, `/login`/demo), **Features**, **How it works** (create → publish → embed → collect), **Live chatbot demo** (load the app's own `widget.js` with `NEXT_PUBLIC_DEMO_FORM_SLUG`; the seed creates that demo form), **Footer** (navigation + contact links).
- **Accept:** all five sections present; demo widget works on the landing page; Lighthouse accessibility reasonable; no horizontal scroll on mobile.

### T9 — Abuse protection for the public POST
- Rate limit: e.g. 5 submissions / minute / IP / form → `429`. In-memory `Map` limiter is acceptable for the MVP; **document that it is per-instance on serverless** and not a hard guarantee.
- Reject bodies over a sane size; keep per-answer limit (2000) and answer-count limit (100).
- **Accept:** the 6th rapid POST returns `429`; normal use unaffected.

### T10 — Migrations, README, deploy
- `prisma/migrations/` is currently **empty** even though the DB has tables (created without migration history). Create a baseline migration and mark it applied (e.g. `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` into `prisma/migrations/0_init/migration.sql`, then `prisma migrate resolve --applied 0_init`; **check the current CLI flags** for Prisma 7). Deploys use `prisma migrate deploy`, never `migrate dev`.
- `README.md`: overview, features, stack, **setup steps (clone, install, env, migrate, seed, run)**, env var table, how to create/publish/embed, API contract summary, known limitations (open `frame-ancestors`, in-memory rate limit, no email verification), screenshots.
- `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_DEMO_FORM_SLUG`.
- Deploy to Vercel; set `BETTER_AUTH_URL` to the deployed URL; ensure `postinstall` generates the client; update `data-form` snippet host.
- **Accept:** fresh clone follows the README and runs; deployed URL passes the completion criteria; the embed snippet works from a different origin against the deployed app.

### T11 — Final QA (run and report each line)
1. Fresh signup → create form → add 1 of each question type (incl. required + optional) → reorder → preview → publish.
2. Copy snippet → paste into `test-site` → submit on desktop and mobile viewport.
3. Validation: required skipped, bad email, invalid choice (via direct curl) → rejected server-side.
4. Dashboard shows the response with timestamp; detail page correct.
5. Unpublish → widget/`/f/slug`/API return not found; republish restores.
6. Second user cannot read/modify/delete the first user's forms, questions, or responses (try crafted ids in server actions via the UI and direct service calls).
7. `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.

---

## 8. Security checklist (review before finishing)
- [ ] Every owner-side query is scoped by `ownerId`.
- [ ] Every server action calls `requireUser()` and Zod-parses input.
- [ ] Public endpoints never expose `ownerId`/internal fields; draft forms are invisible.
- [ ] `themeColor` validated as `#rrggbb` before it is used in styles.
- [ ] No wildcard CORS on `/api/auth/*`.
- [ ] No secrets committed; `.env` ignored.
- [ ] Rate limit on public POST.
- [ ] User-supplied text (labels, answers) rendered as text, never as HTML.

## 9. Reporting format (when you finish a task)
For each task: what changed (files), how you verified it (command/output), what is `UNVERIFIED`, and any deviation from this document. If something in this PRD conflicts with reality, say so instead of silently working around it.

## 10. Open questions for the developer
- Keep or disable Cache Components?
- Is the hosted DB the final deployment DB, or will a separate production DB be used?
- ~~Deadline?~~ **Monday 26 October 2026** (answered). See section 11 for the schedule and cut order.

---

## 11. Schedule (deadline: Monday 26 Oct 2026; today = Mon 19 Oct)

Order is driven by risk: the cross-origin embed is the part most likely to go wrong, so it is built and deployed **before** the large builder UI.

| Day | Date | Goal | Tasks |
|---|---|---|---|
| 1 | Mon 19 | Everything existing compiles and is verified | T1, T2 (+ finish sign-out check, remove `middleware.ts`, seed demo form with all 4 question types) |
| 2 | Tue 20 | Chat experience | T5 (shared chat component, `/embed/[slug]`, `/f/[slug]`) |
| 3 | Wed 21 | Embed works across origins, **deployed** | T6; first Vercel deploy (set `BETTER_AUTH_URL`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_DEMO_FORM_SLUG`); verify the snippet from a different origin against the deployed URL |
| 4 | Thu 22 | Form builder (core) | T3 without preview/polish: settings, add/edit/delete questions, required, Move up/down, publish, snippet + copy |
| 5 | Fri 23 | Builder preview + responses | T3 preview (reuse chat component, `previewMode`), T4 responses list + detail |
| 6 | Sat 24 | Hardening and landing | T9 rate limit, T8 landing (code already written; wire up and review), T7 polish |
| 7 | Sun 25 | Release | T10 (baseline migration, README, `.env.example`), T11 full QA on the **deployed** app, fix bugs |
| 8 | Mon 26 | Buffer / submission | No new features. Only fixes and submitting links |

### Cut order if behind (cut from the top)
1. `@dnd-kit` drag-and-drop (already deferred; Move up/down stays).
2. T7 polish (animations, skeletons, extra empty states).
3. Delete-response feature and pagination polish (keep list + detail).
4. Landing page extras beyond the five required sections.

### Never cut
Server-side validation, ownership checks on every owner-side query, publish/unpublish rule, the cross-origin embed working on the deployed app, README with setup instructions, the end-to-end completion test.

### Working method for the agent
One task per session; commit after each task with a clear message; run `npx tsc --noEmit` and `npm run lint` before reporting; report `UNVERIFIED` items explicitly. Deploy early and re-run the completion test after every deploy, not only at the end.