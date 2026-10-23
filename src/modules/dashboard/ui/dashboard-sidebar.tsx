"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogsIcon } from "lucide-react";
import { SignOutButton } from "@/modules/auth/components/sign-out-button";
import type { SidebarItems, UserRole } from "./types";
import { adminRoutes } from "@/routes/admin.route";
import { ownerRoutes } from "@/routes/owner.route";

const sidebarRoutes: Record<UserRole, SidebarItems> = {
  ADMIN: adminRoutes,
  OWNER: ownerRoutes,
};

function isActiveRoute(pathname: string, url: string) {
  const [path] = url.split("#");
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function DashboardSidebar({
  role,
  userName,
}: {
  role: UserRole;
  userName: string;
}) {
  const pathname = usePathname();
  const routes = sidebarRoutes[role] ?? [];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <LogsIcon className="size-5" />
            <span className="text-sm font-semibold">FormChat</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent>
        {routes.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActiveRoute(pathname, item.url)}
                      >
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{userName}</span>
            <span className="text-xs text-muted-foreground">{role.toLowerCase()}</span>
          </span>
        </div>
        <SignOutButton />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
