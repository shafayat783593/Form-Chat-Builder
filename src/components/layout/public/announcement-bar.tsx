import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="border-b bg-foreground px-4 py-2 text-background">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center text-xs sm:text-sm">
        <Sparkles className="hidden size-3.5 shrink-0 sm:inline" />
        <p>
          <span className="font-medium">Chat-first forms are here.</span>{" "}
          <Link
            href="/#features"
            className="underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100"
          >
            See what is new
          </Link>
        </p>
      </div>
    </div>
  );
}
