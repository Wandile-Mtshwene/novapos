"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  CreditCard,
  Users2,
  Scissors,
  Package,
  Warehouse,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NovaLogo } from "@/components/nova-logo";
import { authClient } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
      { label: "Appointments", href: "/dashboard/appointments", icon: Clock },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Checkout", href: "/dashboard/checkout", icon: CreditCard },
      { label: "Customers", href: "/dashboard/customers", icon: Users2 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Services", href: "/dashboard/services", icon: Scissors },
      { label: "Products", href: "/dashboard/products", icon: Package },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Inventory", href: "/dashboard/inventory", icon: Warehouse },
      { label: "Staff", href: "/dashboard/staff", icon: UserCheck },
    ],
  },
  {
    label: "Reporting",
    items: [
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
];

type UserRole = "owner" | "admin" | "manager" | "cashier" | "staff" | "viewer";

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier",
  staff: "Staff",
  viewer: "Viewer",
};

interface SidebarProps {
  user: { name: string; email: string };
  role: UserRole;
}

function getInitials(name: string, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "?";
}

export function Sidebar({ user, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("novapos-sidebar");
    if (stored === "collapsed") setCollapsed(true);
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("novapos-sidebar", next ? "collapsed" : "expanded");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  const initials = getInitials(user.name, user.email);
  const displayName = user.name || user.email;

  if (!mounted) return <div className="hidden md:block w-60 shrink-0" />;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[var(--nova-border)] bg-[var(--nova-deep)]",
        "transition-[width] duration-300 ease-in-out overflow-hidden shrink-0",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Brand */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-1.5 border-b border-[var(--nova-border)] py-3 px-2">
          <Link href="/dashboard" aria-label="NovaPOS home">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--nova-accent)] to-[var(--nova-accent-secondary)] flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
          </Link>
          <Tooltip>
            <TooltipTrigger
              onClick={toggleCollapsed}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)] transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronsRight size={15} />
            </TooltipTrigger>
            <TooltipContent side="right">Expand</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex h-16 items-center justify-between border-b border-[var(--nova-border)] px-3">
          <Link href="/dashboard" className="flex items-center">
            <NovaLogo size="sm" />
          </Link>
          <button
            onClick={toggleCollapsed}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft size={15} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-1" : ""}>
            {group.label && !collapsed && (
              <div className="mx-3 mb-1 mt-3">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--nova-dim)]">
                  {group.label}
                </p>
              </div>
            )}
            {group.label && collapsed && (
              <div className="my-1.5 mx-2 h-px bg-[var(--nova-border)]" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const linkClass = cn(
                  "flex h-9 w-full items-center justify-center rounded-lg transition-all duration-150",
                  active
                    ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                    : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)]"
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger
                        render={<Link href={item.href} className={linkClass} aria-label={item.label} />}
                      >
                        <Icon size={17} className="shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                        : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className={cn(
                          "shrink-0",
                          active
                            ? "text-[var(--nova-accent)]"
                            : "text-[var(--nova-muted)] group-hover:text-[var(--nova-text)]"
                        )}
                      />
                      {item.label}
                    </div>
                    {active && <ChevronRight size={13} className="text-[var(--nova-accent)]/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--nova-border)]">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 p-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/dashboard/settings"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      isActive("/dashboard/settings")
                        ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                        : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)]"
                    )}
                    aria-label="Settings"
                  />
                }
              >
                <Settings size={17} />
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--nova-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            <Link
              href="/dashboard/settings"
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive("/dashboard/settings")
                  ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                  : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)]"
              )}
            >
              <Settings
                size={17}
                className={cn(
                  "shrink-0",
                  isActive("/dashboard/settings")
                    ? "text-[var(--nova-accent)]"
                    : "text-[var(--nova-muted)] group-hover:text-[var(--nova-text)]"
                )}
              />
              Settings
            </Link>
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-[var(--nova-accent-dim)] text-[var(--nova-accent)] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-[var(--nova-text)] truncate leading-none">
                    {displayName}
                  </p>
                  <span className="shrink-0 rounded-full bg-[var(--nova-tint-3)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-[var(--nova-dim)]">
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                {user.name && (
                  <p className="mt-0.5 text-[11px] text-[var(--nova-muted)] truncate">
                    {user.email}
                  </p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-[var(--nova-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
