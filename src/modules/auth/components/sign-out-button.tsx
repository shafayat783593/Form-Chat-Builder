"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    const res = await authClient.signOut();
    if (res.error) {
      setError("Sign out failed. Try again.");
      return;
    }
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 ${className}`}
      >
        <LogOut className="size-4" />
        <span>{pending ? "Logging out…" : "Logout"}</span>
      </button>
      {error ? (
        <p role="alert" className="px-3 text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
