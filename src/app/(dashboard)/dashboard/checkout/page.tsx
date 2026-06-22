import { Header } from "@/components/layout/header";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { getOrgSession } from "@/lib/auth/session";
import { listServices } from "@/lib/db/queries/services";
import { listProducts } from "@/lib/db/queries/products";
import { listCustomers } from "@/lib/db/queries/customers";
import { getSettings } from "@/lib/db/queries/settings";

export const metadata = { title: "Checkout | NovaPOS" };

export default async function CheckoutPage() {
  const { user, orgId } = await getOrgSession();

  const [services, products, customers, settings] = await Promise.all([
    listServices(orgId),
    listProducts(orgId),
    listCustomers(orgId),
    getSettings(orgId),
  ]);

  const taxRate = settings?.tax_rate ? Number(settings.tax_rate) : 15;
  const tipEnabled = settings?.tip_enabled ?? true;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Checkout"
        subtitle="Process sales and payments."
        user={user}
      />
      <div className="flex-1 overflow-hidden">
        <CheckoutView
          services={services}
          products={products}
          customers={customers}
          taxRate={taxRate}
          tipEnabled={tipEnabled}
        />
      </div>
    </div>
  );
}
