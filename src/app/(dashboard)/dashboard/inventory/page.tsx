import { Header } from "@/components/layout/header";
import { InventoryView } from "@/components/inventory/inventory-view";
import { getOrgSession } from "@/lib/auth/session";
import { listProducts, getInventoryValue } from "@/lib/db/queries/products";

export const metadata = { title: "Inventory | NovaPOS" };

export default async function InventoryPage() {
  const { user, orgId } = await getOrgSession();
  const [products, inventoryValue] = await Promise.all([
    listProducts(orgId),
    getInventoryValue(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Inventory"
        subtitle="Track stock levels and movements."
        user={user}
      />
      <div className="flex-1 overflow-y-auto">
        <InventoryView products={products} inventoryValue={inventoryValue} />
      </div>
    </div>
  );
}
