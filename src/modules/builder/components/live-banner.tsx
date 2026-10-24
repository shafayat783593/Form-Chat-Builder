"use client";

import { Check, Copy, Eye, Inbox, Share2 } from "lucide-react";
import { useCopy } from "./builder-ui";

interface LiveBannerProps {
  formUrl: string;
  responseCount: number;
  onShare: () => void;
  /** Where the "Responses" link goes. Hidden when missing (templates have no responses). */
  responsesHref?: string;
}

/** The dark strip shown under the top bar while the form is published. */
export function LiveBanner({ formUrl, responseCount, onShare, responsesHref }: LiveBannerProps) {
  const { copied, copy } = useCopy(formUrl);

  const responseSummary =
    responseCount > 0
      ? `${responseCount} response${responseCount === 1 ? "" : "s"} so far`
      : "waiting for its first response";

  return (
    <div className="flex flex-col gap-3 bg-foreground px-4 py-4 text-background sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="size-2 shrink-0 rounded-full bg-success" />
            Your form is live — {responseSummary}
          </p>
          <p className="mt-1 text-xs text-background/75">
            Send the link to the people you want answers from.{" "}
            <em>Start with a few people who are ready to respond.</em>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-background px-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            <Eye className="size-4" />
            Open &amp; test it
          </a>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-background/30 px-3 text-sm font-medium transition-colors hover:bg-background/10"
          >
            <Share2 className="size-4" />
            Share
          </button>
          {responsesHref ? (
            <a
              href={responsesHref}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              <Inbox className="size-4" />
              Responses
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex max-w-xl gap-2">
        <input
          readOnly
          value={formUrl}
          onFocus={(event) => event.currentTarget.select()}
          aria-label="Public form link"
          className="h-8 min-w-0 flex-1 rounded-lg border border-background/20 bg-background/10 px-2.5 font-mono text-xs text-background"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-background px-3 text-xs font-medium text-foreground transition-opacity hover:opacity-90"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
