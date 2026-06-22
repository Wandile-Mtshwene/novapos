import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--nova-accent-dim)] mb-5">
        <Icon size={28} className="text-[var(--nova-accent)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--nova-text)]">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-[var(--nova-muted)] leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-5">
          <Button
            onClick={action.onClick}
            className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white"
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
