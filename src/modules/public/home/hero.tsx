import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="border-b bg-gradient-to-br from-background to-muted/20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-green-500" />
            Forms that feel like a conversation
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Build forms that <span className="text-primary">feel like conversations.</span>
          </h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            Create forms in minutes, embed a conversational chatbot widget on any website with a single
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
          <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-blue-500" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* স্থির মকআপ, স্ক্রিন-রিডারের জন্য লুকানো */}
        <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-2xl" />
          <div className="relative rounded-2xl border bg-card p-5 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="text-sm font-medium">Contact form</span>
              <div className="ml-auto flex gap-1">
                <span className="size-1.5 rounded-full bg-yellow-500" />
                <span className="size-1.5 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                Hi! Let&apos;s get started. What&apos;s your name?
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
                Sarah
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                Nice to meet you, Sarah! What service are you interested in?
              </div>
              <div className="flex gap-2 pt-1">
                <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">Web Dev</span>
                <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">Design</span>
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-muted/60 px-3 py-2 text-xs text-muted-foreground italic">
                ✨ Skipping optional questions
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}