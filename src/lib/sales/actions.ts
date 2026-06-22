"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { completeSale, type CartItemInput } from "@/lib/db/queries/sales";
import type { Sale } from "@/lib/db/schema";

export async function completeSaleAction(input: {
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
}) {
  const { orgId, userId } = await getOrgSession();
  const sale = await completeSale({
    organization_id: orgId,
    created_by: userId,
    ...input,
  });
  revalidatePath("/dashboard/checkout");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/inventory");
  return { id: sale.id };
}
