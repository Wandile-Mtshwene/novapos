import {
  CalendarDays,
  CreditCard,
  Users2,
  TrendingUp,
  Clock,
  Package,
  UserCheck,
  Scissors,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "./stat-card";

interface OverviewProps {
  userName: string;
}

const QUICK_LINKS = [
  {
    label: "New Appointment",
    href: "/dashboard/appointments",
    icon: CalendarDays,
    desc: "Book a service for a customer",
  },
  {
    label: "New Sale",
    href: "/dashboard/checkout",
    icon: CreditCard,
    desc: "Start a checkout transaction",
  },
  {
    label: "Add Customer",
    href: "/dashboard/customers",
    icon: Users2,
    desc: "Register a new customer profile",
  },
  {
    label: "Manage Services",
    href: "/dashboard/services",
    icon: Scissors,
    desc: "Edit your service catalog",
  },
];

export function DashboardOverview({ userName }: OverviewProps) {
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-8">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--nova-text)]">
            Welcome back, {firstName}
          </h2>
          <p className="mt-1 text-sm text-[var(--nova-muted)]">
            Here is a snapshot of your business today.
          </p>
        </div>

        {/* Setup checklist */}
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--nova-text)]">Get started</h3>
              <p className="text-xs text-[var(--nova-muted)] mt-0.5">
                Complete these steps to set up your business on NovaPOS.
              </p>
            </div>
            <span className="text-xs text-[var(--nova-muted)]">0 / 4</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Add your first service", href: "/dashboard/services", icon: Scissors },
              { label: "Add your first product", href: "/dashboard/products", icon: Package },
              { label: "Add your staff members", href: "/dashboard/staff", icon: UserCheck },
              { label: "Book your first appointment", href: "/dashboard/calendar", icon: CalendarDays },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--nova-tint-2)]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--nova-border)]">
                  <Icon size={13} className="text-[var(--nova-muted)]" />
                </div>
                <span className="text-sm text-[var(--nova-muted)]">{label}</span>
                <div className="ml-auto">
                  <TrendingUp size={13} className="text-[var(--nova-accent)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Appointments Today"
            value="0"
            icon={Clock}
            iconColor="text-[var(--nova-accent)]"
            iconBg="bg-[var(--nova-accent-dim)]"
          />
          <StatCard
            label="Revenue Today"
            value="R 0.00"
            icon={CreditCard}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <StatCard
            label="Active Customers"
            value="0"
            icon={Users2}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <StatCard
            label="Staff On Duty"
            value="0"
            icon={UserCheck}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
          />
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-3">Quick Actions</h3>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {QUICK_LINKS.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-4 transition-all hover:border-[var(--nova-accent)]/40 hover:bg-[var(--nova-card-hover)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--nova-accent-dim)] mb-3">
                  <Icon size={16} className="text-[var(--nova-accent)]" />
                </div>
                <div className="text-sm font-semibold text-[var(--nova-text)] group-hover:text-[var(--nova-accent)] transition-colors">
                  {label}
                </div>
                <div className="mt-1 text-xs text-[var(--nova-muted)]">{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
