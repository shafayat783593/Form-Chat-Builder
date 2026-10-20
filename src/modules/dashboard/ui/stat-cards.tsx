import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
  trend?: string;
  tone?: "violet" | "green" | "amber" | "blue";
}

const toneStyles: Record<NonNullable<StatItem["tone"]>, string> = {
  violet: "bg-primary/12 text-primary",
  green: "bg-success/12 text-success",
  amber: "bg-warning/15 text-warning",
  blue: "bg-info/12 text-info",
};

export interface StatCardsProps {
  stats: StatItem[];
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="card-hover rounded-2xl border bg-card p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "grid size-10 place-items-center rounded-xl",
                toneStyles[s.tone ?? "violet"],
              )}
            >
              <s.icon className="size-5" />
            </span>
            {s.trend ? (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                <TrendingUp className="size-3" />
                {s.trend}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-[26px] leading-none font-bold tracking-tight">
            {s.value}
          </p>
          <p className="mt-1.5 text-[13px] font-semibold">{s.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
        </div>
      ))}
    </div>
  );
}