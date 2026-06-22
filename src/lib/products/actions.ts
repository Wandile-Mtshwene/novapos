"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { canManage } from "@/lib/auth/permissions";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  createProductCategory,
} from "@/lib/db/queries/products";
import type { StockMovement } from "@/lib/db/schema";

export async function createProductAction(data: {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category_id?: string;
  cost_price: string;
  selling_price: string;
  stock_quantity: number;
  low_stock_threshold?: number;
}) {
  const { orgId } = await getOrgSession();
  const product = await createProduct({
    organization_id: orgId,
    name: data.name,
    sku: data.sku,
    barcode: data.barcode,
    description: data.description,
    category_id: data.category_id,
    cost_price: data.cost_price,
    selling_price: data.selling_price,
    stock_quantity: data.stock_quantity,
    low_stock_threshold: data.low_stock_threshold ?? 5,
    is_active: true,
  });
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  return { id: product.id };
}

export async function updateProductAction(
  id: string,
  data: {
    name?: string;
    sku?: string;
    description?: string;
    category_id?: string;
    cost_price?: string;
    selling_price?: string;
    low_stock_threshold?: number;
    is_active?: boolean;
  }
) {
  const { orgId } = await getOrgSession();
  await updateProduct(id, orgId, data);
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
}

export async function deleteProductAction(id: string) {
  const { orgId, role } = await getOrgSession();
  if (!canManage(role)) throw new Error("Insufficient permissions");
  await deleteProduct(id, orgId);
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
}

export async function adjustStockAction(
  productId: string,
  delta: number,
  type: StockMovement["type"],
  note?: string
) {
  const { orgId, userId } = await getOrgSession();
  const result = await adjustStock(productId, orgId, delta, type, note, userId);
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products");
  return result;
}

export async function createProductCategoryAction(name: string) {
  const { orgId } = await getOrgSession();
  const cat = await createProductCategory({ organization_id: orgId, name });
  revalidatePath("/dashboard/products");
  return { id: cat.id };
}
