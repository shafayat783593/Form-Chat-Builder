"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isSignup = mode === "signup";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const name = String(fd.get("name") ?? "");

    startTransition(async () => {
      const { error } = isSignup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (error) {
        setError(error.message ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {isSignup ? "Start building forms in minutes." : "Log in to manage your forms."}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="name">Name</label>
            <input id="name" name="name" required maxLength={80}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required
            className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8}
            className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        {isSignup ? (
          <>Already have an account? <Link href="/login" className="text-indigo-600">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="text-indigo-600">Create an account</Link></>
        )}
      </p>
    </div>
  );
}