import { Header } from "@/components/layout/header";
import { StaffView } from "@/components/staff/staff-view";
import { getOrgSession } from "@/lib/auth/session";
import { listStaff } from "@/lib/db/queries/staff";

export const metadata = { title: "Staff | NovaPOS" };

export default async function StaffPage() {
  const { user, orgId } = await getOrgSession();
  const staffMembers = await listStaff(orgId);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Staff"
        subtitle="Manage your team members and schedules."
        user={user}
      />
      <div className="flex-1 overflow-y-auto">
        <StaffView staffMembers={staffMembers} />
      </div>
    </div>
  );
}
