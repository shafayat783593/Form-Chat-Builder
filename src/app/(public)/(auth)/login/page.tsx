import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireUserPage } from "@/lib/session";
import { getRole } from "@/lib/roles";
import { AuthForm } from "@/modules/auth/components/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm animate-pulse" />}>
          <LoginGuard />
        </Suspense>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}

async function LoginGuard() {
  const user = await requireUserPage().catch(() => null);
  if (user) redirect(getRole(user) === "ADMIN" ? "/admin" : "/owner");
  return null;
}
