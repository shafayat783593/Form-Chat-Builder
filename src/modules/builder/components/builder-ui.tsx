"use client";

/**
 * Small pieces the builder screens share, so each screen only describes what is
 * special about it.
 */

import { useState, type ComponentProps, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Buttons

const ICON_BUTTON_SIZE = {
  small: "size-7 rounded-md disabled:opacity-30",
  medium: "size-8 rounded-lg disabled:opacity-40",
};

const ICON_BUTTON_TONE = {
  normal: "text-muted-foreground hover:bg-muted",
  danger: "text-destructive hover:bg-destructive/10",
};

interface IconButtonProps extends Omit<ComponentProps<"button">, "type"> {
  /** Read by screen readers; there is no visible text on an icon button. */
  label: string;
  size?: keyof typeof ICON_BUTTON_SIZE;
  tone?: keyof typeof ICON_BUTTON_TONE;
}

/** A square button that only shows an icon. */
export function IconButton({
  label,
  size = "small",
  tone = "normal",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid place-items-center transition-colors disabled:pointer-events-none",
        ICON_BUTTON_SIZE[size],
        ICON_BUTTON_TONE[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Copies text to the clipboard and reports `copied` for two seconds. */
export function useCopy(text: string) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The browser blocked the clipboard. The text is still selectable on screen.
    }
  }

  return { copied, copy };
}

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const { copied, copy } = useCopy(text);

  return (
    <Button
      type="button"
      onClick={copy}
      variant="outline"
      size="sm"
      className={cn("gap-1.5", className)}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  /** For example "12/120". */
  counter?: string;
  children: ReactNode;
}

/** A label, an input, and optional help text underneath. */
export function Field({ label, hint, counter, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      {counter ? <p className="text-[11px] text-muted-foreground">{counter}</p> : null}
    </div>
  );
}
