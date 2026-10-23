"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/owner";
  }
  return value;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isSignup = mode === "signup";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    if (isSignup && !name) {
      setError("Name is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      const result = isSignup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        const errorMsg = result.error.message ?? "Something went wrong";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

    
      const { data } = await authClient.getSession();
      const role = getRole(data?.user as { role?: unknown } | undefined);
      const destination = searchParams.get("next") ? next : (role === "ADMIN" ? "/admin" : "/owner");

      router.push(destination);
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignup ? "Start building forms in minutes." : "Log in to manage your forms."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignup && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={80} disabled={pending} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" disabled={pending} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            disabled={pending}
          />
          <p className="text-[11px] text-muted-foreground">At least 8 characters.</p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-primary underline underline-offset-4"
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}