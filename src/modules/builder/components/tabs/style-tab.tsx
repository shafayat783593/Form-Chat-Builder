"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BuilderSettings } from "../../builder-state";
import { SectionTitle } from "../builder-ui";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const PRESET_THEMES = [
  { name: "Default Blue", color: "#3b82f6" },
  { name: "Modern Green", color: "#10b981" },
  { name: "Professional Dark", color: "#4f46e5" },
  { name: "Warm Orange", color: "#f97316" },
  { name: "Elegant Purple", color: "#a855f7" },
  { name: "Ocean Blue", color: "#0ea5e9" },
  { name: "Forest Green", color: "#059669" },
  { name: "Sunset Red", color: "#ef4444" },
  { name: "Golden Yellow", color: "#eab308" },
  { name: "Rose Pink", color: "#f43f5e" },
  { name: "Slate Modern", color: "#64748b" },
  { name: "Minimalist White", color: "#111827" },
];

// Samples only: they show how a font pairing looks, they are not saved anywhere.
const FONT_SAMPLES = [
  { name: "System Default", headingFont: "system-ui", bodyFont: "system-ui" },
  { name: "Editorial", headingFont: "Georgia, serif", bodyFont: "system-ui" },
  { name: "Modern Grotesk", headingFont: "Inter, system-ui", bodyFont: "Inter, system-ui" },
];

const WIDGET_POSITIONS = [
  { value: "RIGHT", label: "Right" },
  { value: "LEFT", label: "Left" },
] as const;

type StyleSettings = Pick<
  BuilderSettings,
  "title" | "description" | "themeColor" | "launcherLabel" | "widgetPosition"
>;

interface StyleTabProps {
  settings: StyleSettings;
  onUpdate: (patch: Partial<StyleSettings>) => void;
}

/** Theme colour and the look of the chat bubble that opens the widget. */
export function StyleTab({ settings, onUpdate }: StyleTabProps) {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <LivePreview settings={settings} />

      <section className="flex flex-col gap-2">
        <SectionTitle>Preset Themes</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_THEMES.map((theme) => {
            const isActive = settings.themeColor.toLowerCase() === theme.color;
            return (
              <button
                key={theme.name}
                type="button"
                onClick={() => onUpdate({ themeColor: theme.color })}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                  isActive ? "border-foreground/25 bg-muted" : "border-input bg-card hover:bg-muted/60",
                )}
              >
                <span
                  className="size-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="truncate">{theme.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <Input
            type="color"
            value={settings.themeColor}
            onChange={(event) => onUpdate({ themeColor: event.target.value })}
            className="h-8 w-10 cursor-pointer rounded-lg border-0 p-0"
            aria-label="Custom theme color"
          />
          <Input
            value={settings.themeColor}
            onChange={(event) => {
              const value = event.target.value.trim();
              if (HEX_COLOR.test(value)) onUpdate({ themeColor: value });
            }}
            className="h-8 font-mono text-xs"
            aria-label="Theme color hex"
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionTitle>Font Combinations</SectionTitle>
        <div className="flex flex-col gap-2">
          {FONT_SAMPLES.map((font) => (
            <div key={font.name} className="rounded-lg border border-input bg-card p-3">
              <p className="text-xs font-medium">{font.name}</p>
              <p className="mt-1 text-sm font-semibold" style={{ fontFamily: font.headingFont }}>
                Sample Heading Text
              </p>
              <p
                className="mt-0.5 text-xs text-muted-foreground"
                style={{ fontFamily: font.bodyFont }}
              >
                Body text appears like this in your form.
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/80">
                H: {font.headingFont} · B: {font.bodyFont}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionTitle>Widget</SectionTitle>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="launcher-label">
            Launcher label
          </label>
          <Input
            id="launcher-label"
            value={settings.launcherLabel}
            onChange={(event) => onUpdate({ launcherLabel: event.target.value })}
            maxLength={30}
            className="h-8"
          />
          <p className="text-[11px] text-muted-foreground">{settings.launcherLabel.length}/30</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Widget position</span>
          <div className="grid grid-cols-2 gap-2">
            {WIDGET_POSITIONS.map((position) => (
              <button
                key={position.value}
                type="button"
                onClick={() => onUpdate({ widgetPosition: position.value })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  settings.widgetPosition === position.value
                    ? "border-transparent bg-foreground text-background"
                    : "border-input bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {position.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** A small sample form that follows the chosen theme colour. */
function LivePreview({ settings }: { settings: StyleSettings }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>Live Preview</SectionTitle>
      <div className="rounded-xl border border-input bg-muted/40 p-4">
        <p className="text-base font-semibold" style={{ color: settings.themeColor }}>
          {settings.title || "Sample Form Title"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {settings.description ||
            "This is how your form will look with the selected theme. Try different combinations!"}
        </p>
        <Input readOnly placeholder="Sample input field" className="mt-3 h-9 bg-background" />
        <button
          type="button"
          className="mt-3 h-9 w-full rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: settings.themeColor }}
        >
          Submit Button
        </button>
      </div>
    </section>
  );
}
