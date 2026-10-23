# FormChat

A SaaS web app where a signed-in **Owner** builds a conversational form (one
question at a time), publishes it, and embeds it on any website with one
`<script>` tag as a floating chat widget. Visitors answer inside the widget;
responses are stored with timestamps and shown in the owner's dashboard.

An **Admin** (platform operator) creates **form templates**. Owners start a
new form either blank or from a template, then customize it in a 3-panel
builder.

## Features

- Email + password auth (Better Auth), no email verification or password reset yet.
- Three-panel builder: field palette · canvas · Form Settings (General, Style, Notifications, Prefill).
- 15 question types: Text, Textarea, Email, Number, Phone, Date, Dropdown, Radio, Checkbox, Yes/No, Rating, Range, NPS, Address, Full Name.
- Per-field styling: label, placeholder, text colour, font size, weight and style.
- Publish / unpublish, with a 3-panel live preview and a share dialog (QR, embed code, social).
- **Chat-first visitor experience**: one question at a time, the whole conversation stays visible, and a single request is sent when the visitor finishes. Used by the public page (`/f/{slug}`), the embeddable widget (`/embed/{slug}`) and the builder preview.
- Floating chat widget (`public/widget.js`) — idempotent, no dependencies, `fw-` prefixed classes, lazy-loaded iframe, `data-color` / `data-position` / `data-prefill` support.
- Templates (admin creates and publishes; owners copy from a template).
- Roles: `OWNER` (default) and `ADMIN` (created only by `scripts/make-admin.ts`).
- Responses dashboard with timestamps, per-question columns and detail pages.
- Rate limiting + body-size cap on the public POST endpoint.

## Tech stack

- Next.js 16.x (App Router, Turbopack, React 19, TypeScript)
- Prisma 7.x + PostgreSQL (hosted Prisma Postgres)
- Better Auth (email + password, Prisma adapter, `nextCookies()`)
- Tailwind CSS v4 + shadcn/ui (Base UI flavour), `next-themes`, `sonner`, `lucide-react`
- Zod for validation at every boundary
- Windows dev environment (PowerShell)

## Setup (Windows / PowerShell)

```powershell
# 1. Clone and install
git clone <repo-url>
cd form-chat-builder
npm install

# 2. Create your .env from the template
Copy-Item .env.example .env
# then fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, etc.

# 3. Run migrations and generate the Prisma client
npx prisma migrate deploy
npx prisma generate

# 4. Seed the demo form
npx tsx prisma/seed.ts

# 5. Make yourself an admin
npx tsx scripts/make-admin.ts you@example.com

# 6. Start the dev server
npm run dev
```

The app runs on `http://localhost:3000`. The dev server binds port 3000; if
it is taken, Next.js picks the next free port.

## Environment variables

| Name | Used for |
|---|---|
| `DATABASE_URL` | Prisma (pooled) |
| `BETTER_AUTH_SECRET` | Better Auth |
| `BETTER_AUTH_URL` | Base URL (localhost in dev, Vercel URL in prod) |
| `NEXT_PUBLIC_APP_URL` | Used to build the embed snippet / public URLs |
| `NEXT_PUBLIC_DEMO_FORM_SLUG` | Landing page live demo |
| `ADMIN_EMAIL` | Read by `scripts/make-admin.ts` (optional; CLI arg also accepted) |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | Phase 3 only |

## How to create, publish and embed a form

1. Sign up at `/signup` → you land on `/dashboard`.
2. Click **Create new form** (top-right of the dashboard) and pick **Blank** or
   **From template**.
3. In the builder: add fields from the left palette, edit labels, set required
   flags, tweak per-field styling, and use the right-hand **Form Settings** tabs
   (General / Style / Notifications / Prefill).
4. Click **Preview** to see the form without saving.
5. Click **Save**, then **Publish**. After publishing a share dialog appears with
   your public link, a QR code, the embed snippet and social share buttons.
6. Paste the snippet on any site:

   ```html
   <script src="https://your-domain.com/widget.js" data-form="YOUR_FORM_SLUG"></script>
   ```

   Optional attributes: `data-color="#rrggbb"` (overrides the theme colour),
   `data-position="left|right"`.

7. Visit `/dashboard` to see submissions with timestamps; click **Responses** on a
   form to see per-question answers.

## Role model

- Everyone who signs up is `OWNER`.
- `OWNER` owns their own forms and responses only.
- `ADMIN` is created **only** by `scripts/make-admin.ts` (never via the UI/API).
- An admin is **not** a super-reader: they only see their own forms and
  responses, plus the templates they created.

Authorization is checked in the service layer, never only in the UI or layout.

## API summary

- `GET /api/public/forms/{slug}` → `200 { slug, title, description, welcomeText, completionText, themeColor, launcherLabel, widgetPosition, submitButtonText, displayMode, showProgress, multiPageForm, questions:[...] }` · `404` if missing, unpublished or a template.
- `POST /api/public/forms/{slug}/responses` body `{ answers:[{questionId, value}], sourceUrl? }` → `201 { ok, id }` · `400` bad body / unknown or duplicate question id · `404` not found · `422 { error, details }` · `429` rate limited · `OPTIONS` → `204`.
- Auth is Better Auth on `/api/auth/*`. POSTs need an `Origin` header.

## Known limitations

- `frame-ancestors *` on `/embed/*` lets any site embed any published form.
- Rate limiting is per instance (in-memory); the production fix is a shared
  store (Upstash Redis / Vercel KV).
- No email verification, password reset, OAuth, payments, workspaces or i18n.
- The landing-page demo widget requires `NEXT_PUBLIC_DEMO_FORM_SLUG` to be set.

## Project structure

See `docs/PRD.md` for the full target structure. The main folders today:

```
src/
├─ app/        # Next.js routes: (public), dashboard, admin, f, embed, api
├─ modules/    # feature modules: auth, form, question, response, template, builder, chat, form-runtime, public/home, dashboard
├─ lib/        # prisma, auth, session, roles, errors, api, action, limits, rate-limit, slug, field-types, utils
├─ components/ # shadcn/ui primitives + layout
├─ proxy.ts    # cookie-presence guard for /dashboard and /admin
public/widget.js
scripts/make-admin.ts
prisma/{schema.prisma, seed.ts, migrations/}
docs/PRD.md
```

## Full product spec

See [`docs/PRD.md`](docs/PRD.md) for the complete product requirements, data
model, API contracts, builder specification and task list.
