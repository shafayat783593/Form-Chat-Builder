"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**

 *
 * On the server it uses NEXT_PUBLIC_APP_URL; in the browser it uses the real
 * address. `useSyncExternalStore` lets the two differ without a hydration warning.
 */
export function useAppOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => process.env.NEXT_PUBLIC_APP_URL ?? "",
  );
}
