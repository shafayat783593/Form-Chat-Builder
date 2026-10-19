import React, { Suspense } from "react";
import { requireUserPage } from "@/lib/session";
import { SignOutButton } from "@/modules/auth/components/sign-out-button";

async function Shell({ children } : { children: React.ReactNode }) {
  const user = await requireUserPage();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold">FormChat</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}