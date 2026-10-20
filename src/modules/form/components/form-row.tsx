"use client";

import { useState, useTransition } from "react";
import { deleteFormAction, setFormStatusAction } from "../form.actions";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

type Props = {
  form: {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    responses: number;
    questions: number;
  };
};

export function FormRow({ form }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const published = form.status === "PUBLISHED";

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = await setFormStatusAction(form.id, published ? "DRAFT" : "PUBLISHED");
      if (!res.ok) setError(res.error);
    });
  }

  function remove() {
    if (!confirm(`Delete "${form.title}"? Its responses will be deleted too.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteFormAction(form.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <li className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{form.title}</p>
          <p className="text-sm text-muted-foreground">
            {form.questions} question{form.questions === 1 ? "" : "s"} ·{" "}
            {form.responses} response{form.responses === 1 ? "" : "s"} ·{" "}
            <span className={published ? "text-success" : "text-muted-foreground"}>
              {published ? "Published" : "Draft"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {published ? (
            <Link
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              View
            </Link>
          ) : null}

          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {published ? "Unpublish" : "Publish"}
          </button>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </li>
  );
}
