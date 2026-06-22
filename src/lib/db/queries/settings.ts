import { eq } from "drizzle-orm";
import { db } from "../index";
import { settings, organizations, type Settings } from "../schema";

export async function getSettings(orgId: string): Promise<Settings | null> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.organization_id, orgId))
    .limit(1);
  return row ?? null;
}

export async function upsertSettings(
  orgId: string,
  data: Partial<Omit<Settings, "id" | "organization_id" | "created_at" | "updated_at">>
) {
  const existing = await getSettings(orgId);
  if (existing) {
    const [row] = await db
      .update(settings)
      .set({ ...data, updated_at: new Date() })
      .where(eq(settings.organization_id, orgId))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(settings)
    .values({ organization_id: orgId, ...data })
    .returning();
  return row;
}

export async function getOrganization(orgId: string) {
  const [row] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  return row ?? null;
}

export async function updateOrganizationSettings(
  orgId: string,
  data: { name?: string; phone?: string; email?: string; address?: string; logo_url?: string; accent_color?: string }
) {
  const [row] = await db
    .update(organizations)
    .set({ ...data, updated_at: new Date() })
    .where(eq(organizations.id, orgId))
    .returning();
  return row ?? null;
}
