"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const slug = process.env.NEXT_PUBLIC_DEMO_FORM_SLUG;

export function DemoSection() {
  useEffect(() => {
    if (!slug) return;
    const script = document.createElement("script");
    script.src = "/widget.js";
    script.async = true;
    script.setAttribute("data-form", slug);
    document.body.appendChild(script);

   
    return () => {
      script.remove();
      document.getElementById(`fw-root-${slug}`)?.remove();
    };
  }, []);

  function openChat() {
    const frame = document.getElementById(`fw-frame-${slug}`);
    const btn = document.getElementById(`fw-btn-${slug}`);
    if (btn && (!frame || frame.style.display !== "block")) btn.click();
  }

  return (
    <section id="demo" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">See it live</h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          This page uses the same widget you embed on your own site. Open the chat in the
          bottom-right corner, or use the button below.
        </p>

        {slug ? (
          <Button className="mt-6" onClick={openChat}>
            Open demo chat
          </Button>
        ) : (
          <p className="mt-6 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Demo is not configured. Set <code>NEXT_PUBLIC_DEMO_FORM_SLUG</code> to the slug of a
            published form.
          </p>
        )}

        <p className="mt-10 text-sm font-medium">Add it to your website with one line:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted p-4 text-sm">
          <code>{`<script src="https://your-domain.com/widget.js" data-form="YOUR_FORM_ID"></script>`}</code>
        </pre>
      </div>
    </section>
  );
}