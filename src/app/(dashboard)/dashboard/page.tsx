import { Header } from "@/components/layout/header";
import { DashboardOverview } from "@/components/dashboard/overview";
import { getOrgSession } from "@/lib/auth/session";

export const metadata = { title: "Dashboard | NovaPOS" };

export default async function DashboardPage() {
  const { user } = await getOrgSession();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Your business at a glance."
        user={user}
      />
      <DashboardOverview userName={user.name ?? user.email} />
    </div>
  );
}
