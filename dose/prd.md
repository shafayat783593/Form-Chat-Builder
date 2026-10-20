# PRD — FormChat (Interactive Form Builder with Chatbot Widget)

> **Audience:** AI coding agent + the human developer reviewing it.
> **Rule zero:** never claim something works unless you ran it. Anything you could not run is reported as `UNVERIFIED`.
> **File location:** this file currently lives at `dose/prd.md`; **T1** moves it to `docs/PRD.md`. The repo's `README.md` is a *human* README (see T1/T17), not this file.

---

## 1. Product

> **This section describes the TARGET product, not what is shipped.** Section 1.4 lists what
> actually exists in the repo today and what is still missing. Rule zero applies to every claim
> here: anything not marked `VERIFIED` in 1.4 is a plan, never a working feature.

A SaaS web app where a signed-in **Owner** builds a conversational form (a chat, one question at a time), publishes it, and embeds it on any website with one `<script>` tag as a floating chat widget. Visitors answer inside the widget; responses are stored with timestamps and shown in the owner's dashboard.

An **Admin** (platform operator) creates **form templates**. Owners start a new form either blank or from a template, then customize it in a 3-panel builder.

Reference for the builder UX: formbuilder.com (3-panel layout, top bar, Form Settings tabs). Reference for template URLs: `/templates/course-enrollment`. Do not copy their branding, copy or assets.

App name **FormChat** is a working name only — the final name, logo, footer email and GitHub link are still open (§13).

### 1.1 Completion criterion (the only thing that really matters)
**Sign up → create form (blank or from template) → customize → publish → embed on a separate test site → submit → see the saved submission with timestamp in the dashboard.** If this flow is broken, nothing else counts.

### 1.2 Out of scope (do NOT build; ask first)
AI features, payments/billing/subscriptions, workspaces/team invites, OAuth, email verification, password reset, conditional logic, file-upload questions, CSV export, custom domains, analytics charts, webhooks, i18n.

### 1.3 Decisions already made
| Decision | Value |
|---|---|
| Deadline | Not a constraint right now. Work in the order of section 11; do not start a later phase before the earlier one passes its acceptance tests. |
| Tenancy | One user = one set of forms (`Form.ownerId`). **No Workspace model.** If workspaces are wanted later, it is a migration + rewrite of every `ownerId` check, so ask before changing. |
| Roles | Exactly two: `ADMIN`, `OWNER`. Everyone who signs up is `OWNER`. Admin is created only by script (T6), never via the UI/API. |
| Builder layout | Left = field palette, Center = form fields (canvas), Right = Form Settings. (This mirrors the reference screenshot. It is one CSS/grid constant; swapping sides is trivial.) |
| Save model | Explicit **Save** button (single `saveFormAction`), not per-keystroke autosave. |
| Reordering | Move up / Move down buttons first; drag-and-drop (`@dnd-kit`) only after the core builder ships — it is scheduled in **Phase 4 (T16)**, not Phase 2. |
| Product surface vs. reference | The reference site is a UI reference only. Do not copy its branding, copy, assets, routes, or pricing language. |

### 1.4 What exists today (verified 2026-10-20)

**Working today**

| Area | State |
|---|---|
| Auth | Better Auth email+password: sign up, log in, log out, session-guarded `/dashboard`. |
| Dashboard | Stats (total forms / published / responses / drafts), form list, create form, publish/unpublish, delete. |
| Server layer | `form`, `question`, `response` services + Zod schemas, owner-scoped queries, `ActionResult`/`run()` wrapper, `requireUser()`/`requireUserPage()`. |
| Public API | `GET /api/public/forms/{slug}` and `POST /api/public/forms/{slug}/responses` with server-side re-validation (400 / 404 / 422). |
| Schema | `User` (with `role`), `Form`, `Question`, `Response`, `Answer` + `Role`, `FormStatus`, `QuestionType`, `WidgetPosition` enums; migrations `20261018175311_init`, `20261020120000_add_roles_templates`, `20261020130000_welcome_text_default`. |
| Roles | `Role` enum + `User.role` + `requireAdmin()`/`requireAdminPage()`; `scripts/make-admin.ts`; `/admin/*` guarded (non-admin → `notFound()`); dashboard reads the real role from the session. |
| Marketing page | Hero, Features, How it works, Demo section. |

**Not built yet** (each row has a task in §11)

| Missing | Task |
|---|---|
| Builder UI `/dashboard/forms/[id]/edit` (palette, canvas, settings tabs) | T8 |
| Chat module, `/f/[slug]`, `/embed/[slug]` | T4 |
| `public/widget.js`, `test-site/`, CORS + `frame-ancestors *` headers | T5 |
| Responses pages `/dashboard/forms/[id]/responses` | T11 |
| Templates (schema fields, module, `/templates`, `/admin/templates`) | T7, T10 |
| Rate limiting on the public POST | T14 |
| Repo hygiene: `docs/PRD.md`, human `README.md`, `.env.example`, `cookies.txt` removal, `src/proxy.ts` | T1 |

**Broken today** (dead links / lies in the UI — fix in the phase that builds the target)

