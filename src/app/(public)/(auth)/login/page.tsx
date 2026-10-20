import { redirect } from "next/navigation";
import { requireUserPage } from "@/lib/session";
import { AuthForm } from "@/modules/auth/components/auth-form";

export default async function LoginPage() {
  const session = await requireUserPage().catch(() => null);
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
