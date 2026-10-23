"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, MessageSquare, X, LayoutDashboard } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { authClient } from "@/lib/auth-client";
import { getRole } from "@/lib/roles";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/templates", label: "Templates" },
  { href: "/#demo", label: "Demo" },
];

function AuthButtons({ signedIn, role }: { signedIn: boolean; role: string | null }) {
  if (signedIn) {
    return (
      <Link
        href={role === "ADMIN" ? "/admin" : "/owner"}
        className={buttonVariants({ variant: "ghost" })}
      >
        <LayoutDashboard className="size-4" />
        Dashboard
      </Link>
    );
  }
  return (
    <>
      <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
        Log in
      </Link>
      <Link href="/signup" className={buttonVariants()}>
        Get started
      </Link>
    </>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await authClient.getSession();
        if (!cancelled) {
          setSignedIn(!!data?.user);
          setRole(data?.user ? getRole(data.user as { role?: unknown }) : null);
        }
      } catch {
        if (!cancelled) setSignedIn(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="size-5 text-primary" />
          FormChat
        </Link>

        {/* desktop */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ModeToggle />
          {signedIn === null ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : (
            <AuthButtons signedIn={signedIn} role={role} />
          )}
        </div>

        {/* mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {signedIn === null ? (
                <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
              ) : (
                <AuthButtons signedIn={signedIn} role={role} />
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
