"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Only relative paths are accepted for the `next` param. */
function safeNext(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (value.includes("://")) return "/dashboard";
  return value;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isSignup = mode === "signup";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "").trim();

    if (isSignup && name.length < 1) {
      setError("Name is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      const { error } = isSignup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (error) {
        setError(error.message ?? "Something went wrong");
        toast.error(error.message ?? "Something went wrong");
        return;
      }
      router.push(next);
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {isSignup ? "Start building forms in minutes." : "Log in to manage your forms."}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignup && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={80} disabled={pending} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={pending}
          />
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
          <p className="text-[11px] text-muted-foreground">
            At least 8 characters.
          </p>
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
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-primary underline underline-offset-4">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
