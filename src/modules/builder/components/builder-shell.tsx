"use client";

import * as React from "react";

export interface BuilderShellProps {
  children: React.ReactNode;
  className?: string;
}

export function BuilderShell({ children, className }: BuilderShellProps) {
  return (
    <div
      data-slot="builder-shell"
      className={cn("flex h-[calc(100svh-3.5rem)] flex-col overflow-hidden", className)}
    >
      {children}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
