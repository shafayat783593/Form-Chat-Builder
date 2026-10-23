"use client";

import { X } from "lucide-react";

interface CloseBarProps {
  /**
   * When provided it is called instead of posting `fw:close` to the host page.
   * The host page uses it to collapse the chat into a launcher.
   */
  onClose?: () => void;
  className?: string;
}

/**
 * The close control of the chat frame.
 *
 * In the embed the chat lives in an iframe, so closing tells the host page
 * (the widget) to close its panel by posting `{type:"fw:close"}`.
 */
export function CloseBar({ onClose, className }: CloseBarProps) {
  function close() {
    if (onClose) {
      onClose();
      return;
    }
    try {
      window.parent.postMessage({ type: "fw:close" }, "*");
    } catch {
      // A cross-origin parent can throw; the close is best-effort.
    }
  }

  return (
    <button
      type="button"
      onClick={close}
      className={
        className ??
        "grid size-8 shrink-0 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      }
      aria-label="Close chat"
    >
      <X className="size-5" />
      <span className="sr-only">Close chat</span>
    </button>
  );
}
