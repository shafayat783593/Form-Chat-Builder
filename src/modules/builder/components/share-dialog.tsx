"use client";

import { useState, type ReactNode } from "react";
import { Code2, ExternalLink, Mail, QrCode, Send, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, SectionTitle } from "./builder-ui";

const LINK_BUTTON =
  "inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Public address of the published form. */
  formUrl: string;
  formTitle: string;
  /** The <script> tag that puts the chat widget on another website. */
  embedCode: string;
}

/** The "your form is live, share it" window. */
export function ShareDialog({
  open,
  onOpenChange,
  formUrl,
  formTitle,
  embedCode,
}: ShareDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share form"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl">
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
          <LinkSection formUrl={formUrl} />
          <MessageSection formUrl={formUrl} formTitle={formTitle} />
          <MoreWaysSection formUrl={formUrl} formTitle={formTitle} embedCode={embedCode} />

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

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function LinkSection({ formUrl }: { formUrl: string }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>Your link</SectionTitle>
      <div className="flex gap-2">
        <input
          readOnly
          value={formUrl}
          onFocus={(event) => event.currentTarget.select()}
          className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-muted/40 px-2.5 font-mono text-xs"
          aria-label="Public form link"
        />
        <CopyButton text={formUrl} className="h-9 shrink-0" />
      </div>
      <a
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Open &amp; test it
        <ExternalLink className="size-3" />
      </a>
    </section>
  );
}

/** A short invitation text the owner can copy or send by email. */
function MessageSection({ formUrl, formTitle }: { formUrl: string; formTitle: string }) {
  const [composing, setComposing] = useState(false);
  const message = readyMessage(formTitle, formUrl);

  function sendByEmail() {
    const subject = encodeURIComponent(formTitle);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>Ready-to-send message</SectionTitle>
      <p className="text-xs text-muted-foreground">
        Paste it into an email, a text, or a group chat. Edit anything you like.
      </p>

      {composing ? (
        <div className="flex flex-col gap-2">
          <textarea
            readOnly
            value={message}
            onFocus={(event) => event.currentTarget.select()}
            rows={5}
            className="w-full resize-none rounded-lg border border-input bg-muted/40 p-3 text-sm"
            aria-label="Ready to send message"
          />
          <div className="flex flex-wrap gap-2">
            <CopyButton text={message} label="Copy message" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={sendByEmail}
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
          onClick={() => setComposing(true)}
        >
          <Send className="size-3.5" />
          Compose message
        </Button>
      )}
    </section>
  );
}

interface MoreWaysSectionProps {
  formUrl: string;
  formTitle: string;
  embedCode: string;
}

function MoreWaysSection({ formUrl, formTitle, embedCode }: MoreWaysSectionProps) {
  // The QR image is drawn by a free public service from the form link.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(formUrl)}`;

  const socialLinks = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${formTitle} ${formUrl}`)}`,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(readyMessage(formTitle, formUrl))}`,
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>More ways to share</SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2">
        <ShareCard icon={<QrCode className="size-4" />} title="QR code" subtitle="Print, posters, counters">
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR code for the form link"
              width={88}
              height={88}
              className="rounded-lg border bg-white p-1"
            />
            <a href={qrUrl} download="form-qr-code.png" className={LINK_BUTTON}>
              <ExternalLink className="size-3.5" />
              Download
            </a>
          </div>
        </ShareCard>

        <ShareCard icon={<Code2 className="size-4" />} title="Embed" subtitle="Add to your website">
          <pre className="mt-3 max-h-24 overflow-auto rounded-lg border bg-card p-2 font-mono text-[10px] whitespace-pre-wrap">
            {embedCode}
          </pre>
          <CopyButton text={embedCode} label="Copy code" className="mt-2" />
        </ShareCard>
      </div>

      <ShareCard
        icon={<Share2 className="size-4" />}
        title="Post it"
        subtitle="Social and professional networks"
      >
        <div className="mt-3 flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_BUTTON}
            >
              {link.name}
              <ExternalLink className="size-3" />
            </a>
          ))}
        </div>
      </ShareCard>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readyMessage(formTitle: string, formUrl: string): string {
  return `Hi! Could you take two minutes to fill out ${formTitle}?\n\n${formUrl}`;
}

interface ShareCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

function ShareCard({ icon, title, subtitle, children }: ShareCardProps) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      {children}
    </div>
  );
}
