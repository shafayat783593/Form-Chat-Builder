import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Ready to turn your forms into conversations?
          </h2>
          <p className="mx-auto mt-3 max-w-prose text-muted-foreground">
            Create your first form in minutes and embed the chat widget on any site.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Get started free
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/templates" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Browse templates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
