"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  Users2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays, exact: false },
  { label: "Checkout", href: "/dashboard/checkout", icon: CreditCard, exact: false },
  { label: "Customers", href: "/dashboard/customers", icon: Users2, exact: false },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-[var(--nova-border)] bg-[var(--nova-deep)]/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              isActive
                ? "text-[var(--nova-accent)]"
                : "text-[var(--nova-muted)] hover:text-[var(--nova-text)]"
            )}
          >
            <item.icon
              size={20}
              className={cn("shrink-0", isActive && "stroke-[2.5px]")}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