- `src/modules/form/components/form-row.tsx:58` — "View" links to `/f/{slug}`, which does not exist → 404 until T4.
- `src/modules/public/home/demo-section.tsx:12` — loads `/widget.js`, which does not exist → the landing-page demo is dead until T5.
- `src/modules/question/question.action.ts:11` — `editPath()` revalidates `/dashboard/forms/{id}/edit`, which does not exist → until T8.
- `src/app/dashboard/layout.tsx:8` — hardcodes `role="ADMIN"`, and `src/modules/dashboard/ui/types.ts:1` still declares `"ADMIN" | "INSTRUCTOR" | "STUDENT"`. There is **no role in the database yet**; T6 replaces this with the real `ADMIN | OWNER` model.
- `next.config.ts` has **no `headers()`** — no `Access-Control-Allow-Origin` on `/api/public/*` and no `frame-ancestors *` on `/embed/*`, so cross-origin use is blocked until T5.
- `prisma/seed.ts` builds `new PrismaClient()` without the `PrismaPg` adapter and imports from `@prisma/client/extension` instead of the generated client — violates the Prisma 7 rules in §3.

---

## 2. Roles and permissions

| Capability | Anonymous | OWNER | ADMIN |
|---|---|---|---|
| View landing, `/templates`, `/templates/[slug]` (published templates, read-only) | ✅ | ✅ | ✅ |
| Open `/f/[slug]`, `/embed/[slug]`, public API (published, non-template forms) | ✅ | ✅ | ✅ |
| Sign up / log in | ✅ | — | — |
| Create/edit/delete/publish **own** forms; see **own** responses | ❌ | ✅ | ✅ (own only) |
| Create a form from a published template | ❌ | ✅ | ✅ |
| Create/edit/delete/publish **templates** (`/admin/templates`) | ❌ | ❌ (403/redirect) | ✅ |
| See other users' forms or responses | ❌ | ❌ | ❌ (admin is not a super-reader) |

Authorization is checked **in the service layer**, never only in UI or layout.

---

## 3. Tech stack (verify against `package.json`)

| Area | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.x App Router, Turbopack, React, TypeScript | `params`/`searchParams` are Promises. `middleware.ts` is deprecated → `src/proxy.ts` exporting `proxy`. Remove `src/middleware.ts`. |
| Cache Components | Enabled in `next.config.ts` | Anything reading session/`headers()` must be inside `<Suspense>`. If it causes friction, **ask** before disabling. |
| UI | Tailwind v4 + shadcn/ui (Base UI flavour), `next-themes`, `sonner`, `lucide-react` | Use semantic tokens (`bg-card`, `text-muted-foreground`, `bg-primary`). Use `buttonVariants` on `<Link>`; avoid `asChild`/`render` unless the generated `components/ui/*` confirms support. Add shadcn components as needed (`dialog`, `sheet`, `accordion`, `popover`, `tooltip`, `scroll-area`). |
| DB | PostgreSQL (hosted Prisma Postgres, pooled host) | |
| ORM | Prisma **7.x** | Rules below. |
| Auth | Better Auth (email+password, Prisma adapter, `nextCookies()`) | Endpoints come from the catch-all route; never hand-write auth endpoints. |
| Validation | Zod | Every boundary (actions, route handlers). Share schemas between client and server. |
| Email (Phase 3 only) | Resend | Only for the response-notification feature. |
| Dev OS | Windows (PowerShell / Git Bash) | Give a PowerShell equivalent for any bash-only command in docs. |

### Prisma 7 rules (these caused real bugs)
- Generator `provider = "prisma-client"`, `output = "../src/generated/prisma"`. Datasource block has **no `url`** (it lives in `prisma7.config.ts`; keep exactly one config file).
- Import from `@/generated/prisma/client`, **never** `@prisma/client`.
- `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })` in the `globalThis` singleton `src/lib/prisma.ts`.
- `prisma migrate dev` does **not** run `generate`. After each schema change: `npx prisma migrate dev --name <name>` → `npx prisma generate` → restart dev server (delete `.next` if stale).
- Config imports `dotenv/config`. `src/generated` is gitignored; `package.json` has `"postinstall": "prisma generate"`.
- `prisma/seed.ts` and `scripts/*.ts` run under `tsx`: **relative imports only** (no `@/`).
- Production uses `prisma migrate deploy`, never `migrate dev`.

---

## 4. Prisma schema (target state — source of truth is `prisma/schema.prisma`)

`Session`, `Account`, `Verification` stay exactly as they are today. Changed/added parts:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role           { ADMIN OWNER }
enum FormStatus     { DRAFT PUBLISHED }
enum QuestionType   { TEXT EMAIL CHOICE YES_NO }
enum WidgetPosition { RIGHT LEFT }

model User {
  id            String   @id
  name          String
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  role          Role     @default(OWNER)          // NEW
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  sessions      Session[]
  accounts      Account[]
  forms         Form[]                              // NEW (if not already present)

  @@map("user")
}

