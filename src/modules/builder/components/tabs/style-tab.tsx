"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESET_THEMES: { name: string; color: string }[] = [
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

const FONT_COMBINATIONS = [
  { name: "System Default", heading: "Sample Heading Text", body: "Body text appears like this in your form.", headingFont: "system-ui", bodyFont: "system-ui" },
  { name: "Editorial", heading: "Sample Heading Text", body: "Body text appears like this in your form.", headingFont: "Georgia, serif", bodyFont: "system-ui" },
  { name: "Modern Grotesk", heading: "Sample Heading Text", body: "Body text appears like this in your form.", headingFont: "Inter, system-ui", bodyFont: "Inter, system-ui" },
];

interface StyleTabProps {
  settings: {
    title: string;
    description: string | null;
    themeColor: string;
    launcherLabel: string;
    widgetPosition: "RIGHT" | "LEFT";
  };
  onUpdate: (patch: Partial<StyleTabProps["settings"]>) => void;
}

export function StyleTab({ settings, onUpdate }: StyleTabProps) {
  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Live preview */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Live Preview
        </h3>
        <div className="rounded-xl border border-input bg-muted/40 p-4">
          <p
            className="text-base font-semibold"
            style={{ color: settings.themeColor }}
          >
            {settings.title || "Sample Form Title"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {settings.description ||
              "This is how your form will look with the selected theme. Try different combinations!"}
          </p>
          <Input
            readOnly
            placeholder="Sample input field"
            className="mt-3 h-9 bg-background"
          />
          <button
            type="button"
            className="mt-3 h-9 w-full rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: settings.themeColor }}
          >
            Submit Button
          </button>
        </div>
      </section>

      {/* Preset themes */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Preset Themes
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_THEMES.map((theme) => {
            const active = settings.themeColor.toLowerCase() === theme.color.toLowerCase();
            return (
              <button
                key={theme.name}
                type="button"
                onClick={() => onUpdate({ themeColor: theme.color })}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                  active
                    ? "border-foreground/25 bg-muted"
                    : "border-input bg-card hover:bg-muted/60"
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
            onChange={(e) => onUpdate({ themeColor: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded-lg border-0 p-0"
            aria-label="Custom theme color"
          />
          <Input
            value={settings.themeColor}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (/^#[0-9a-fA-F]{6}$/.test(v)) onUpdate({ themeColor: v });
            }}
            className="h-8 font-mono text-xs"
            aria-label="Theme color hex"
          />
        </div>
      </section>

      {/* Font combinations */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Font Combinations
        </h3>
        <div className="flex flex-col gap-2">
          {FONT_COMBINATIONS.map((font) => (
            <div
              key={font.name}
              className="rounded-lg border border-input bg-card p-3"
            >
              <p className="text-xs font-medium">{font.name}</p>
              <p
                className="mt-1 text-sm font-semibold"
                style={{ fontFamily: font.headingFont }}
              >
                {font.heading}
              </p>
              <p
                className="mt-0.5 text-xs text-muted-foreground"
                style={{ fontFamily: font.bodyFont }}
              >
                {font.body}
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/80">
                H: {font.headingFont} · B: {font.bodyFont}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Launcher */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Widget
        </h3>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="launcher-label">
            Launcher label
          </label>
          <Input
            id="launcher-label"
            value={settings.launcherLabel}
            onChange={(e) => onUpdate({ launcherLabel: e.target.value })}
            maxLength={30}
            className="h-8"
          />
          <p className="text-[11px] text-muted-foreground">
            {settings.launcherLabel.length}/30
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Widget position</span>
          <div className="grid grid-cols-2 gap-2">
            {(["RIGHT", "LEFT"] as const).map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => onUpdate({ widgetPosition: position })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  settings.widgetPosition === position
                    ? "border-transparent bg-foreground text-background"
                    : "border-input bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {position === "RIGHT" ? "Right" : "Left"}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
