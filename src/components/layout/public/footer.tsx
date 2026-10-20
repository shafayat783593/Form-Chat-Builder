import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <MessageSquare className="size-5 text-primary" />
              FormChat
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Build conversational forms and embed them anywhere.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-muted-foreground hover:text-foreground">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/#demo" className="text-muted-foreground hover:text-foreground">
                  Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="mailto:hello@formchat.app"
                  className="text-muted-foreground hover:text-foreground"
                >
                  hello@formchat.app
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/anomalyco/opencode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} FormChat. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
