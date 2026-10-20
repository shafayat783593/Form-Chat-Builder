"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Code2,
  Send,
  Mail,
  X,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Public URL of the published form. */
  formUrl: string;
  formTitle: string;
  /** Embed snippet for the widget. */
  embedCode: string;
}

function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the text is selectable in the field anyway.
    }
  }

  return (
    <Button
      type="button"
      onClick={copy}
      variant="outline"
      size="sm"
      className={cn("gap-1.5", className)}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function ShareDialog({
  open,
  onOpenChange,
  formUrl,
  formTitle,
  embedCode,
}: ShareDialogProps) {
  const [showMessage, setShowMessage] = useState(false);

  const readyMessage = `Hi! Could you take two minutes to fill out ${formTitle}?\n\n${formUrl}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    formUrl,
  )}`;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        open ? "flex" : "hidden"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Share form"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 rounded-t-2xl bg-foreground p-5 text-background">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-base font-semibold">
              <span className="size-2 rounded-full bg-success" />
              Your form is live — share it!
            </p>
            <p className="mt-1 text-sm text-background/80">
              Send this link to the people you want answers from.{" "}
              <em>Start with a few people who are ready to respond.</em>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-background/10"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-5">
          {/* Your link */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Your link
            </h3>
            <div className="flex gap-2">
              <input
                readOnly
                value={formUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-muted/40 px-2.5 font-mono text-xs"
                aria-label="Public form link"
              />
              <CopyButton value={formUrl} className="h-9 shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
              >
                Open &amp; test it
                <ExternalLink className="size-3" />
              </a>
            </div>
          </section>

          {/* Ready to send message */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Ready-to-send message
            </h3>
            <p className="text-xs text-muted-foreground">
              Paste it into an email, a text, or a group chat. Edit anything you like.
            </p>
            {showMessage ? (
              <div className="flex flex-col gap-2">
                <textarea
                  readOnly
                  value={readyMessage}
                  onFocus={(e) => e.currentTarget.select()}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-input bg-muted/40 p-3 text-sm"
                  aria-label="Ready to send message"
                />
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={readyMessage} label="Copy message" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      const href = `mailto:?subject=${encodeURIComponent(formTitle)}&body=${encodeURIComponent(
                        readyMessage,
                      )}`;
                      window.location.href = href;
                    }}
                  >
                    <Mail className="size-3.5" />
                    Send by email
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={() => setShowMessage(true)}
              >
                <Send className="size-3.5" />
                Compose message
              </Button>
            )}
          </section>

          {/* More ways to share */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              More ways to share
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* QR code */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <QrCode className="size-4" />
                  <p className="text-sm font-semibold">QR code</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Print, posters, counters</p>
                <div className="mt-3 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="QR code for the form link"
                    width={88}
                    height={88}
                    className="rounded-lg border bg-white p-1"
                  />
                  <a
                    href={qrUrl}
                    download="form-qr-code.png"
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <ExternalLink className="size-3.5" />
                    Download
                  </a>
                </div>
              </div>

              {/* Embed */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Code2 className="size-4" />
                  <p className="text-sm font-semibold">Embed</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Add to your website</p>
                <pre className="mt-3 max-h-24 overflow-auto rounded-lg border bg-card p-2 font-mono text-[10px] whitespace-pre-wrap">
                  {embedCode}
                </pre>
                <CopyButton value={embedCode} label="Copy code" className="mt-2" />
              </div>
            </div>

            {/* Social */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Share2 className="size-4" />
                <p className="text-sm font-semibold">Post it</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Social and professional networks
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `${formTitle} ${formUrl}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  X
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  LinkedIn
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  Facebook
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(readyMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  WhatsApp
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
