"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { canAdmin } from "@/lib/auth/permissions";
import {
  createStaff,
  updateStaff,
  deleteStaff,
  upsertStaffSchedule,
} from "@/lib/db/queries/staff";

export async function createStaffAction(data: {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  commission_pct?: string;
  specialties?: string[];
}) {
  const { orgId } = await getOrgSession();
  const member = await createStaff({
    organization_id: orgId,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    role: data.role ?? "Staff",
    commission_pct: data.commission_pct ?? "0",
    specialties: data.specialties ?? [],
    is_active: true,
  });
  revalidatePath("/dashboard/staff");
  return { id: member.id };
}

export async function updateStaffAction(
  id: string,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    role?: string;
    commission_pct?: string;
    specialties?: string[];
    is_active?: boolean;
  }
) {
  const { orgId } = await getOrgSession();
  await updateStaff(id, orgId, data);
  revalidatePath("/dashboard/staff");
}

export async function deleteStaffAction(id: string) {
  const { orgId, role } = await getOrgSession();
  if (!canAdmin(role)) throw new Error("Insufficient permissions");
  await deleteStaff(id, orgId);
  revalidatePath("/dashboard/staff");
}

export async function upsertStaffScheduleAction(data: {
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_off?: boolean;
}) {
  const { orgId } = await getOrgSession();
  await upsertStaffSchedule({ ...data, organization_id: orgId });
  revalidatePath("/dashboard/staff");
}
