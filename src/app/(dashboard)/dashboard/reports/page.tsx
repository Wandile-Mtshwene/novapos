import { Header } from "@/components/layout/header";
import { ReportsView } from "@/components/reports/reports-view";
import { getOrgSession } from "@/lib/auth/session";
import { getRevenueSummary, getDailyRevenue } from "@/lib/db/queries/sales";
import { countCustomers } from "@/lib/db/queries/customers";

export const metadata = { title: "Reports | NovaPOS" };

export default async function ReportsPage() {
  const { user, orgId } = await getOrgSession();

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 30);

  const [rawSummary, rawDaily, customerCount] = await Promise.all([
    getRevenueSummary(orgId, from, now),
    getDailyRevenue(orgId, from, now),
    countCustomers(orgId),
  ]);

  const summary = {
    total_revenue: rawSummary.revenue,
    total_sales: rawSummary.count,
    total_appointments: 0,
  };

  const dailyRevenue = rawDaily.map((d) => ({
    date: d.day,
    revenue: d.revenue,
    sales: d.count,
  }));

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reports"
        subtitle="Revenue, appointments, and performance insights."
        user={user}
      />
      <div className="flex-1 overflow-y-auto">
        <ReportsView
          summary={summary}
          dailyRevenue={dailyRevenue}
          customerCount={customerCount}
        />
      </div>
    </div>
  );
}
