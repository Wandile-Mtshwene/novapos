"use client";

import {
  TrendingUp, Users2, CreditCard, Scissors, Package, UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";

interface DailyRevenue {
  date: string;
  revenue: number;
  sales: number;
}

interface RevenueSummary {
  total_revenue: number;
  total_sales: number;
  total_appointments: number;
}

interface ReportsViewProps {
  summary: RevenueSummary;
  dailyRevenue: DailyRevenue[];
  customerCount: number;
}

const CHART_COLORS = {
  accent: "#8B5CF6",
  accentLight: "rgba(139, 92, 246, 0.15)",
  emerald: "#10B981",
  emeraldLight: "rgba(16, 185, 129, 0.15)",
};

function CustomTooltip({ active, payload, label, currency }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-3 shadow-lg">
      <p className="text-xs text-[var(--nova-muted)] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[var(--nova-text)]">
        {currency ? formatCurrency(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
}

export function ReportsView({ summary, dailyRevenue, customerCount }: ReportsViewProps) {
  const revenueData = dailyRevenue.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="p-6 space-y-8">
      {/* Summary stats */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--nova-text)] mb-3">Last 30 Days</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(summary.total_revenue)}
            icon={CreditCard}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <StatCard
            label="Appointments"
            value={String(summary.total_appointments)}
            icon={TrendingUp}
            iconColor="text-[var(--nova-accent)]"
            iconBg="bg-[var(--nova-accent-dim)]"
          />
          <StatCard
            label="Total Customers"
            value={String(customerCount)}
            icon={Users2}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <StatCard
            label="Total Sales"
            value={String(summary.total_sales)}
            icon={Package}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Revenue Trend</h3>
          {revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-[var(--nova-muted)]">No sales recorded yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--nova-tint-3)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--nova-dim)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--nova-dim)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R${v}`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip currency />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.accent}
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Sales by Day</h3>
          {revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-[var(--nova-muted)]">No sales recorded yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--nova-tint-3)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--nova-dim)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--nova-dim)" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="sales"
                  fill={CHART_COLORS.accent}
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Empty top lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "Top Services", icon: Scissors },
          { label: "Top Staff", icon: UserCheck },
          { label: "Top Customers", icon: Users2 },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
            <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">{label}</h3>
            <div className="flex flex-col items-center justify-center h-32">
              <Icon size={24} className="text-[var(--nova-dim)] mb-2" />
              <p className="text-xs text-[var(--nova-muted)]">No data yet</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
