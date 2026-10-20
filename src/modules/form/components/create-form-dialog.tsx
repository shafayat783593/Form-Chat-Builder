"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Copy } from "lucide-react";
import { createFormAction } from "../form.actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TemplateItem = {
  id: string;
  title: string;
  templateSlug: string | null;
  templateCategory: string | null;
  _count: { questions: number };
};

interface CreateFormDialogProps {
  templates: TemplateItem[];
}

export function CreateFormDialog({ templates }: CreateFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tab, setTab] = useState<"blank" | "template">("blank");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) return setError("Enter a form title");

    const payload: { title: string; templateId?: string } = { title: trimmed };
    if (tab === "template" && selectedTemplateId) payload.templateId = selectedTemplateId;

    startTransition(async () => {
      const res = await createFormAction(payload);
      if (!res.ok) return setError(res.error);
      setOpen(false);
      setTitle("");
      setTab("blank");
      setSelectedTemplateId(null);
      router.push(`/dashboard/forms/${(res.data as { id: string }).id}/edit`);
    });
  }

  return (
    <>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
        <Plus className="size-3.5" />
        Create new form
      </DialogTrigger>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new form</DialogTitle>
            <DialogDescription>
              Start from scratch or copy a published template.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
            <Label className="text-sm font-medium">Form title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Course enrollment"
              maxLength={120}
              required
              disabled={pending}
              autoFocus
            />

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList>
                <TabsTrigger value="blank">Blank</TabsTrigger>
                <TabsTrigger value="template">From template</TabsTrigger>
              </TabsList>

              <TabsContent value="blank" className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Create an empty form and add questions in the builder.
                </p>
              </TabsContent>

              <TabsContent value="template" className="pt-2">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No published templates available yet. Choose Blank to start from scratch.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(t.id)}
                        disabled={pending}
                        aria-pressed={selectedTemplateId === t.id}
                        className={cn(
                          "flex flex-row items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                          selectedTemplateId === t.id
                            ? "border-primary bg-primary/50"
                            : "bg-muted hover:bg-muted/50 border-transparent"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.templateCategory ?? "Uncategorized"} · {t._count.questions} question{t._count.questions === 1 ? "" : "s"}
                          </p>
                        </div>
                        <Copy className="size-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="submit"
                disabled={pending || !title.trim() || (tab === "template" && !selectedTemplateId)}
              >
                {pending ? <Plus className="size-4 animate-spin" /> : null}
                {pending ? "Creating…" : "Create form"}
              </Button>
            </DialogFooter>
          </form>

          {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
