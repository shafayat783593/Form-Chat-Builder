"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createFormAction } from "@/modules/form/form.actions";
import { Button } from "@/components/ui/button";

interface UseTemplateButtonProps {
  templateId: string;
  signedIn: boolean;
  templateSlug: string;
}

export function UseTemplateButton({
  templateId,
  signedIn,
  templateSlug,
}: UseTemplateButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={() =>
            router.push(`/signup?next=${encodeURIComponent(`/owner?template=${templateSlug}`)}`)
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
    setError(null);

    startTransition(async () => {
      const res = await createFormAction({ templateId });
      if (!res.ok) {
        setError(res.error ?? "Could not create the form");
        return;
      }
      toast.success("Form created from template");
      router.push(`/owner/forms/${(res.data as { id: string }).id}/edit`);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Use this template"}
      </Button>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
