import * as React from "react";
import { requireUserPage } from "@/lib/session";
import { getRole } from "@/lib/roles";
import { DashboardShell } from "@/modules/dashboard";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireUserPage();
  return (
    <DashboardShell role={getRole(user)} userName={user.name}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
