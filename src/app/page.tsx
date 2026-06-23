import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ShoppingCart,
  Users,
  Package,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { NovaLogo } from "@/components/nova-logo";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Appointment Calendar",
    description:
      "Book, reschedule, and manage appointments with a clean drag-and-drop calendar view.",
  },
  {
    icon: ShoppingCart,
    title: "POS Checkout",
    description:
      "Fast point-of-sale with services, products, discounts, tips, and multiple payment methods.",
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Build client profiles, track visit history, and add notes to personalise every interaction.",
  },
  {
    icon: Package,
    title: "Inventory Tracking",
    description:
      "Monitor stock levels, log adjustments, and get alerts before you run out of products.",
  },
  {
    icon: UserCheck,
    title: "Staff Management",
    description:
      "Manage your team, assign schedules, track commissions, and control role-based access.",
  },
  {
    icon: BarChart3,
    title: "Reports and Insights",
    description:
      "Revenue charts, daily sales breakdowns, and staff performance data in real-time.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--nova-surface)] text-[var(--nova-text)]">
      {/* Nav */}
      <header className="border-b border-[var(--nova-border)] bg-[var(--nova-surface)]/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <NovaLogo size="sm" />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[var(--nova-muted)] hover:text-[var(--nova-text)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[var(--nova-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start free <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--nova-accent)]/20 bg-[var(--nova-accent-dim)] px-3 py-1 text-xs text-[var(--nova-accent)] mb-6">
          <CalendarDays size={10} />
          Built for appointment-based service businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--nova-text)] leading-tight mb-5">
          Run your service business.{" "}
          <span className="text-[var(--nova-accent)]">Beautifully.</span>
        </h1>
        <p className="text-base text-[var(--nova-muted)] max-w-xl mx-auto mb-8">
          Appointments, POS checkout, inventory and staff management in one
          seamless platform.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--nova-accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start free trial <ArrowRight size={15} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] text-[var(--nova-text)] text-sm hover:bg-[var(--nova-tint-1)] transition-colors"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-xl font-semibold text-[var(--nova-text)] text-center mb-10">
          Everything you need to run your salon, clinic, or studio
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nova-accent-dim)] mb-3">
                  <Icon size={16} className="text-[var(--nova-accent)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-[var(--nova-muted)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl border border-[var(--nova-accent)]/20 bg-[var(--nova-accent-dim)] p-10 text-center">
          <h2 className="text-2xl font-bold text-[var(--nova-text)] mb-2">
            Ready to get started?
          </h2>
          <p className="text-sm text-[var(--nova-muted)] mb-6">
            Create your account in under a minute. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-11 px-8 rounded-xl bg-[var(--nova-accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start free trial <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--nova-border)] py-6">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <NovaLogo size="sm" />
          <p className="text-xs text-[var(--nova-dim)]">
            &copy; {new Date().getFullYear()} NovaPOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
