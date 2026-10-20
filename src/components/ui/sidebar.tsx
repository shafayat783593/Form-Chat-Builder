"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
}: SidebarProviderProps) {
  const [open, setOpenState] = React.useState(defaultOpen);

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const toggle = React.useCallback(() => setOpen(!open), [open, setOpen]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ open: openProp ?? open, setOpen, toggle }),
    [openProp, open, setOpen, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className={cn("flex min-h-svh w-full", className)}>{children}</div>
    </SidebarContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggle } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      data-slot="sidebar-trigger"
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  side?: "left" | "right";
}

export function Sidebar({
  variant = "sidebar",
  collapsible = "offcanvas",
  side = "left",
  className,
  children,
  ...props
}: SidebarProps) {
  return (
    <div
      data-slot="sidebar"
      data-variant={variant}
      data-collapsible={collapsible}
      data-side={side}
      className={cn(
        "flex h-svh w-64 shrink-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground",
        side === "right" && "border-l",
        side === "left" && "border-r",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("relative flex min-h-svh w-full flex-1 flex-col", className)}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-separator"
      role="separator"
      className={cn("mx-2 h-px w-auto shrink-0 bg-sidebar-border", className)}
      {...props}
    />
  );
}

export function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-rail"
      className={cn("absolute inset-y-0 right-0 hidden w-2 sm:flex", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const menuButtonSizes = {
  sm: "h-7 text-xs",
  md: "h-8 text-sm",
  lg: "h-10 text-sm",
} as const;

export interface SidebarMenuButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  isActive?: boolean;
  tooltip?: string;
  size?: keyof typeof menuButtonSizes;
  /** Render a different element (e.g. a Next.js <Link>) instead of a <button>. */
  render?: React.ReactElement<{ className?: string; children?: React.ReactNode }>;
  children?: React.ReactNode;
}

export function SidebarMenuButton({
  className,
  isActive = false,
  tooltip,
  size = "md",
  render,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const classes = cn(
    "flex w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sidebar-foreground/80 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
    menuButtonSizes[size],
    isActive && "sidebar-link-active",
    className,
  );

  if (render) {
    return React.cloneElement(
      render,
      { className: cn(classes, render.props.className) },
      children,
    );
  }

  return (
    <button
      type="button"
      data-slot="sidebar-menu-button"
      data-active={isActive || undefined}
      title={tooltip}
      aria-current={isActive ? "page" : undefined}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarMenuBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums",
        className,
      )}
      {...props}
    />
  );
}
