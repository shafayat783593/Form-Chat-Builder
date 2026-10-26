# FormChat

An interactive form builder. Build a form once, then share it as a classic form, as a chat conversation, or as a chat widget embedded on any website.

## Features

- **Form builder** with 15 field types (text, email, number, phone, date, dropdown, radio, checkbox, yes/no, rating, range, NPS, address, full name, long text)
- Drag-free editor with **undo / redo**, per-field style (color, font size, weight), placeholders and options
- **Two display modes**: classic form or chat-style conversation
- **Embeddable chat widget** via a single `<script>` tag (`public/widget.js`)
- **Share dialog**: public link, QR code, embed code, email and social links
- **Prefill** answers from the URL (`/f/my-form?email=a@b.com`)
- **Templates**: admins publish templates, owners start a form from one
- **Responses** dashboard and optional email notification on each response
- Roles: `ADMIN` and `OWNER`, with separate dashboards

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) · Prisma 7 + PostgreSQL · Better Auth · Zod · Resend (email) · Sonner (toasts)

## Getting started

Requirements: Node.js 20+, a PostgreSQL database.

```bash
git clone https://github.com/shafayat783593/Form-Chat-Builder.git
cd Form-Chat-Builder
npm install          # also runs `prisma generate`
# create a .env file with the values below
npx prisma migrate deploy --config prisma7.config.ts
npx prisma db seed --config prisma7.config.ts   # optional: sample data
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | yes | Secret used by Better Auth to sign sessions |
| `BETTER_AUTH_URL` | yes | Base URL of the app, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | yes | Public URL, used in share links and the embed code |
| `NEXT_PUBLIC_DEMO_FORM_SLUG` | no | Slug of the form shown in the landing-page demo chat |
| `RESEND_API_KEY` | no | Enables response notification emails |
| `NOTIFY_FROM_EMAIL` | no | "From" address of notification emails |

### Make a user an admin

```bash
npx tsx scripts/make-admin.ts <email>
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |

## Project structure

```
src/
  app/            Routes: landing page, auth, dashboards, /f/[slug], /embed/[slug], /api
  modules/
    builder/      The form editor (state, components, field metadata)
    chat/         Chat UI used by the widget, preview and public form
    form/         Form services and server actions
    form-runtime/ Classic (non-chat) form shown to respondents
    question/     Question logic
    response/     Saving and listing responses
    template/     Templates
    auth/         Better Auth setup and guards
    dashboard/    Owner and admin dashboard pieces
  lib/            Shared code, e.g. field-types.ts (field types + answer validation)
prisma/           schema.prisma, migrations, seed
public/widget.js  The script that embeds the chat widget
```

### The builder

The editor state lives in `src/modules/builder/builder-state.ts`: plain functions with no React. It keeps an undo history and compares the current form with the last saved version to show "unsaved changes". `use-builder-state.ts` wraps it in a hook, and `builder.tsx` connects it to the screen and the save/publish actions.

Field types and answer validation are in `src/lib/field-types.ts`, shared by the builder and the server so both apply the same rules.

## Embedding the widget

After publishing a form, open **Share** and copy the embed code. It looks like:

```html
<script src="https://YOUR-APP/widget.js" data-form="YOUR-FORM-SLUG"
        data-color="#0f766e" data-position="left"></script>
```

`data-color`, `data-position` and `data-prefill` (JSON) are optional. The Share dialog generates the snippet for you.

## Notes

- Option values cannot contain a comma, because checkbox answers are stored comma-separated.
- Saving uses `updatedAt` as an optimistic lock: if the form was changed in another tab, the save is rejected instead of overwriting.