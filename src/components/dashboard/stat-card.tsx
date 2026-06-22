import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  iconColor = "text-[var(--nova-accent)]",
  iconBg = "bg-[var(--nova-accent-dim)]",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5 transition-all hover:border-[var(--nova-border-strong)]",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconBg)}>
          <Icon size={17} className={iconColor} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              trend.up
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            )}
          >
            {trend.up ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-[var(--nova-text)] leading-none">{value}</div>
      <div className="mt-1 text-xs text-[var(--nova-muted)]">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-[var(--nova-dim)]">{sub}</div>}
    </div>
  );
}
