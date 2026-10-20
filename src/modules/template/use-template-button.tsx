"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createFormAction } from "@/modules/form/form.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UseTemplateButtonProps {
  templateId: string;
  templateTitle: string;
  signedIn: boolean;
  templateSlug: string;
}

export function UseTemplateButton({
  templateId,
  templateTitle,
  signedIn,
  templateSlug,
}: UseTemplateButtonProps) {
  const router = useRouter();
  const [title, setTitle] = useState(templateTitle);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={() =>
            router.push(`/signup?next=${encodeURIComponent(`/dashboard?template=${templateSlug}`)}`)
          }
        >
          Use this template
        </Button>
        <p className="text-xs text-muted-foreground">Sign up to copy this template into your forms.</p>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return setError("Enter a title for your form");
    setError(null);

    startTransition(async () => {
      const res = await createFormAction({ title: trimmed, templateId });
      if (!res.ok) {
        setError(res.error ?? "Could not create the form");
        return;
      }
      toast.success("Form created from template");
      router.push(`/dashboard/forms/${(res.data as { id: string }).id}/edit`);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground" htmlFor="use-template-title">
        Your form title
      </label>
      <Input
        id="use-template-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        disabled={pending}
      />
      <Button type="submit" disabled={pending || !title.trim()}>
        {pending ? "Creating…" : "Use this template"}
      </Button>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
