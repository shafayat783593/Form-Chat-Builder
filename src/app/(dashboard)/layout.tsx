import * as React from "react";
import AuthGuard from "@/modules/auth/components/auth.guard";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
