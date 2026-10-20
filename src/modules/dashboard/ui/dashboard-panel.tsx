import { cn } from "@/lib/utils";

export interface DashboardPanelProps {
  id?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardPanel({
  id,
  title,
  subtitle,
  action,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      id={id}
      className={cn("rounded-2xl border bg-card p-5 shadow-soft sm:p-6", className)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
