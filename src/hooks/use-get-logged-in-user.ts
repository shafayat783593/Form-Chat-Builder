"use client";

import { authClient } from "@/lib/auth-client";
import { getRole } from "@/lib/roles";

export function useGetLoggedInUser() {
  const { data, isPending, isRefetching, error, refetch } = authClient.useSession();

  const user = data?.user ?? null;

  return {
    data,
    user,
    role: user ? getRole(user as { role?: unknown }) : null,
    isPending,
    isRefetching,
    isError: Boolean(error),
    refetch,
  };
}
