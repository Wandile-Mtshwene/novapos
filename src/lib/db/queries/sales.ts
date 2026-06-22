import { eq, and, desc, gte, lte, sum, count, sql } from "drizzle-orm";
import { db } from "../index";
import {
  sales,
  saleItems,
  customers,
  staff,
  products,
  services,
  type Sale,
  type NewSale,
  type SaleItem,
} from "../schema";
import { adjustStock } from "./products";
import { incrementCustomerVisits } from "./customers";

export type SaleWithRelations = Sale & {
  customer: { id: string; first_name: string; last_name: string | null } | null;
  staff: { id: string; first_name: string; last_name: string | null } | null;
  items: SaleItem[];
};

export async function listSales(
  orgId: string,
  opts: { from?: Date; to?: Date; limit?: number } = {}
): Promise<SaleWithRelations[]> {
  const rows = await db
    .select({
      sale: sales,
      customer: {
        id: customers.id,
        first_name: customers.first_name,
        last_name: customers.last_name,
      },
      staff: {
        id: staff.id,
        first_name: staff.first_name,
        last_name: staff.last_name,
      },
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customer_id, customers.id))
    .leftJoin(staff, eq(sales.staff_id, staff.id))
    .where(
      and(
        eq(sales.organization_id, orgId),
        opts.from ? gte(sales.created_at, opts.from) : undefined,
        opts.to ? lte(sales.created_at, opts.to) : undefined
      )
    )
    .orderBy(desc(sales.created_at))
    .limit(opts.limit ?? 100);

  const saleIds = rows.map((r) => r.sale.id);
  const itemRows = saleIds.length
    ? await db.select().from(saleItems).where(sql`${saleItems.sale_id} = ANY(${sql.raw(`ARRAY[${saleIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`)
    : [];

  return rows.map((r) => ({
    ...r.sale,
    customer: r.customer?.id ? r.customer : null,
    staff: r.staff?.id ? r.staff : null,
    items: itemRows.filter((i) => i.sale_id === r.sale.id),
  }));
}

export async function getSaleById(id: string, orgId: string): Promise<SaleWithRelations | null> {
  const rows = await db
    .select({
      sale: sales,
      customer: {
        id: customers.id,
        first_name: customers.first_name,
        last_name: customers.last_name,
      },
      staff: {
        id: staff.id,
        first_name: staff.first_name,
        last_name: staff.last_name,
      },
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customer_id, customers.id))
    .leftJoin(staff, eq(sales.staff_id, staff.id))
    .where(and(eq(sales.id, id), eq(sales.organization_id, orgId)))
    .limit(1);

  if (!rows[0]) return null;
  const r = rows[0];

  const items = await db.select().from(saleItems).where(eq(saleItems.sale_id, id));

  return {
    ...r.sale,
    customer: r.customer?.id ? r.customer : null,
    staff: r.staff?.id ? r.staff : null,
    items,
  };
}

export interface CartItemInput {
  name: string;
  quantity: number;
  unit_price: number;
  product_id?: string;
  service_id?: string;
}

export async function completeSale(input: {
  organization_id: string;
  customer_id?: string;
  staff_id?: string;
  appointment_id?: string;
  items: CartItemInput[];
  discount_amount: number;
  tip_amount: number;
  tax_amount: number;
  subtotal: number;
  total: number;
  payment_method: Sale["payment_method"];
  notes?: string;
  created_by?: string;
}): Promise<Sale> {
  return db.transaction(async (tx) => {
    const [sale] = await tx
      .insert(sales)
      .values({
        organization_id: input.organization_id,
        customer_id: input.customer_id,
        staff_id: input.staff_id,
        appointment_id: input.appointment_id,
        status: "completed",
        subtotal: String(input.subtotal),
        discount_amount: String(input.discount_amount),
        tax_amount: String(input.tax_amount),
        tip_amount: String(input.tip_amount),
        total: String(input.total),
        payment_method: input.payment_method,
        notes: input.notes,
      })
      .returning();

    await tx.insert(saleItems).values(
      input.items.map((item) => ({
        sale_id: sale.id,
        organization_id: input.organization_id,
        product_id: item.product_id,
        service_id: item.service_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: String(item.unit_price),
        line_total: String(item.unit_price * item.quantity),
      }))
    );

    return sale;
  }).then(async (sale) => {
    // Post-transaction side effects
    for (const item of input.items) {
      if (item.product_id) {
        try {
          await adjustStock(
            item.product_id,
            input.organization_id,
            -item.quantity,
            "sale",
            `Sale ${sale.id}`,
            input.created_by
          );
        } catch {
          // Log but do not fail the sale if stock goes negative (edge case)
        }
      }
    }
    if (input.customer_id) {
      await incrementCustomerVisits(input.customer_id, input.organization_id, input.total);
    }
    return sale;
  });
}

export async function getRevenueSummary(orgId: string, from: Date, to: Date) {
  const rows = await db
    .select({
      total: sql<string>`COALESCE(SUM(${sales.total}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.organization_id, orgId),
        eq(sales.status, "completed"),
        gte(sales.created_at, from),
        lte(sales.created_at, to)
      )
    );
  return { revenue: parseFloat(rows[0]?.total ?? "0"), count: Number(rows[0]?.count ?? 0) };
}

export async function getDailyRevenue(orgId: string, from: Date, to: Date) {
  const rows = await db
    .select({
      day: sql<string>`DATE(${sales.created_at})`,
      revenue: sql<string>`COALESCE(SUM(${sales.total}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.organization_id, orgId),
        eq(sales.status, "completed"),
        gte(sales.created_at, from),
        lte(sales.created_at, to)
      )
    )
    .groupBy(sql`DATE(${sales.created_at})`)
    .orderBy(sql`DATE(${sales.created_at})`);

  return rows.map((r) => ({
    day: String(r.day),
    revenue: parseFloat(String(r.revenue)),
    count: Number(r.count),
  }));
}
