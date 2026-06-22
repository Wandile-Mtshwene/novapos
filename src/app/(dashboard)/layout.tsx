import { getOrgSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NovaLogo } from "@/components/nova-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await getOrgSession();

  const initials = getInitials(user.name ?? "", user.email[0]);

  return (
    <div className="flex h-screen bg-[var(--nova-surface)] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          user={{ name: user.name ?? "", email: user.email }}
          role={role}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-[var(--nova-border)] bg-[var(--nova-surface)]/80 backdrop-blur-xl px-4 md:hidden">
          <NovaLogo size="sm" />
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-[var(--nova-accent-dim)] text-[var(--nova-accent)] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
