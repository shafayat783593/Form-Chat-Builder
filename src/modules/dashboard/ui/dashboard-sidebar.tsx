"use client";

import * as React from "react";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { FileText, Home, MessageSquare, PanelsTopLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/modules/auth/components/sign-out-button";
import type { UserRole } from "./types";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: PanelsTopLeft },
      { title: "Forms", url: "/dashboard#forms", icon: FileText },
    ],
  },
  {
    title: "Quick",
    items: [{ title: "Public site", url: "/", icon: Home }],
  },
];

// Only an admin sees the admin area (PRD section 2). The page itself is
// guarded too - this link is convenience, not the security boundary.
const adminNavGroups: NavGroup[] = [
  {
    title: "Admin",
    items: [{ title: "Templates", url: "/admin/templates", icon: ShieldCheck }],
  },
];

function isActiveRoute(pathname: string, url: string) {
  if (url === "#" || url.includes("#")) return false;
  if (pathname === url) return true;
  return url !== "/" && pathname.startsWith(`${url}/`);
}

export function DashboardSidebar({
  role,
  userName,
}: {
  role: UserRole;
  userName: string;
}) {
  const pathname = usePathname();
  const groups = role === "ADMIN" ? [...navGroups, ...adminNavGroups] : navGroups;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-0 pb-2">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent"
        >
          <span className="gradient-brand grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-pop">
            <MessageSquare className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[15px] font-bold tracking-tight">
              FormChat
            </span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              Form Builder
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent className="gap-1 px-2">
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="px-0 py-1">
            <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/80">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const active = isActiveRoute(pathname, item.url);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={active}
                        tooltip={item.title}
                        className={
                          active
                            ? "sidebar-link-active"
                            : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                        }
                      >
                        <Icon />
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

      <SidebarFooter className="gap-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-card/60 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <span className="gradient-brand grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[13px] font-semibold">{userName}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {role.toLowerCase()}
            </span>
          </span>
        </div>

        <div className="group-data-[collapsible=icon]:hidden">
          <SignOutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
