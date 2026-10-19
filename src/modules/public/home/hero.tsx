import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            Forms that feel like a conversation
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Build a form once. Let visitors answer it as a chat.
          </h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            Create forms in minutes, embed a chatbot widget on any website with a single
            line of code, and review every submission in your dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Get started
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/#demo" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Try the live demo
            </Link>
          </div>
        </div>

        {/* স্থির মকআপ, স্ক্রিন-রিডারের জন্য লুকানো */}
        <div aria-hidden="true" className="mx-auto w-full max-w-sm rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b pb-3">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-sm font-medium">Contact form</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
              Hi! Let&apos;s get started. What&apos;s your name?
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
              Sara
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
              Nice to meet you, Sara. What&apos;s your email?
            </div>
            <div className="flex gap-2 pt-1">
              <span className="rounded-full border px-3 py-1 text-xs">Yes</span>
              <span className="rounded-full border px-3 py-1 text-xs">No</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}