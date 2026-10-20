"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function CloseBar() {
  useEffect(() => {
    function onClose() {
      window.parent.postMessage({ type: "fw:close" }, "*");
    }
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        window.parent.postMessage({ type: "fw:close" }, "*");
      }}
      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      aria-label="Close chat"
    >
      <X className="size-5" />
      <span className="sr-only">Close chat</span>
    </button>
  );
}

