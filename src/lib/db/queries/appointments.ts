import { eq, and, gte, lte, desc, ilike, or } from "drizzle-orm";
import { db } from "../index";
import {
  appointments,
  customers,
  staff,
  services,
  type Appointment,
  type NewAppointment,
} from "../schema";

export type AppointmentWithRelations = Appointment & {
  customer: { id: string; first_name: string; last_name: string | null } | null;
  staff: { id: string; first_name: string; last_name: string | null } | null;
  service: { id: string; name: string; color: string; duration_minutes: number } | null;
};

export async function listAppointments(
  orgId: string,
  opts: {
    from?: Date;
    to?: Date;
    status?: Appointment["status"];
    staffId?: string;
    limit?: number;
  } = {}
): Promise<AppointmentWithRelations[]> {
  const rows = await db
    .select({
      appointment: appointments,
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
      service: {
        id: services.id,
        name: services.name,
        color: services.color,
        duration_minutes: services.duration_minutes,
      },
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customer_id, customers.id))
    .leftJoin(staff, eq(appointments.staff_id, staff.id))
    .leftJoin(services, eq(appointments.service_id, services.id))
    .where(
      and(
        eq(appointments.organization_id, orgId),
        opts.from ? gte(appointments.starts_at, opts.from) : undefined,
        opts.to ? lte(appointments.starts_at, opts.to) : undefined,
        opts.status ? eq(appointments.status, opts.status) : undefined,
        opts.staffId ? eq(appointments.staff_id, opts.staffId) : undefined
      )
    )
    .orderBy(desc(appointments.starts_at))
    .limit(opts.limit ?? 200);

  return rows.map((r) => ({
    ...r.appointment,
    customer: r.customer?.id ? r.customer : null,
    staff: r.staff?.id ? r.staff : null,
    service: r.service?.id ? r.service : null,
  }));
}

export async function getAppointmentById(id: string, orgId: string) {
  const rows = await db
    .select({
      appointment: appointments,
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
      service: {
        id: services.id,
        name: services.name,
        color: services.color,
        duration_minutes: services.duration_minutes,
      },
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customer_id, customers.id))
    .leftJoin(staff, eq(appointments.staff_id, staff.id))
    .leftJoin(services, eq(appointments.service_id, services.id))
    .where(and(eq(appointments.id, id), eq(appointments.organization_id, orgId)))
    .limit(1);

  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r.appointment,
    customer: r.customer?.id ? r.customer : null,
    staff: r.staff?.id ? r.staff : null,
    service: r.service?.id ? r.service : null,
  };
}

export async function createAppointment(data: NewAppointment) {
  const [row] = await db.insert(appointments).values(data).returning();
  return row;
}

export async function updateAppointment(
  id: string,
  orgId: string,
  data: Partial<Omit<NewAppointment, "id" | "organization_id">>
) {
  const [row] = await db
    .update(appointments)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.organization_id, orgId)))
    .returning();
  return row ?? null;
}

export async function deleteAppointment(id: string, orgId: string) {
  await db
    .delete(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.organization_id, orgId)));
}

export async function countAppointmentsToday(orgId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const rows = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.organization_id, orgId),
        gte(appointments.starts_at, today),
        lte(appointments.starts_at, tomorrow)
      )
    );
  return rows.length;
}
