import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <MessageSquare className="size-5 text-primary" />
            FormChat
          </Link>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Conversational forms and an embeddable chat widget.
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <p className="mb-2 font-medium">Product</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-foreground">How it works</Link></li>
            <li><Link href="/#demo" className="hover:text-foreground">Live demo</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Log in</Link></li>
            <li><Link href="/signup" className="hover:text-foreground">Sign up</Link></li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="mb-2 font-medium">Contact</p>
          <ul className="space-y-1.5 text-muted-foreground">
            {/* TODO: নিজের ইমেইল ও GitHub লিংক বসাও */}
            <li><a href="mailto:you@example.com" className="hover:text-foreground">you@example.com</a></li>
            <li><a href="https://github.com/your-username" className="hover:text-foreground" target="_blank" rel="noreferrer">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © FormChat. Built as an internship project.
      </div>
    </footer>
  );
}