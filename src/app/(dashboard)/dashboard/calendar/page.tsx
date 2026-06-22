import { Header } from "@/components/layout/header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { getOrgSession } from "@/lib/auth/session";
import { listAppointments } from "@/lib/db/queries/appointments";
import { listServices } from "@/lib/db/queries/services";
import { listStaff } from "@/lib/db/queries/staff";
import { listCustomers } from "@/lib/db/queries/customers";

export const metadata = { title: "Calendar | NovaPOS" };

export default async function CalendarPage() {
  const { user, orgId } = await getOrgSession();

  const [appointments, services, staffMembers, customers] = await Promise.all([
    listAppointments(orgId),
    listServices(orgId),
    listStaff(orgId),
    listCustomers(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Calendar" subtitle="Manage your appointments and schedule." user={user} />
      <div className="flex-1 overflow-hidden relative">
        <CalendarView
          appointments={appointments}
          services={services}
          staff={staffMembers}
          customers={customers}
        />
      </div>
    </div>
  );
}
