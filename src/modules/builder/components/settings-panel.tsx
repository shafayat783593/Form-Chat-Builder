"use client";

import * as React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { GeneralTab } from "./tabs/general-tab";
import { StyleTab } from "./tabs/style-tab";
import { NotificationsTab } from "./tabs/notifications-tab";
import { PrefillTab } from "./tabs/prefill-tab";
import type { BuilderSettings } from "../use-builder-state";

interface SettingsPanelProps {
  settings: BuilderSettings;
  questions: Array<{ clientId: string; id?: string; label: string; prefillKey?: string | null }>;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishing?: boolean;
  onUpdate: (patch: Partial<BuilderSettings>) => void;
  onUpdateQuestion: (clientId: string, patch: { prefillKey?: string | null }) => void;
  onShare?: () => void;
  onUnpublish?: () => void;
}

export function SettingsPanel({
  settings,
  questions,
  slug,
  status,
  publishing,
  onUpdate,
  onUpdateQuestion,
  onShare,
  onUnpublish,
}: SettingsPanelProps) {
  const [tab, setTab] = React.useState<"general" | "style" | "notifications" | "prefill">("general");

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold tracking-tight">Form Settings</h2>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col px-3">
        <TabsList className="w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="prefill">Prefill</TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="general" className="pt-4">
            <GeneralTab
              settings={settings}
              status={status}
              onUpdate={onUpdate}
              onShare={onShare}
              onUnpublish={onUnpublish}
              publishing={publishing}
            />
          </TabsContent>
          <TabsContent value="style" className="pt-4">
            <StyleTab settings={settings} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="notifications" className="pt-4">
            <NotificationsTab settings={settings} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="prefill" className="pt-4">
            <PrefillTab
              questions={questions}
              slug={slug}
              onUpdateQuestion={onUpdateQuestion}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
