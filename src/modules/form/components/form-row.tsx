"use client";

import { useState, useTransition } from "react";
import { deleteFormAction, setFormStatusAction } from "../form.actions";

type Props = {
  form: {
    id: string; title: string; slug: string;
    status: "DRAFT" | "PUBLISHED";
    responses: number; questions: number;
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
    <li className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{form.title}</p>
          <p className="text-sm text-gray-500">
            {form.questions} questions · {form.responses} responses ·{" "}
            <span className={published ? "text-green-600" : "text-gray-500"}>
              {published ? "Published" : "Draft"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggle} disabled={pending}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60">
            {published ? "Unpublish" : "Publish"}
          </button>
          <button onClick={remove} disabled={pending}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60">
            Delete
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </li>
  );
}