import { Header } from "@/components/layout/header";
import { ProductsView } from "@/components/products/products-view";
import { getOrgSession } from "@/lib/auth/session";
import { listProducts, listProductCategories } from "@/lib/db/queries/products";

export const metadata = { title: "Products | NovaPOS" };

export default async function ProductsPage() {
  const { user, orgId } = await getOrgSession();
  const [products, categories] = await Promise.all([
    listProducts(orgId),
    listProductCategories(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Products"
        subtitle="Manage retail products and pricing."
        user={user}
      />
      <div className="flex-1 overflow-y-auto">
        <ProductsView products={products} categories={categories} />
      </div>
    </div>
  );
}
