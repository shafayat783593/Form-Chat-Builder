import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BuilderShellProps {
  children: ReactNode;
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
