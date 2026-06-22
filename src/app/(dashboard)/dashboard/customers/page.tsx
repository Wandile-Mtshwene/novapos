import { Header } from "@/components/layout/header";
import { CustomersView } from "@/components/customers/customers-view";
import { getOrgSession } from "@/lib/auth/session";
import { listCustomers } from "@/lib/db/queries/customers";

export const metadata = { title: "Customers | NovaPOS" };

export default async function CustomersPage() {
  const { user, orgId } = await getOrgSession();
  const customers = await listCustomers(orgId);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Customers"
        subtitle="Manage your customer profiles and history."
        user={user}
      />
      <div className="flex-1 overflow-y-auto">
        <CustomersView customers={customers} />
      </div>
    </div>
  );
}
