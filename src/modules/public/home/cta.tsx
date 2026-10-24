import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="border-b bg-gradient-to-br from-primary/5 to-blue-500/5">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/20 p-8 text-center shadow-xl sm:p-12">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 size-64 rounded-full bg-blue-500/10 blur-3xl" />
          
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Ready to turn your forms into conversations?
            </h2>
            <p className="mx-auto mt-4 max-w-prose text-lg text-muted-foreground">
              Create your first form in minutes and embed the chat widget on any site.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link 
                href="/signup" 
                className="group relative inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              >
                Get started free
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/templates" 
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium transition-all duration-300 hover:bg-muted hover:border-primary/20"
              >
                Browse templates
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • Free during beta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
