"use client";

import { useState, useTransition } from "react";
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
    <form onSubmit={onSubmit} className="flex gap-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Form title" maxLength={120} required
        className="flex-1 rounded-md border bg-white px-3 py-2 text-sm" />
      <button disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Creating…" : "New form"}
      </button>
      {error && <p role="alert" className="self-center text-sm text-red-600">{error}</p>}
    </form>
  );
}