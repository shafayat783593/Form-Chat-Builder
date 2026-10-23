import { FileText, LayoutDashboard, LayoutTemplate, MessageSquare } from "lucide-react";
import type { SidebarItems } from "./types";

const prefix = "/admin";

export const adminRoutes: SidebarItems = [
  {
    title: "Management",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
        icon: LayoutDashboard,
      },
      {
        title: "Templates",
        url: `${prefix}/templates`,
        icon: LayoutTemplate,
      },
      {
        title: "Forms",
        url: `${prefix}/forms`,
        icon: FileText,
      },
      {
        title: "Responses",
        url: `${prefix}/responses`,
        icon: MessageSquare,
      },
    ],
  },
];
