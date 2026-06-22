import { Header } from "@/components/layout/header";
import { SettingsView } from "@/components/settings/settings-view";
import { getOrgSession } from "@/lib/auth/session";
import { getSettings, getOrganization } from "@/lib/db/queries/settings";

export const metadata = { title: "Settings | NovaPOS" };

export default async function SettingsPage() {
  const { user, orgId } = await getOrgSession();
  const [organization, settings] = await Promise.all([
    getOrganization(orgId),
    getSettings(orgId),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Settings"
        subtitle="Configure your business and NovaPOS preferences."
        user={user}
      />
      <div className="flex-1 overflow-hidden">
        <SettingsView organization={organization} settings={settings} />
      </div>
    </div>
  );
}
