import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { users, type NewUser, type User } from "../schema";

export async function createUser(data: NewUser) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function getUserByEmail(email: string, organizationId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase()), eq(users.organization_id, organizationId)))
    .limit(1);
  return user ?? null;
}

export async function getUsersByOrganization(organizationId: string) {
  return db.select().from(users).where(eq(users.organization_id, organizationId));
}

export async function updateUserRole(userId: string, organizationId: string, role: User["role"]) {
  const [updated] = await db
    .update(users)
    .set({ role })
    .where(and(eq(users.id, userId), eq(users.organization_id, organizationId)))
    .returning();
  return updated ?? null;
}

export async function upsertUser(data: NewUser) {
  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: { email: data.email, full_name: data.full_name },
    })
    .returning();
  return user;
}
