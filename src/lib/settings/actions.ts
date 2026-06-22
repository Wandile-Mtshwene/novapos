"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { upsertSettings, updateOrganizationSettings } from "@/lib/db/queries/settings";

export async function saveBusinessSettingsAction(data: {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  const { orgId } = await getOrgSession();
  await updateOrganizationSettings(orgId, data);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function saveReceiptSettingsAction(data: {
  receipt_footer?: string;
  tax_rate?: string;
  tip_enabled?: boolean;
}) {
  const { orgId } = await getOrgSession();
  await upsertSettings(orgId, data);
  revalidatePath("/dashboard/settings");
}
