import { eq, and, desc, ilike, or } from "drizzle-orm";
import { db } from "../index";
import {
  services,
  serviceCategories,
  type Service,
  type NewService,
  type ServiceCategory,
} from "../schema";

export type ServiceWithCategory = Service & {
  category: Pick<ServiceCategory, "id" | "name" | "color"> | null;
};

export async function listServices(
  orgId: string,
  opts: { search?: string; categoryId?: string; activeOnly?: boolean } = {}
): Promise<ServiceWithCategory[]> {
  const rows = await db
    .select({
      service: services,
      category: {
        id: serviceCategories.id,
        name: serviceCategories.name,
        color: serviceCategories.color,
      },
    })
    .from(services)
    .leftJoin(serviceCategories, eq(services.category_id, serviceCategories.id))
    .where(
      and(
        eq(services.organization_id, orgId),
        opts.activeOnly ? eq(services.is_active, true) : undefined,
        opts.categoryId ? eq(services.category_id, opts.categoryId) : undefined,
        opts.search ? ilike(services.name, `%${opts.search}%`) : undefined
      )
    )
    .orderBy(services.name);

  return rows.map((r) => ({
    ...r.service,
    category: r.category?.id ? r.category : null,
  }));
}

export async function getServiceById(id: string, orgId: string) {
  const [row] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, id), eq(services.organization_id, orgId)))
    .limit(1);
  return row ?? null;
}

export async function createService(data: NewService) {
  const [row] = await db.insert(services).values(data).returning();
  return row;
}

export async function updateService(
  id: string,
  orgId: string,
  data: Partial<Omit<NewService, "id" | "organization_id">>
) {
  const [row] = await db
    .update(services)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(services.id, id), eq(services.organization_id, orgId)))
    .returning();
  return row ?? null;
}

export async function deleteService(id: string, orgId: string) {
  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.organization_id, orgId)));
}

// Categories

export async function listServiceCategories(orgId: string): Promise<ServiceCategory[]> {
  return db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.organization_id, orgId))
    .orderBy(serviceCategories.sort_order, serviceCategories.name);
}

export async function createServiceCategory(data: {
  organization_id: string;
  name: string;
  color?: string;
}) {
  const [row] = await db.insert(serviceCategories).values(data).returning();
  return row;
}

export async function deleteServiceCategory(id: string, orgId: string) {
  await db
    .delete(serviceCategories)
    .where(and(eq(serviceCategories.id, id), eq(serviceCategories.organization_id, orgId)));
}
