import * as React from "react";
import RoleGuard from "@/modules/auth/components/role.guard";
import { DashboardShell } from "@/modules/dashboard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <DashboardShell role="ADMIN">{children}</DashboardShell>
    </RoleGuard>
  );
}
