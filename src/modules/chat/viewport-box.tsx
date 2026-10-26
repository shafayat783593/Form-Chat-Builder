"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ViewportBoxProps {
  className?: string;
  children: ReactNode;
}


export function ViewportBox({ className, children }: ViewportBoxProps) {
  const [area, setArea] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    function update() {
      if (!viewport) return;
      setArea({ top: viewport.offsetTop, height: viewport.height });
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        left: 0,
        width: "100%",
        top: area?.top ?? 0,
        height: area?.height ?? "100dvh",
      }}
    >
      {children}
    </div>
  );
}