model Form {
  id               String         @id @default(cuid())
  slug             String         @unique            // 8-char base64url, used in /f/ and /embed/ and the public API
  title            String
  description      String?
  welcomeText      String         @default("Hi! Mind answering a few quick questions?")
  completionText   String         @default("Thanks! Your response has been recorded.")
  themeColor       String         @default("#4f46e5") // validated #rrggbb
  launcherLabel    String         @default("Chat with us")   // NEW (Style tab)
  widgetPosition   WidgetPosition @default(RIGHT)           // NEW (Style tab)
  status           FormStatus     @default(DRAFT)
  publishedAt      DateTime?                                // NEW
  notifyOnResponse Boolean        @default(false)           // NEW (Notifications tab, Phase 3)
  notifyEmails     String[]                                 // NEW (max 5)

  // Templates (created by ADMIN only)
  isTemplate       Boolean        @default(false)           // NEW
  templateSlug     String?        @unique                   // NEW  e.g. "course-enrollment" (readable, public URL)
  templateCategory String?                                  // NEW  e.g. "Education"
  sourceTemplateId String?                                  // NEW  which template this form was copied from
  sourceTemplate   Form?          @relation("TemplateCopies", fields: [sourceTemplateId], references: [id], onDelete: SetNull)
  copies           Form[]         @relation("TemplateCopies")

  ownerId          String
  owner            User           @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  questions        Question[]
  responses        Response[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([ownerId, createdAt])
  @@index([isTemplate, status])
}

model Question {
  id         String       @id @default(cuid())
  formId     String
  form       Form         @relation(fields: [formId], references: [id], onDelete: Cascade)
  type       QuestionType                          // immutable after creation
  label      String
  options    Json?                                 // string[] for CHOICE (2–10 unique), null otherwise
  required   Boolean      @default(true)
  order      Int
  prefillKey String?                               // NEW (Prefill tab, Phase 3): URL param name, e.g. "email"
  answers    Answer[]

  @@index([formId, order])
}

model Response {
  id        String   @id @default(cuid())
  formId    String
  form      Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  sourceUrl String?                                 // NEW: origin of the embedding page (Referer origin only, never full URL/query)
  createdAt DateTime @default(now())
  answers   Answer[]

  @@index([formId, createdAt])
}

model Answer {
  id         String   @id @default(cuid())
  responseId String
  response   Response @relation(fields: [responseId], references: [id], onDelete: Cascade)
  questionId String
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  value      String                                  // YES_NO: "yes"|"no"; CHOICE: must be in options

  @@unique([responseId, questionId])
}
```

Migration: `npx prisma migrate dev --name add_roles_templates && npx prisma generate`. Existing rows get `role=OWNER`, `isTemplate=false` via defaults.

**Better Auth must know about `role`** so it appears on `session.user`:
```ts
// src/lib/auth.ts
user: { additionalFields: { role: { type: "string", defaultValue: "OWNER", input: false } } }
```
`input: false` prevents a client from sending `role: "ADMIN"` at sign-up. **UNVERIFIED** until tested: sign up with curl including `"role":"ADMIN"` and confirm the DB row is `OWNER`. If the enum type conflicts with Better Auth, fall back to `role String @default("OWNER")` and validate with Zod in `requireAdmin()`.

**Invariants (enforce in services, covered by tests in T14):**
1. A `Form` with `isTemplate=true` is never returned by `/api/public/forms/*`, `/f/*`, `/embed/*`, and never accepts responses.
2. A template is owned by an ADMIN; only ADMIN may mutate it. A non-template form is mutated only by its `ownerId`.
3. `templateSlug` is non-null iff `isTemplate=true`.
4. Questions of a form have contiguous `order` 0..n-1 after every save.
5. `sourceTemplateId` is informational only; copies never change when the template changes.

---

## 5. Architecture

### 5.1 Folder structure (matches the current repo; add the NEW parts)
```
src/
├─ proxy.ts                                  # replaces middleware.ts (cookie-presence redirect for /dashboard and /admin only)
├─ app/
│  ├─ (public)/
│  │  ├─ (marketing)/{layout.tsx, page.tsx}  # landing
│  │  ├─ (marketing)/templates/page.tsx            # NEW public gallery
│  │  ├─ (marketing)/templates/[slug]/page.tsx     # NEW public read-only preview + "Use this template"
│  │  └─ (auth)/{layout.tsx, login/page.tsx, signup/page.tsx}
│  ├─ dashboard/
│  │  ├─ layout.tsx (exists)  page.tsx
│  │  └─ forms/[id]/{edit/page.tsx, responses/page.tsx, responses/[responseId]/page.tsx}
│  ├─ admin/                                 # NEW
│  │  ├─ layout.tsx
│  │  └─ templates/{page.tsx, [id]/edit/page.tsx}
│  ├─ f/[slug]/page.tsx                      # NEW public full-page chat
│  ├─ embed/[slug]/page.tsx                  # NEW iframe content for the widget
│  └─ api/{auth/[...all]/route.ts, public/forms/[slug]/{route.ts, responses/route.ts}}
├─ modules/
│  ├─ auth/  form/  question/  response/     # exist
│  ├─ template/   {template.service.ts, template.actions.ts, template.schema.ts}   # NEW
│  ├─ builder/    # NEW (shared by dashboard edit + admin template edit)
│  │   └─ components/{builder-shell, top-bar, field-palette, question-canvas, question-card,
│  │        options-editor, settings-panel, tabs/{general,style,notifications,prefill}-tab, preview-sheet}
│  │   └─ use-builder-state.ts               # useReducer + dirty tracking
│  ├─ chat/       # NEW shared chat component (embed, /f, builder preview)
│  └─ public/home/{hero,features,how-it-works,templates-strip,demo-section,faq,cta}.tsx
├─ lib/{prisma,auth,auth-client,session,errors,api,action,limits,rate-limit,slug}.ts
public/widget.js                              # NEW (missing today)
test-site/index.html                          # NEW (outside the app, other port)
scripts/make-admin.ts                         # NEW
prisma/{schema.prisma, seed.ts, migrations/}
```

### 5.2 Hard rules
1. **Auth ≠ authorization.** Every service function touching owned data takes the acting user and scopes the query in the same statement (`findFirst/updateMany/deleteMany` with `ownerId`). Check-then-write in two statements is not acceptable.
2. Every server action: `const user = await requireUser()` (or `requireAdmin()`), then Zod-parse input, then call a service. Pages call `requireUserPage()` / `requireAdminPage()`. **Layouts are not a security boundary.** `proxy.ts` only checks cookie presence and must not redirect away from `/login`.
3. Server actions return `ActionResult<T>` via `run()` (`{ok:true,data}|{ok:false,error,fieldErrors?}`), never throw to the client.
4. Public routes never leak `ownerId`, `status`, `isTemplate`, `notifyEmails`, or internal ids beyond what the widget needs. Use `select`, not `include`.
5. Public POST re-validates everything server-side. Client validation is UX only.
6. `src/lib/limits.ts` holds constants, enforced server-side: `MAX_FORMS_PER_USER=20`, `MAX_QUESTIONS_PER_FORM=50`, `MAX_OPTIONS=10`, `MAX_LABEL=200`, `MAX_ANSWER=2000`, `MAX_NOTIFY_EMAILS=5`.
7. No `any`. No secrets in repo. `.env.example` committed (names only). User text is rendered as text, never HTML.
8. Schema changes need a migration and a note to the developer. No out-of-scope features. Small commits.

### 5.3 Env vars
| Name | Used for |
|---|---|
| `DATABASE_URL` | Prisma (pooled) |
| `BETTER_AUTH_SECRET` | Better Auth |
| `BETTER_AUTH_URL` | Base URL (localhost in dev, Vercel URL in prod) |
| `NEXT_PUBLIC_APP_URL` | Used to build the embed snippet/public URLs |
| `NEXT_PUBLIC_DEMO_FORM_SLUG` | Landing page live demo |
| `ADMIN_EMAIL` | Read by `scripts/make-admin.ts` (optional; CLI arg also accepted) |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | Phase 3 only |

---

## 6. How a form is created (end-to-end behavior)

### 6.1 Owner: "Create new form"
1. Dashboard header has a primary **Create new form** button (also shown in the empty state).
2. It opens a dialog with two tabs: **Blank** (title input) and **From template** (grid of published templates: title, category, question count, "Preview" link to `/templates/[slug]`).
3. Submit → `createFormAction({ title, templateId? })`:
   - Enforce `MAX_FORMS_PER_USER`.
   - Blank: create `Form` (DRAFT, defaults) with **zero** questions.
   - Template: in **one transaction** load the template (`isTemplate=true AND status=PUBLISHED`, else 404), create a new `Form` (new unique `slug`, `isTemplate=false`, `templateSlug=null`, `status=DRAFT`, `ownerId=user.id`, `sourceTemplateId=template.id`, copy all text/style fields, `notifyEmails=[]`), then `createMany` its questions with **new ids** preserving `order`, `type`, `label`, `options`, `required`, `prefillKey`.
   - Redirect to `/dashboard/forms/{id}/edit`.
4. Generate `slug` with `crypto.randomBytes(6).toString("base64url")`; retry on unique collision (max 3).

### 6.2 Builder (`/dashboard/forms/[id]/edit`, and `/admin/templates/[id]/edit` for admins)
One shared `BuilderShell`; the page decides `mode: "form" | "template"` and passes it down. The service re-checks ownership/role regardless.

**Top bar (sticky):** `[← Dashboard]` · site name (FormChat) · editable form title (inline input, max 120) · status badge (`Draft` / `Published`, plus `Unsaved changes` dot when dirty) · **Settings** (on mobile opens the settings sheet; on desktop focuses the right panel) · **Preview** · **Save** (disabled unless dirty; shows spinner; success toast) · **Publish / Unpublish**.
- Publish = save (if dirty) then `setFormStatusAction`. Requires ≥ 1 question; show the error inline, not a silent failure.
- After publish, show a dialog/popover with public URL (`/f/{slug}`) and the embed snippet with **Copy** buttons.
- Warn on `beforeunload` and route change when dirty.

**Left panel — Field palette:** four cards: *Short text*, *Email*, *Multiple choice*, *Yes / No*. Click = append a new question with defaults and select it. (Drag from palette is Phase 2.)

**Center panel — Canvas:** vertical list of question cards (order = array order). Each card: type icon, inline-editable label, **Required** switch, for CHOICE an options editor (add/remove/edit; 2–10; unique; non-empty), buttons *Move up*, *Move down*, *Duplicate*, *Delete* (confirm dialog; if the form already has responses, the dialog says answers to this question will be deleted). Selected card has a visible ring. Empty state: "Add your first field from the left." Above the list: a read-only "Welcome message" bubble and below it a "Completion message" bubble, both clickable to focus the matching input in General.

**Right panel — Form Settings (tabs):**
- **General:** title, description, welcome text, completion text. Character limits + counters.
- **Style:** `themeColor` (color input + 8 preset swatches; must be `#rrggbb`), `launcherLabel` (max 30), `widgetPosition` (Right/Left). Live mini-preview of the launcher bubble.
- **Notifications** *(Phase 3)*: switch "Email me on new response" + up to 5 emails. Until T15 ships, render the tab **disabled with "Coming soon"** — do not store settings that nothing acts on.
- **Prefill** *(Phase 3)*: table of questions with an optional `prefillKey` input (`^[a-z][a-z0-9_]{0,29}$`, unique per form) + help text showing `https://app/f/{slug}?{key}=value`. Until T16 ships, "Coming soon".

**Mobile (<1024px):** one panel at a time via a bottom segmented control: *Fields* | *Form* | *Settings*. Top bar collapses: title + Save + overflow menu (Publish, Preview, Settings).

**Preview:** opens the shared `<Chat previewMode />` in a side sheet using the **unsaved** local state; nothing is written to the DB.

**State:** `useReducer` in `use-builder-state.ts`. Actions: `addQuestion`, `updateQuestion`, `removeQuestion`, `moveQuestion`, `duplicateQuestion`, `updateSettings`, `markSaved(serverForm)`. New questions get a `clientId` (uuid) until saved. `dirty` = deep-compare against the last server snapshot.

### 6.3 `saveFormAction` (the only write path for builder content)
Input:
```ts
{
  formId: string,
  expectedUpdatedAt: string,            // optimistic concurrency
  settings: { title, description?, welcomeText, completionText, themeColor,
              launcherLabel, widgetPosition, notifyOnResponse, notifyEmails },
  questions: Array<{ id?: string, type, label, options?: string[], required, prefillKey? }>  // array index = order
}
```
Service behavior, all in **one transaction**:
1. Load form with `where: { id, ...(isTemplate ? admin-only : { ownerId }) }`; not found → 404 (never 403, to avoid leaking existence).
2. If `form.updatedAt` ≠ `expectedUpdatedAt` → `409` ("This form changed in another tab. Reload.").
3. Validate: counts ≤ limits; CHOICE options 2–10 unique non-empty; non-CHOICE `options` must be null; `prefillKey` unique among questions; every provided `id` **belongs to this form** (else 400, never create-by-id).
4. A question's `type` cannot change (id exists and type differs → 422).
5. Delete questions that exist in DB but are absent from the payload; update the rest; create those without `id`; set `order = index`.
6. If the form is PUBLISHED, the result must still have ≥ 1 question.
7. Update form fields; return the fresh form + questions with real ids so the client can remap `clientId → id`.

### 6.4 Other owner actions
`createFormAction`, `deleteFormAction(id)` (confirm dialog; cascades), `setFormStatusAction(id, status)`, `deleteResponseAction(id)`. All scoped by `ownerId`.

### 6.5 Admin template actions (all call `requireAdmin()`)
- `createTemplateAction({ title, templateSlug, category })`: `templateSlug` matches `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–60 chars, unique (409 on conflict). Creates a Form with `isTemplate=true`, owner = the admin, DRAFT.
- Edit with the same builder + `saveFormAction`.
- `setFormStatusAction` on a template: PUBLISHED means "visible in the gallery and usable by owners", still **not** reachable through `/f`, `/embed` or the public API. Requires ≥ 1 question.
- `deleteTemplateAction(id)`: forms already copied from it keep working (`sourceTemplateId` → null).
- `/admin/templates` list: title, category, slug, status, question count, "copies used" count, Edit / Preview / Delete.

---

## 7. API contracts

### 7.1 Public (CORS `*`, unauthenticated)
`GET /api/public/forms/{slug}` → `200`
```json
{ "slug":"…","title":"…","description":null,"welcomeText":"…","completionText":"…",
  "themeColor":"#4f46e5","launcherLabel":"Chat with us","widgetPosition":"RIGHT",
  "questions":[{"id":"…","type":"TEXT|EMAIL|CHOICE|YES_NO","label":"…","options":null,"required":true,"prefillKey":null}] }
```
`404` if missing, unpublished, **or a template**. Query: `where: { slug, status: "PUBLISHED", isTemplate: false }`.

`POST /api/public/forms/{slug}/responses` body `{ "answers":[{"questionId":"…","value":"…"}], "sourceUrl"?: "https://…" }`
- `201 { ok:true, id }` · `400` unknown/duplicate question id, bad body, body too large · `404` not found/unpublished/template · `422 { error, details:{[questionId]:message} }` · `429` rate limited · `OPTIONS` → `204`.
- Validation: every `required` question answered; EMAIL matches a sane regex and ≤ 254 chars; CHOICE value ∈ options; YES_NO ∈ {"yes","no"}; TEXT trimmed, ≤ 2000; ≤ 100 answers; body ≤ 32 KB. `sourceUrl`: store only `new URL(x).origin`, ignore if invalid.
- Create `Response` + `Answer`s in one transaction.

### 7.2 Auth (Better Auth — do not reimplement)
`POST /api/auth/sign-up/email`, `sign-in/email`, `sign-out`, `GET get-session`. POSTs with cookies need an `Origin` header (curl/Postman must add it). No wildcard CORS on `/api/auth/*`.

### 7.3 Required `next.config.ts` headers
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
`frame-ancestors *` lets any site embed any published form. Acceptable for the MVP; **document it as a known limitation** (production fix: per-form allowed-domains list, enforced with a header set from the DB).

### 7.4 Embed snippet (what the owner copies)
```html
<script src="{NEXT_PUBLIC_APP_URL}/widget.js" data-form="{slug}"></script>
```
Optional attributes: `data-color` (overrides `themeColor`), `data-position` (`left|right`, overrides the form's `widgetPosition`). Phase 3: `data-prefill='{"email":"a@b.com"}'`.

`public/widget.js` requirements: plain JS, no dependencies, idempotent (a second include does nothing), fetches the public API for `themeColor`/`launcherLabel`/`widgetPosition`, renders a floating button (z-index high, `aria-label`, keyboard-focusable), opens an iframe to `/embed/{slug}`, fullscreen at ≤ 480px, closes on Esc and on `postMessage {type:"fw:close"}` (verify `event.origin` equals the app origin), never touches host-page styles outside its own elements (prefix every class/id with `fw-`).

---

## 8. Chat experience (`modules/chat`, shared by `/embed`, `/f`, builder preview)

- Flow: welcome bubble → Q1 → … → completion. **One question at a time.** Visitor answers appear as right-aligned bubbles; a short typing indicator before each bot message (≤ 600 ms, respect `prefers-reduced-motion`).
- Inputs: TEXT/EMAIL = text input + Send. CHOICE/YES_NO = buttons. Optional questions get **Skip**. Enter sends; Shift+Enter is not needed (single-line).
- Client validation mirrors the server: required non-empty, email format, ≤ 2000 chars. Error shown inline under the input; same question stays active; focus returns to the input.
- Finish: POST once, disable inputs, no double submit. `422` → map `details` to the question and jump back to it. Network error → "Retry" button with answers kept in memory. Success → show `completionText`, no further input.
- `previewMode` prop: identical UI, but never calls the API; shows a "Preview — responses are not saved" strip.
- Theme: `themeColor` via a CSS variable; text color on it chosen by contrast (WCAG luminance). **Do not use dashboard theme tokens** (`bg-background` etc.) in embed/public chat pages — visitor OS dark mode must not alter the widget. Fixed light palette + `themeColor`.
- Mobile: `100dvh`, input pinned bottom, input font-size ≥ 16px (prevents iOS zoom), auto-scroll to latest message, message list has `aria-live="polite"`, visible focus rings.
- `/embed/[slug]`: no site chrome, transparent/clean background, close button → `window.parent.postMessage({type:"fw:close"}, "*")` (no data inside). `/f/[slug]`: same chat centered on a plain page. Both call `notFound()` for missing/unpublished/template forms. Must work with **no cookies / no login**.
- Prefill (Phase 3): for questions with `prefillKey`, if a query param with that key exists, pre-answer it **after running the same validation**; invalid prefills are ignored (question is asked normally).

---

## 9. Pages

### 9.1 Landing `/` (public, responsive, light/dark)
Navbar (sticky): logo · Features · How it works · Templates · Demo · theme toggle · **Log in** / **Sign up** (shows **Dashboard** when signed in; the session check lives in its own `<Suspense>` component).

1. **Hero** — H1 (suggested): "Turn your forms into conversations." Sub: "Build a chat-style form, publish it, and add it to any website with one line of code." CTAs: **Get started free** → `/signup`; **See live demo** → `#demo`. Right side: a static, non-interactive chat mock built from the same chat bubbles.
2. **Features** (6 cards, icon + title + one line): Chat-style forms (one question at a time) · 4 question types · Templates to start fast · One-line embed · Customize colors & text · Responses dashboard with timestamps.
3. **How it works** (4 steps): Create (blank or template) → Customize → Publish → Embed & collect.
4. **Templates strip**: up to 6 published templates from the DB (title, category, question count) → `/templates/[slug]`; "Browse all templates" → `/templates`. Hide the section if there are none.
5. **Live demo** (`id="demo"`): loads the app's own `/widget.js` with `NEXT_PUBLIC_DEMO_FORM_SLUG`; must **remove the injected DOM on unmount**. Caption explains it is a real form and that demo responses are stored.
6. **FAQ** (accordion, 5–6 items): How do I add it to my site? · Is it free? ("Free during beta" — no pricing table, no billing) · What question types exist? · Can I change the colors? · Where do I see responses? · Is my visitors' data safe? (state only what is actually implemented).
7. **Final CTA** band → `/signup`.
8. **Footer**: product links, Log in / Sign up, GitHub link, contact email (replace placeholders), © line.

**Do not fabricate** customer logos, testimonials, ratings or user counts. Use only claims that are true of the product.
Accessibility: one `<h1>`, landmark elements, skip link, color contrast AA, no horizontal scroll at 375px.

### 9.2 `/templates` and `/templates/[slug]` (public)
Gallery of published templates (search/filter by category is optional). Detail page: title, category, description, read-only list of questions rendered as a static preview (and a button to open the chat preview), primary CTA **Use this template** → if signed out go to `/signup?next=/dashboard?template={slug}`; if signed in, call `createFormAction({title, templateId})`. 404 for unpublished or non-template slugs.

### 9.3 Auth pages
`/login`, `/signup` (name, email, password ≥ 8). Inline errors, toasts on failure, redirect to `next` param (validate it is a relative path) or `/dashboard`. A signed-in visitor on `/login` is redirected by the **page** (not by `proxy.ts`).

### 9.4 Dashboard `/dashboard`
- Header: "Your forms" + **Create new form** button (dialog from 6.1).
- Stat cards: Total forms · Published · Total responses · Responses in last 7 days.
- Form list (cards or table; cards on mobile): title, status badge, response count, updated-at, actions: **Edit**, **Responses**, **Copy public link** (published only), **Delete** (confirm).
- Empty state with a CTA. Loading skeletons. Errors as toasts. Admins additionally see an **Admin → Templates** link in the sidebar/header.

### 9.5 Responses
- `/dashboard/forms/[id]/responses`: table — submitted-at, one column per question (truncate long values, tooltip full), source origin; 20 per page; empty state ("No responses yet — embed your form"); row → detail; delete with confirm.
- `/dashboard/forms/[id]/responses/[responseId]`: all answers in question order + timestamp. Another user's id → 404.
- Format dates with explicit locale and `timeZone` to avoid hydration mismatches.

### 9.6 Admin `/admin/templates`
Guarded by `requireAdminPage()`; non-admins get `notFound()`. See 6.5.

---

## 10. Security checklist (review before finishing every phase)
- [ ] Every owner-side query scoped by `ownerId` in the same statement; template mutations require ADMIN.
- [ ] Every server action calls `requireUser()`/`requireAdmin()` and Zod-parses input.
- [ ] Public endpoints never expose `ownerId`, `status`, `isTemplate`, `notifyEmails`; drafts and templates are invisible.
- [ ] `role` cannot be set via sign-up (tested with curl).
- [ ] `themeColor` validated `#rrggbb` before use in styles; `data-color` validated in `widget.js` too.
- [ ] No wildcard CORS on `/api/auth/*`.
- [ ] No secrets committed (`.env*` ignored; delete `cookies.txt`; add it to `.gitignore`).
- [ ] Rate limit on public POST. Body-size cap.
- [ ] `postMessage` listeners verify `event.origin`.
- [ ] User text rendered as text, never as HTML. `next` redirect param restricted to relative paths.
- [ ] Deleting a form/question cascades and is confirmed in the UI.

---

## 11. Tasks (do in order; each has acceptance criteria)

### Phase 0 — Make what exists real
**T1 — Repo hygiene.**
- Move this file to `docs/PRD.md`. Write a real `README.md` (see T17 for contents; a short version now is fine).
- Delete `cookies.txt` from git (`git rm --cached`) and add `cookies.txt` to `.gitignore`.
- Replace `src/middleware.ts` with `src/proxy.ts` (`npx @next/codemod@canary middleware-to-proxy .`); matcher `/dashboard/:path*` and `/admin/:path*`.
- Add `.env.example`. Remove leftover default `src/app/page.tsx` if present.
- **Accept:** only `proxy.ts` exists; `git ls-files` has no cookies/env files.

**T2 — Stabilise.** `npx tsc --noEmit` and `npm run lint` clean without changing behavior. Fix whatever the compiler reports; list each fix in your report.
- Seed the demo form (slug `demo123`, one question of each type, one optional). Verify: GET returns questions without `ownerId`; bad POST → `400/422`; valid POST → `201` and rows in `Response`/`Answer`; setting the form to DRAFT makes both `404`.
- Finish the sign-out check with `Origin` header; then `get-session` → `null`.

**T3 — Verify owner flows through the UI** (no code unless broken): `/dashboard` redirects to `/login` when signed out; signup → dashboard; create form; publish blocked with 0 questions; delete; sign out; **second user cannot see or modify the first user's forms** (second browser profile).

### Phase 1 — Core loop (chat + embed + deploy)
**T4 — Chat component + `/embed/[slug]` + `/f/[slug]`** per section 8. **Accept:** works at 1280px and 375px; full flow stores a response; unpublished → not-found page.

**T5 — `widget.js` + `test-site` + first deploy.** Build/verify `public/widget.js` (section 7.4); create `test-site/index.html` containing only the snippet, served on another port (`npx serve test-site -l 5000`). Deploy to Vercel (set env vars, `BETTER_AUTH_URL`=deployed URL, `postinstall` generates the client, run `prisma migrate deploy`). **Accept:** from `localhost:5000` *and* from the deployed app, the bubble appears, opens, submits, and the response shows in the dashboard; `data-color` override works. Re-run after every later deploy.

### Phase 2 — SaaS structure: roles, templates, builder
**T6 — Schema + roles.** Apply section 4 (migration `add_roles_templates`, `generate`). Add Better Auth `additionalFields.role`. Create `scripts/make-admin.ts` (`npx tsx scripts/make-admin.ts you@example.com` → sets `role=ADMIN`; refuses unknown email). Add `requireAdmin()` / `requireAdminPage()`. **Accept:** sign-up with `"role":"ADMIN"` in the body still yields OWNER; script promotes a user; `session.user.role` is readable server-side.

**T7 — Services.** `saveForm` (6.3), `createFormFromTemplate` (6.1), template CRUD (6.5), `limits.ts`, `slug.ts`; update the public form query to exclude templates. **Accept (write these as tests or a script, run them):** owner A cannot save/delete/publish owner B's form; an owner cannot touch a template; a template slug returns 404 from the public API and `/f`; a question id from another form in the payload → 400; stale `expectedUpdatedAt` → 409; save with a reordered list persists the new order; copying a template creates independent questions (editing the copy does not change the template).

**T8 — Builder UI** per 6.2: shell, top bar, palette, canvas with move up/down, settings tabs General + Style (Notifications/Prefill "Coming soon"), Save, Publish/Unpublish with snippet dialog, Preview sheet, mobile segmented layout, dirty guard. **Accept:** every operation persists after refresh; invalid input shows inline errors; Save disabled when clean; Preview uses unsaved state and writes nothing; editing a published form changes the live widget on next load; usable at 375px.

**T9 — Dashboard** per 9.4 including the **Create new form** dialog with Blank / From template. **Accept:** blank and template creation both land in the builder; stats correct after create/delete/submit; limit of 20 forms enforced with a clear message.

**T10 — Admin templates** per 6.5 and 9.6. **Accept:** admin creates a template, publishes it, it appears in the owner's dialog and in `/templates`; unpublishing hides it from both; non-admin gets 404 on `/admin/*`.

**T11 — Responses UI** per 9.5. **Accept:** a widget submission appears with the correct timestamp; another user's response id → 404.

### Phase 3 — Public site and polish
**T12 — Landing page** per 9.1 and **T13 — `/templates` + `/templates/[slug]`** per 9.2. **Accept:** all sections present; demo widget works on the landing page and cleans up on navigation; no horizontal scroll at 375px; Lighthouse accessibility ≥ 90 (report the number).

**T14 — Abuse protection.** In-memory limiter `lib/rate-limit.ts`: 5 submissions/min/IP/form → `429` with `Retry-After`; body cap; document that it is per-instance on serverless (Upstash is the production fix). **Accept:** the 6th rapid POST returns `429`; normal use unaffected.

### Phase 4 — Optional (only after Phases 0–3 pass QA)
**T15 — Notifications** (Resend): on a successful response, if `notifyOnResponse`, email `notifyEmails` a short summary (form title, time, answers). Sending must **never fail or slow the response** (fire-and-forget with error logging). Enable the tab. **T16 — Prefill** per section 8 and the Prefill tab. `@dnd-kit` drag-and-drop for the canvas and palette.

### Phase 5 — Release
**T17 — README + QA.** `README.md` must contain: overview + screenshots, features, stack, **setup (clone, install, env, migrate, seed, make-admin, run)** with PowerShell equivalents, env table, how to create/publish/embed, role model, API summary, **known limitations** (open `frame-ancestors`, per-instance rate limit, no email verification/reset, no workspaces), project structure, link to `docs/PRD.md`.
Final QA — run and report each line:
1. Fresh signup → create from template → customize (add/reorder/delete, change color) → preview → save → publish.
2. Copy snippet → paste into `test-site` → submit on desktop and 375px.
3. Server-side validation: required skipped, bad email, invalid choice (direct curl) → rejected.
4. Dashboard shows the response with timestamp; detail page correct.
5. Unpublish → widget, `/f/slug`, API all not found; republish restores.
6. User B cannot read/modify/delete user A's forms, questions, responses; owner cannot reach `/admin/*` or mutate a template (try crafted ids through the UI and direct service calls).
7. `npx tsc --noEmit`, `npm run lint`, `npm run build` pass; deployed URL passes steps 1–5.

---

## 12. Reporting format (after each task)
Files changed · how you verified (exact command + result) · what is `UNVERIFIED` · deviations from this PRD (if the PRD conflicts with reality, say so rather than working around it). One task per session, one commit per task, run `tsc` and `lint` before reporting.

## 13. Open questions for the developer
- Keep or disable Cache Components?
- Is the hosted DB the final production DB?
- Workspaces/team invites: confirmed **out** for now (decision 1.3). Revisit only before Phase 4.
- Footer email/GitHub and the app's final name/logo.