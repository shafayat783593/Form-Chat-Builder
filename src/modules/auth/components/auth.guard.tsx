"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useGetLoggedInUser } from "@/hooks/use-get-logged-in-user";
import AuthLoading from "./auth.loading";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isPending, isError } = useGetLoggedInUser();

  useEffect(() => {
    if (isPending) return;
    if (isError || !user) {
      router.replace("/login");
    }
  }, [isPending, isError, user, router]);

  if (isPending) {
    return <AuthLoading />;
  }

  if (isError || !user) {
    return <AuthLoading label="Redirecting..." />;
  }

  return <>{children}</>;
}
