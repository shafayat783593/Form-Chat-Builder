"use client";

/**
 * The copyright year is rendered on the client so the server can prerender the
 * page without hitting Next.js's "unstable value new Date()" error.
 */
export function Copyright() {
  const year = new Date().getFullYear();
  return <>© {year} FormChat. All rights reserved.</>;
}
