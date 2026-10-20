"use client";

import { Plus, X, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MAX_NOTIFY_EMAILS } from "@/lib/limits";
import { cn } from "@/lib/utils";

interface NotificationsTabProps {
  settings: {
    notifyOnResponse: boolean;
    notifyEmails: string[];
  };
  onUpdate: (patch: Partial<NotificationsTabProps["settings"]>) => void;
}

export function NotificationsTab({ settings, onUpdate }: NotificationsTabProps) {
  const emails = settings.notifyEmails ?? [];

  function setEmail(index: number, value: string) {
    const next = [...emails];
    next[index] = value;
    onUpdate({ notifyEmails: next });
  }

  function removeEmail(index: number) {
    onUpdate({ notifyEmails: emails.filter((_, i) => i !== index) });
  }

  function addEmail() {
    if (emails.length >= MAX_NOTIFY_EMAILS) return;
    onUpdate({ notifyEmails: [...emails, ""] });
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-start justify-between gap-3 rounded-xl border border-input bg-card p-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
            <Mail className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">Email me on new response</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Get notified whenever someone submits this form.
            </p>
          </div>
        </div>
        <Switch
          checked={settings.notifyOnResponse}
          onCheckedChange={(checked) => onUpdate({ notifyOnResponse: checked })}
          aria-label="Email me on new response"
        />
      </div>

      <div className={cn("flex flex-col gap-2", !settings.notifyOnResponse && "opacity-50")}>
        <Label className="text-xs font-medium text-muted-foreground">
          Notify these addresses
        </Label>

        {emails.length === 0 ? (
          <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
            No addresses yet. Add up to {MAX_NOTIFY_EMAILS}.
          </p>
        ) : (
          emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(index, e.target.value)}
                placeholder="you@example.com"
                disabled={!settings.notifyOnResponse}
                className="h-8"
                aria-label={`Notification email ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeEmail(index)}
                disabled={!settings.notifyOnResponse}
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:pointer-events-none"
                aria-label={`Remove email ${index + 1}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={addEmail}
          disabled={!settings.notifyOnResponse || emails.length >= MAX_NOTIFY_EMAILS}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-input px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Plus className="size-3.5" /> Add email
        </button>
        <p className="text-[11px] text-muted-foreground">
          {emails.length}/{MAX_NOTIFY_EMAILS} addresses
        </p>
      </div>
    </div>
  );
}
