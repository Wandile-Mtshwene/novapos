"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { canManage } from "@/lib/auth/permissions";
import { serviceSchema } from "@/lib/validation";
import {
  createService,
  updateService,
  deleteService,
  createServiceCategory,
  deleteServiceCategory,
} from "@/lib/db/queries/services";

export async function createServiceAction(data: {
  name: string;
  description?: string;
  category_id?: string;
  duration_minutes: number;
  price: string;
  color?: string;
}) {
  const { orgId } = await getOrgSession();
  serviceSchema.parse(data);
  const svc = await createService({
    organization_id: orgId,
    name: data.name,
    description: data.description,
    category_id: data.category_id,
    duration_minutes: data.duration_minutes,
    price: data.price,
    color: data.color ?? "#8b5cf6",
    is_active: true,
  });
  revalidatePath("/dashboard/services");
  return { id: svc.id };
}

export async function updateServiceAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    category_id?: string;
    duration_minutes?: number;
    price?: string;
    color?: string;
    is_active?: boolean;
  }
) {
  const { orgId } = await getOrgSession();
  await updateService(id, orgId, data);
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/calendar");
}

export async function deleteServiceAction(id: string) {
  const { orgId, role } = await getOrgSession();
  if (!canManage(role)) throw new Error("Insufficient permissions");
  await deleteService(id, orgId);
  revalidatePath("/dashboard/services");
}

export async function createServiceCategoryAction(name: string, color?: string) {
  const { orgId } = await getOrgSession();
  const cat = await createServiceCategory({ organization_id: orgId, name, color });
  revalidatePath("/dashboard/services");
  return { id: cat.id };
}

export async function deleteServiceCategoryAction(id: string) {
  const { orgId } = await getOrgSession();
  await deleteServiceCategory(id, orgId);
  revalidatePath("/dashboard/services");
}
