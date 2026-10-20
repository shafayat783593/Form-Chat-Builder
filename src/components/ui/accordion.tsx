"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

const AccordionContext = React.createContext<{
  open: string | null;
  setOpen: (value: string | null) => void;
  collapsible: boolean;
}>({ open: null, setOpen: () => {}, collapsible: false });

const AccordionItemContext = React.createContext<string>("");

export function Accordion({ collapsible = false, className, children }: AccordionProps) {
  const [open, setOpen] = React.useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ open, setOpen, collapsible }}>
      <div className={cn("divide-y divide-border", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className, children }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn("py-1", className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const { open, setOpen, collapsible } = React.useContext(AccordionContext);
  const value = React.useContext(AccordionItemContext);
  const isOpen = open === value;

  function toggle() {
    if (isOpen) {
      if (collapsible) setOpen(null);
    } else {
      setOpen(value);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left text-sm font-medium transition-colors hover:underline",
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown
        className={cn(
          "size-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

export function AccordionContent({ className, children }: AccordionContentProps) {
  const { open } = React.useContext(AccordionContext);
  const value = React.useContext(AccordionItemContext);
  const isOpen = open === value;

  if (!isOpen) return null;
  return (
    <div className={cn("pb-4 text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}
