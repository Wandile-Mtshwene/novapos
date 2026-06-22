"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { canManage } from "@/lib/auth/permissions";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/db/queries/appointments";
import type { Appointment } from "@/lib/db/schema";

export async function createAppointmentAction(data: {
  customer_id?: string;
  staff_id?: string;
  service_id?: string;
  starts_at: Date;
  ends_at: Date;
  notes?: string;
  price?: string;
}) {
  const { orgId } = await getOrgSession();
  const appt = await createAppointment({
    organization_id: orgId,
    ...data,
    status: "scheduled",
  });
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
  return { id: appt.id };
}

export async function updateAppointmentAction(
  id: string,
  data: Partial<{
    customer_id: string;
    staff_id: string;
    service_id: string;
    starts_at: Date;
    ends_at: Date;
    status: Appointment["status"];
    notes: string;
    price: string;
  }>
) {
  const { orgId } = await getOrgSession();
  await updateAppointment(id, orgId, data);
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
}

export async function updateAppointmentStatusAction(
  id: string,
  status: Appointment["status"]
) {
  const { orgId } = await getOrgSession();
  await updateAppointment(id, orgId, { status });
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
}

export async function deleteAppointmentAction(id: string) {
  const { orgId, role } = await getOrgSession();
  if (!canManage(role)) throw new Error("Insufficient permissions");
  await deleteAppointment(id, orgId);
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
}
