"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BuilderActions,
  BuilderSettings,
  ClientQuestion,
  FormStatus,
} from "../builder-state";
import { GeneralTab } from "./tabs/general-tab";
import { StyleTab } from "./tabs/style-tab";
import { NotificationsTab } from "./tabs/notifications-tab";
import { PrefillTab } from "./tabs/prefill-tab";

interface SettingsPanelProps {
  settings: BuilderSettings;
  questions: ClientQuestion[];
  slug: string;
  status: FormStatus;
  publishing: boolean;
  onUpdateSettings: BuilderActions["updateSettings"];
  onUpdateQuestion: BuilderActions["updateQuestion"];
  onShare: () => void;
  onUnpublish: () => void;
}

/** The right panel: the four tabs of form settings. */
export function SettingsPanel({
  settings,
  questions,
  slug,
  status,
  publishing,
  onUpdateSettings,
  onUpdateQuestion,
  onShare,
  onUnpublish,
}: SettingsPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold tracking-tight">Form Settings</h2>
      </div>

      <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col px-3">
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
              publishing={publishing}
              onUpdate={onUpdateSettings}
              onShare={onShare}
              onUnpublish={onUnpublish}
            />
          </TabsContent>
          <TabsContent value="style" className="pt-4">
            <StyleTab settings={settings} onUpdate={onUpdateSettings} />
          </TabsContent>
          <TabsContent value="notifications" className="pt-4">
            <NotificationsTab settings={settings} onUpdate={onUpdateSettings} />
          </TabsContent>
          <TabsContent value="prefill" className="pt-4">
            <PrefillTab questions={questions} slug={slug} onUpdateQuestion={onUpdateQuestion} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
