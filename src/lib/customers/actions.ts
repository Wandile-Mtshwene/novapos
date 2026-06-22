"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { canManage } from "@/lib/auth/permissions";
import { customerSchema } from "@/lib/validation";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomerNote,
  deleteCustomerNote,
} from "@/lib/db/queries/customers";

export async function createCustomerAction(data: {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  notes?: string;
}) {
  const { orgId } = await getOrgSession();
  customerSchema.parse(data);
  const customer = await createCustomer({
    organization_id: orgId,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    birthday: data.birthday,
    notes: data.notes,
  });
  revalidatePath("/dashboard/customers");
  return { id: customer.id };
}

export async function updateCustomerAction(
  id: string,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    birthday?: string;
    notes?: string;
    tags?: string[];
  }
) {
  const { orgId } = await getOrgSession();
  await updateCustomer(id, orgId, data);
  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${id}`);
}

export async function deleteCustomerAction(id: string) {
  const { orgId, role } = await getOrgSession();
  if (!canManage(role)) throw new Error("Insufficient permissions");
  await deleteCustomer(id, orgId);
  revalidatePath("/dashboard/customers");
}

export async function createCustomerNoteAction(customerId: string, body: string) {
  const { orgId, userId } = await getOrgSession();
  await createCustomerNote({
    customer_id: customerId,
    organization_id: orgId,
    author_id: userId,
    body,
  });
  revalidatePath(`/dashboard/customers/${customerId}`);
}

export async function deleteCustomerNoteAction(noteId: string, customerId: string) {
  const { orgId } = await getOrgSession();
  await deleteCustomerNote(noteId, orgId);
  revalidatePath(`/dashboard/customers/${customerId}`);
}
