"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { createFormAction } from "../form.actions";

export function NewFormForm() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createFormAction({ title });
      if (!res.ok) return setError(res.error);
      setTitle("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Form title"
        maxLength={120}
        required
        className="h-10 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        {pending ? "Creating…" : "New form"}
      </button>
      {error ? (
        <p role="alert" className="self-center text-sm text-destructive sm:basis-full">
          {error}
        </p>
      ) : null}
    </form>
  );
}
