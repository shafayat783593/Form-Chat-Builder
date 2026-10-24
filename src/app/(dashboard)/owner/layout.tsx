import * as React from "react";
import RoleGuard from "@/modules/auth/components/role.guard";
import { DashboardShell } from "@/modules/dashboard";

export const instant = false;

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["OWNER", "ADMIN"]}>
      <DashboardShell role="OWNER">{children}</DashboardShell>
    </RoleGuard>
  );
}
