import { eq, and, desc } from "drizzle-orm";
import { db } from "../index";
import {
  staff,
  staffSchedules,
  type Staff,
  type NewStaff,
  type StaffSchedule,
} from "../schema";

export async function listStaff(
  orgId: string,
  opts: { activeOnly?: boolean } = {}
): Promise<Staff[]> {
  return db
    .select()
    .from(staff)
    .where(
      and(
        eq(staff.organization_id, orgId),
        opts.activeOnly ? eq(staff.is_active, true) : undefined
      )
    )
    .orderBy(staff.first_name);
}

export async function getStaffById(id: string, orgId: string) {
  const [row] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.id, id), eq(staff.organization_id, orgId)))
    .limit(1);
  return row ?? null;
}

export async function createStaff(data: NewStaff) {
  const [row] = await db.insert(staff).values(data).returning();
  return row;
}

export async function updateStaff(
  id: string,
  orgId: string,
  data: Partial<Omit<NewStaff, "id" | "organization_id">>
) {
  const [row] = await db
    .update(staff)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(staff.id, id), eq(staff.organization_id, orgId)))
    .returning();
  return row ?? null;
}

export async function deleteStaff(id: string, orgId: string) {
  await db
    .delete(staff)
    .where(and(eq(staff.id, id), eq(staff.organization_id, orgId)));
}

export async function getStaffSchedules(staffId: string): Promise<StaffSchedule[]> {
  return db
    .select()
    .from(staffSchedules)
    .where(eq(staffSchedules.staff_id, staffId))
    .orderBy(staffSchedules.day_of_week);
}

export async function upsertStaffSchedule(data: {
  staff_id: string;
  organization_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_off?: boolean;
}) {
  const existing = await db
    .select()
    .from(staffSchedules)
    .where(
      and(
        eq(staffSchedules.staff_id, data.staff_id),
        eq(staffSchedules.day_of_week, data.day_of_week)
      )
    )
    .limit(1);

  if (existing[0]) {
    const [row] = await db
      .update(staffSchedules)
      .set({ start_time: data.start_time, end_time: data.end_time, is_off: data.is_off ?? false })
      .where(eq(staffSchedules.id, existing[0].id))
      .returning();
    return row;
  }

  const [row] = await db.insert(staffSchedules).values(data).returning();
  return row;
}

export async function countActiveStaff(orgId: string) {
  const rows = await db
    .select({ id: staff.id })
    .from(staff)
    .where(and(eq(staff.organization_id, orgId), eq(staff.is_active, true)));
  return rows.length;
}
