"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface GeneralTabProps {
  settings: {
    title: string;
    description: string | null;
    welcomeText: string;
    completionText: string;
  };
  onUpdate: (patch: Partial<GeneralTabProps["settings"]>) => void;
}

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      {counter ? <p className="text-[11px] text-muted-foreground">{counter}</p> : null}
    </div>
  );
}

export function GeneralTab({ settings, onUpdate }: GeneralTabProps) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <Field
        label="Form title"
        counter={`${settings.title.length}/120`}
      >
        <Input
          value={settings.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          maxLength={120}
          className="h-9"
        />
      </Field>

      <Field
        label="Description"
        hint="Shown at the top of the form."
        counter={`${(settings.description ?? "").length}/500`}
      >
        <Textarea
          value={settings.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value || null })}
          maxLength={500}
          className="min-h-20 resize-none"
        />
      </Field>

      <Field
        label="Welcome message"
        hint="The first bubble a visitor sees."
        counter={`${settings.welcomeText.length}/300`}
      >
        <Textarea
          value={settings.welcomeText}
          onChange={(e) => onUpdate({ welcomeText: e.target.value })}
          maxLength={300}
          className="min-h-20 resize-none"
        />
      </Field>

      <Field
        label="Completion message"
        hint="Shown after the visitor submits the form."
        counter={`${settings.completionText.length}/300`}
      >
        <Textarea
          value={settings.completionText}
          onChange={(e) => onUpdate({ completionText: e.target.value })}
          maxLength={300}
          className="min-h-20 resize-none"
        />
      </Field>
    </div>
  );
}
