import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-500 text-white shadow-lg">
        <Compass className="size-8" />
      </span>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">404 · Not found</p>
      <h1 className="max-w-md text-3xl font-extrabold tracking-tight text-balance">
        This page doesn&apos;t exist
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        The link may be broken, or the page was moved. Let&apos;s get you back somewhere useful.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-95"
      >
        <Home className="size-4" />
        Back to home
      </Link>
    </div>
  );
}
