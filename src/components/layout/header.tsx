"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: { email?: string; name?: string } | null;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, user, actions }: HeaderProps) {
  const initials = getInitials(user?.name ?? "", user?.email?.[0]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--nova-border)] bg-[var(--nova-surface)]/80 backdrop-blur-xl px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-[var(--nova-text)] leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-xs text-[var(--nova-muted)]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {actions}
        <ThemeToggle />
        <Avatar className="h-7 w-7 ml-1">
          <AvatarFallback className="bg-[var(--nova-accent-dim)] text-[var(--nova-accent)] text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
