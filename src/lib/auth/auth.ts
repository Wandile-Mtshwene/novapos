import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/auth-schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const { createOrganization, generateUniqueSlug } = await import(
              "@/lib/db/queries/organizations"
            );
            const { upsertUser } = await import("@/lib/db/queries/users");

            const orgName = user.name || user.email.split("@")[0];
            const slug = await generateUniqueSlug(orgName);
            const org = await createOrganization({
              name: orgName,
              slug,
              owner_id: user.id,
            });
            await upsertUser({
              id: user.id,
              organization_id: org.id,
              email: user.email,
              full_name: user.name,
              role: "owner",
            });
          } catch (err) {
            console.error("[auth] post-signup org creation failed:", err);
          }
        },
      },
    },
  },
});
