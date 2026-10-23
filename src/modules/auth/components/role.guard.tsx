"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useGetLoggedInUser } from "@/hooks/use-get-logged-in-user";
import type { Role } from "@/lib/roles";
import AccessDenied from "./access-denied";
import AuthLoading from "./auth.loading";

interface IProps {
  children: ReactNode;
  roles: Role[];
}

export default function RoleGuard({ children, roles }: IProps) {
  const router = useRouter();
  const { user, role, isPending, isError } = useGetLoggedInUser();

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

  const isAuthorized = !!role && roles.includes(role);

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
