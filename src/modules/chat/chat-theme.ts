/**
 * Fixed light palette for public surfaces (widget, embed, chat).
 *
 * The chat is rendered on someone else's website, so it must NOT depend on the
 * dashboard theme tokens (`bg-background`, `text-muted-foreground`, ...). A
 * visitor whose OS is in dark mode would otherwise see a broken widget.
 * Only `themeColor` (owned by the form) may change.
 */
export const PALETTE = {
  page: "#ffffff",
  surface: "#ffffff",
  surfaceMuted: "#f1f5f9",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  visitorBubble: "#4f46e5",
  visitorText: "#ffffff",
  danger: "#dc2626",
  dangerSurface: "#fef2f2",
  focusRing: "#4f46e5",
} as const;

/** Class names that keep the focus ring visible on every interactive element. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
