"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createTemplateAction } from "@/modules/template/template.actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateTemplateDialogProps {
  onCreated?: () => void;
}

export function CreateTemplateDialog({ onCreated }: CreateTemplateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [templateSlug, setTemplateSlug] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedTitle = title.trim();
    const trimmedSlug = templateSlug.trim().toLowerCase();
    if (!trimmedTitle) return setError("Enter a template title");
    if (!trimmedSlug) return setError("Enter a template slug");

    startTransition(async () => {
      const res = await createTemplateAction({
        title: trimmedTitle,
        templateSlug: trimmedSlug,
        templateCategory: templateCategory.trim() || null,
      });
      if (!res.ok) {
        setError(res.error ?? "Failed to create template");
        return;
      }
      setOpen(false);
      setTitle("");
      setTemplateSlug("");
      setTemplateCategory("");
      onCreated?.();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
        <Plus className="size-4" />
        Create template
      </DialogTrigger>
      <DialogContent>
          <DialogHeader>
            <DialogTitle>Create template</DialogTitle>
            <DialogDescription>
              Templates are published here and offered to owners when they create a form.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
            <Label className="text-sm font-medium">Template title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Course enrollment"
              maxLength={120}
              required
              disabled={pending}
              autoFocus
            />

            <Label className="text-sm font-medium mt-2">Template slug</Label>
            <Input
              value={templateSlug}
              onChange={(e) => setTemplateSlug(e.target.value)}
              placeholder="e.g. course-enrollment"
              maxLength={60}
              required
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Lowercase, letters/numbers, single hyphens between words (3–60 chars). Used in
              /templates/{templateSlug}.
            </p>

            <Label className="text-sm font-medium mt-2">Category (optional)</Label>
            <Input
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              placeholder="e.g. Education"
              maxLength={100}
              disabled={pending}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={pending || !title.trim() || !templateSlug.trim()}
              >
                {pending ? <Plus className="size-4 animate-spin" /> : null}
                {pending ? "Creating…" : "Create template"}
              </Button>
            </DialogFooter>
          </form>

          {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
        </DialogContent>
    </Dialog>
  );
}
