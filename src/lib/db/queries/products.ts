import { eq, and, desc, ilike, lte, sql } from "drizzle-orm";
import { db } from "../index";
import {
  products,
  productCategories,
  stockMovements,
  type Product,
  type NewProduct,
  type ProductCategory,
  type StockMovement,
} from "../schema";

export type ProductWithCategory = Product & {
  category: Pick<ProductCategory, "id" | "name"> | null;
};

export async function listProducts(
  orgId: string,
  opts: { search?: string; categoryId?: string; activeOnly?: boolean; lowStockOnly?: boolean } = {}
): Promise<ProductWithCategory[]> {
  const rows = await db
    .select({
      product: products,
      category: { id: productCategories.id, name: productCategories.name },
    })
    .from(products)
    .leftJoin(productCategories, eq(products.category_id, productCategories.id))
    .where(
      and(
        eq(products.organization_id, orgId),
        opts.activeOnly ? eq(products.is_active, true) : undefined,
        opts.categoryId ? eq(products.category_id, opts.categoryId) : undefined,
        opts.search ? ilike(products.name, `%${opts.search}%`) : undefined
      )
    )
    .orderBy(products.name);

  let result = rows.map((r) => ({
    ...r.product,
    category: r.category?.id ? r.category : null,
  }));

  if (opts.lowStockOnly) {
    result = result.filter((p) => p.stock_quantity <= p.low_stock_threshold);
  }

  return result;
}

export async function getProductById(id: string, orgId: string) {
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.organization_id, orgId)))
    .limit(1);
  return row ?? null;
}

export async function createProduct(data: NewProduct) {
  const [row] = await db.insert(products).values(data).returning();
  return row;
}

export async function updateProduct(
  id: string,
  orgId: string,
  data: Partial<Omit<NewProduct, "id" | "organization_id">>
) {
  const [row] = await db
    .update(products)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(products.id, id), eq(products.organization_id, orgId)))
    .returning();
  return row ?? null;
}

export async function deleteProduct(id: string, orgId: string) {
  await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.organization_id, orgId)));
}

export async function adjustStock(
  productId: string,
  orgId: string,
  delta: number,
  type: StockMovement["type"],
  note?: string,
  createdBy?: string
) {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .select({ stock_quantity: products.stock_quantity })
      .from(products)
      .where(and(eq(products.id, productId), eq(products.organization_id, orgId)))
      .limit(1);

    if (!product) throw new Error("Product not found");

    const newQty = product.stock_quantity + delta;
    if (newQty < 0) throw new Error("Insufficient stock");

    await tx
      .update(products)
      .set({ stock_quantity: newQty, updated_at: new Date() })
      .where(eq(products.id, productId));

    const [movement] = await tx
      .insert(stockMovements)
      .values({
        product_id: productId,
        organization_id: orgId,
        type,
        quantity_delta: delta,
        quantity_after: newQty,
        note,
        created_by: createdBy,
      })
      .returning();

    return { newQty, movement };
  });
}

export async function listStockMovements(productId: string, limit = 50): Promise<StockMovement[]> {
  return db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.product_id, productId))
    .orderBy(desc(stockMovements.created_at))
    .limit(limit);
}

export async function listAllStockMovements(orgId: string, limit = 100): Promise<StockMovement[]> {
  return db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.organization_id, orgId))
    .orderBy(desc(stockMovements.created_at))
    .limit(limit);
}

// Categories

export async function listProductCategories(orgId: string): Promise<ProductCategory[]> {
  return db
    .select()
    .from(productCategories)
    .where(eq(productCategories.organization_id, orgId))
    .orderBy(productCategories.name);
}

export async function createProductCategory(data: {
  organization_id: string;
  name: string;
}) {
  const [row] = await db.insert(productCategories).values(data).returning();
  return row;
}

export async function getInventoryValue(orgId: string): Promise<number> {
  const rows = await db
    .select({
      cost_price: products.cost_price,
      stock_quantity: products.stock_quantity,
    })
    .from(products)
    .where(and(eq(products.organization_id, orgId), eq(products.is_active, true)));

  return rows.reduce(
    (sum, p) => sum + parseFloat(String(p.cost_price)) * p.stock_quantity,
    0
  );
}
