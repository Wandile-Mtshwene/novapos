import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getUserById } from "@/lib/db/queries/users";

export const getOrgSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const posUser = await getUserById(session.user.id);
  if (!posUser) throw new Error("User has no organization");

  return {
    userId: session.user.id,
    orgId: posUser.organization_id,
    role: posUser.role,
    user: session.user,
  };
});
