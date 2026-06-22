import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { db } from "../index";
import {
  customers,
  customerNotes,
  appointments,
  sales,
  type Customer,
  type NewCustomer,
  type CustomerNote,
} from "../schema";

export async function listCustomers(
  orgId: string,
  opts: { search?: string; limit?: number } = {}
): Promise<Customer[]> {
  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.organization_id, orgId),
        opts.search
          ? or(
              ilike(customers.first_name, `%${opts.search}%`),
              ilike(customers.last_name, `%${opts.search}%`),
              ilike(customers.email, `%${opts.search}%`),
              ilike(customers.phone, `%${opts.search}%`)
            )
          : undefined
      )
    )
    .orderBy(customers.first_name)
    .limit(opts.limit ?? 500);
}

export async function getCustomerById(id: string, orgId: string) {
  const [row] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.organization_id, orgId)))
    .limit(1);
  return row ?? null;
}

export async function getCustomerAppointments(customerId: string, orgId: string) {
  return db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.customer_id, customerId),
        eq(appointments.organization_id, orgId)
      )
    )
    .orderBy(desc(appointments.starts_at))
    .limit(20);
}

export async function getCustomerSales(customerId: string, orgId: string) {
  return db
    .select()
    .from(sales)
    .where(
      and(
        eq(sales.customer_id, customerId),
        eq(sales.organization_id, orgId)
      )
    )
    .orderBy(desc(sales.created_at))
    .limit(20);
}

export async function createCustomer(data: NewCustomer) {
  const [row] = await db.insert(customers).values(data).returning();
  return row;
}

export async function updateCustomer(
  id: string,
  orgId: string,
  data: Partial<Omit<NewCustomer, "id" | "organization_id">>
) {
  const [row] = await db
    .update(customers)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(customers.id, id), eq(customers.organization_id, orgId)))
    .returning();
  return row ?? null;
}

export async function deleteCustomer(id: string, orgId: string) {
  await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.organization_id, orgId)));
}

export async function incrementCustomerVisits(id: string, orgId: string, spentAmount: number) {
  await db
    .update(customers)
    .set({
      total_visits: sql`${customers.total_visits} + 1`,
      total_spent: sql`${customers.total_spent} + ${spentAmount}`,
      updated_at: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.organization_id, orgId)));
}

// Notes

export async function listCustomerNotes(customerId: string): Promise<CustomerNote[]> {
  return db
    .select()
    .from(customerNotes)
    .where(eq(customerNotes.customer_id, customerId))
    .orderBy(desc(customerNotes.created_at));
}

export async function createCustomerNote(data: {
  customer_id: string;
  organization_id: string;
  author_id: string;
  body: string;
}) {
  const [row] = await db.insert(customerNotes).values(data).returning();
  return row;
}

export async function deleteCustomerNote(id: string, orgId: string) {
  await db
    .delete(customerNotes)
    .where(and(eq(customerNotes.id, id), eq(customerNotes.organization_id, orgId)));
}

export async function countCustomers(orgId: string) {
  const rows = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.organization_id, orgId));
  return rows.length;
}
