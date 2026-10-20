import * as React from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/session";
import { getRole } from "@/lib/roles";

/**
 * Admin area guard.
 *
 * requireAdminPage() redirects anonymous visitors to /login and renders the
 * not-found page (404, not 403) for a signed-in user that is not an admin, so
 * the existence of the admin area is not disclosed.
 *
 * This layout is convenience only - every admin page and every admin server
 * action authorises again in the service layer (see lib/session.ts).
 */
async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();

  return (
    <div className="min-h-svh">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Admin
            </p>
            <p className="truncate text-lg font-semibold">Templates</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              {user.name} · {getRole(user).toLowerCase()}
            </span>
            <Link
              href="/dashboard"
              className="rounded-md border px-3 py-1.5 font-medium transition-colors hover:bg-muted"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <Shell>{children}</Shell>
    </React.Suspense>
  );
}
