import { Header } from "@/components/layout/header";
import { AppointmentsView } from "@/components/appointments/appointments-view";
import { getOrgSession } from "@/lib/auth/session";

export const metadata = { title: "Appointments | NovaPOS" };

export default async function AppointmentsPage() {
  const { user } = await getOrgSession();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Appointments"
        subtitle="Track and manage all appointments."
        user={user}
      />
      <div className="flex-1 overflow-y-auto">
        <AppointmentsView />
      </div>
    </div>
  );
}
