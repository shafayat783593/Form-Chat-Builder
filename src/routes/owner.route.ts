import { FileText, Home, LayoutTemplate, MessageSquare, PanelsTopLeft } from "lucide-react";
import type { SidebarItems } from "./types";

const prefix = "/owner";

export const ownerRoutes: SidebarItems = [
  {
    title: "Workspace",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
        icon: PanelsTopLeft,
      },
      {
        title: "Forms",
        url: `${prefix}/forms`,
        icon: FileText,
      },
      { title: "Responses", url: `${prefix}/responses`, icon: MessageSquare },
      { title: "Templates", url: `${prefix}/templates`, icon: LayoutTemplate },
    ],
  },
  {
    title: "Quick",
    items: [
      {
        title: "Public site",
        url: "/",
        icon: Home,
      },
    ],
  },
];
