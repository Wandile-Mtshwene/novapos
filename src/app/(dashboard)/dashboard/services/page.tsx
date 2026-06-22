import { Header } from "@/components/layout/header";
import { ServicesView } from "@/components/services/services-view";
import { getOrgSession } from "@/lib/auth/session";
import { listServices, listServiceCategories } from "@/lib/db/queries/services";

export const metadata = { title: "Services | NovaPOS" };

export default async function ServicesPage() {
  const { user, orgId } = await getOrgSession();
  const [services, categories] = await Promise.all([
    listServices(orgId),
    listServiceCategories(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Services"
        subtitle="Manage your service catalog and pricing."
        user={user}
      />
      <div className="flex-1 overflow-y-auto">
        <ServicesView services={services} categories={categories} />
      </div>
    </div>
  );
}
