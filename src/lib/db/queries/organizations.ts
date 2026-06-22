import { eq } from "drizzle-orm";
import { db } from "../index";
import { organizations, settings, type NewOrganization } from "../schema";

export async function createOrganization(data: NewOrganization) {
  const [org] = await db.insert(organizations).values(data).returning();

  // Auto-create default settings for this organization
  await db.insert(settings).values({ organization_id: org.id });

  return org;
}

export async function getOrganizationById(id: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  return org ?? null;
}

export async function getOrganizationBySlug(slug: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  return org ?? null;
}

export async function updateOrganization(
  id: string,
  data: Partial<Pick<NewOrganization, "name" | "slug" | "phone" | "email" | "address" | "logo_url">>
) {
  const [org] = await db
    .update(organizations)
    .set({ ...data, updated_at: new Date() })
    .where(eq(organizations.id, id))
    .returning();
  return org ?? null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "org";
  let slug = base;
  let attempt = 0;
  while (true) {
    const existing = await getOrganizationBySlug(slug);
    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}
