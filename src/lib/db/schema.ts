import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("pos_user_role", [
  "owner",
  "admin",
  "manager",
  "cashier",
  "staff",
  "viewer",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card",
  "eft",
]);

export const saleStatusEnum = pgEnum("sale_status", [
  "open",
  "completed",
  "refunded",
  "voided",
]);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "purchase",
  "adjustment",
  "sale",
  "return",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Core: multi-tenant root
// ─────────────────────────────────────────────────────────────────────────────

export const organizations = pgTable(
  "pos_organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    owner_id: text("owner_id").notNull(),
    logo_url: text("logo_url"),
    accent_color: text("accent_color").default("#8b5cf6"),
    currency: text("currency").notNull().default("ZAR"),
    timezone: text("timezone").notNull().default("Africa/Johannesburg"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("pos_organizations_slug_idx").on(t.slug)]
);

export const users = pgTable(
  "pos_users",
  {
    id: text("id").primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    full_name: text("full_name"),
    role: userRoleEnum("role").notNull().default("owner"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_users_org_idx").on(t.organization_id),
    uniqueIndex("pos_users_email_org_idx").on(t.email, t.organization_id),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────────────────────

export const customers = pgTable(
  "pos_customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    first_name: text("first_name").notNull(),
    last_name: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    birthday: text("birthday"),
    notes: text("notes"),
    tags: text("tags").array().default([]),
    total_visits: integer("total_visits").notNull().default(0),
    total_spent: numeric("total_spent", { precision: 12, scale: 2 }).notNull().default("0"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_customers_org_idx").on(t.organization_id),
    index("pos_customers_phone_idx").on(t.phone),
    index("pos_customers_email_idx").on(t.email),
  ]
);

export const customerNotes = pgTable(
  "pos_customer_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customer_id: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    organization_id: uuid("organization_id").notNull(),
    author_id: text("author_id").notNull(),
    body: text("body").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pos_customer_notes_customer_idx").on(t.customer_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────────────────────

export const staff = pgTable(
  "pos_staff",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    user_id: text("user_id"),
    first_name: text("first_name").notNull(),
    last_name: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    role: text("role").notNull().default("Staff"),
    commission_pct: numeric("commission_pct", { precision: 5, scale: 2 }).default("0"),
    specialties: text("specialties").array().default([]),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pos_staff_org_idx").on(t.organization_id)]
);

export const staffSchedules = pgTable(
  "pos_staff_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    staff_id: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    organization_id: uuid("organization_id").notNull(),
    day_of_week: integer("day_of_week").notNull(),
    start_time: text("start_time").notNull(),
    end_time: text("end_time").notNull(),
    is_off: boolean("is_off").notNull().default(false),
  },
  (t) => [index("pos_staff_schedules_staff_idx").on(t.staff_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Services and categories
// ─────────────────────────────────────────────────────────────────────────────

export const serviceCategories = pgTable(
  "pos_service_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#8b5cf6"),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pos_service_categories_org_idx").on(t.organization_id)]
);

export const services = pgTable(
  "pos_services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    category_id: uuid("category_id").references(() => serviceCategories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description"),
    duration_minutes: integer("duration_minutes").notNull().default(30),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    color: text("color").notNull().default("#8b5cf6"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_services_org_idx").on(t.organization_id),
    index("pos_services_category_idx").on(t.category_id),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Appointments
// ─────────────────────────────────────────────────────────────────────────────

export const appointments = pgTable(
  "pos_appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customer_id: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    staff_id: uuid("staff_id").references(() => staff.id, {
      onDelete: "set null",
    }),
    service_id: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
    starts_at: timestamp("starts_at", { withTimezone: true }).notNull(),
    ends_at: timestamp("ends_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    price: numeric("price", { precision: 12, scale: 2 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_appointments_org_idx").on(t.organization_id),
    index("pos_appointments_customer_idx").on(t.customer_id),
    index("pos_appointments_staff_idx").on(t.staff_id),
    index("pos_appointments_starts_at_idx").on(t.starts_at),
    index("pos_appointments_org_date_idx").on(t.organization_id, t.starts_at),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Products and inventory
// ─────────────────────────────────────────────────────────────────────────────

export const productCategories = pgTable(
  "pos_product_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pos_product_categories_org_idx").on(t.organization_id)]
);

export const products = pgTable(
  "pos_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    category_id: uuid("category_id").references(() => productCategories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    sku: text("sku"),
    barcode: text("barcode"),
    description: text("description"),
    cost_price: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
    selling_price: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),
    stock_quantity: integer("stock_quantity").notNull().default(0),
    low_stock_threshold: integer("low_stock_threshold").notNull().default(5),
    image_url: text("image_url"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_products_org_idx").on(t.organization_id),
    index("pos_products_category_idx").on(t.category_id),
    index("pos_products_sku_idx").on(t.sku),
  ]
);

export const stockMovements = pgTable(
  "pos_stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    organization_id: uuid("organization_id").notNull(),
    type: stockMovementTypeEnum("type").notNull(),
    quantity_delta: integer("quantity_delta").notNull(),
    quantity_after: integer("quantity_after").notNull(),
    note: text("note"),
    created_by: text("created_by"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_stock_movements_product_idx").on(t.product_id),
    index("pos_stock_movements_org_idx").on(t.organization_id),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Sales and POS
// ─────────────────────────────────────────────────────────────────────────────

export const sales = pgTable(
  "pos_sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customer_id: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    staff_id: uuid("staff_id").references(() => staff.id, {
      onDelete: "set null",
    }),
    appointment_id: uuid("appointment_id").references(() => appointments.id, {
      onDelete: "set null",
    }),
    status: saleStatusEnum("status").notNull().default("open"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    discount_amount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    tax_amount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    tip_amount: numeric("tip_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    payment_method: paymentMethodEnum("payment_method"),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_sales_org_idx").on(t.organization_id),
    index("pos_sales_customer_idx").on(t.customer_id),
    index("pos_sales_created_at_idx").on(t.created_at),
    index("pos_sales_org_date_idx").on(t.organization_id, t.created_at),
  ]
);

export const saleItems = pgTable(
  "pos_sale_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sale_id: uuid("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    organization_id: uuid("organization_id").notNull(),
    product_id: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    service_id: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unit_price: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    line_total: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  },
  (t) => [index("pos_sale_items_sale_idx").on(t.sale_id)]
);

export const discounts = pgTable(
  "pos_discounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull().default("percentage"),
    value: numeric("value", { precision: 8, scale: 2 }).notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pos_discounts_org_idx").on(t.organization_id)]
);

export const commissions = pgTable(
  "pos_commissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sale_id: uuid("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    staff_id: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    organization_id: uuid("organization_id").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    pct: numeric("pct", { precision: 5, scale: 2 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("pos_commissions_sale_idx").on(t.sale_id),
    index("pos_commissions_staff_idx").on(t.staff_id),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Organization settings
// ─────────────────────────────────────────────────────────────────────────────

export const settings = pgTable("pos_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: "cascade" }),
  business_name: text("business_name"),
  receipt_footer: text("receipt_footer"),
  tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
  tip_enabled: boolean("tip_enabled").notNull().default(true),
  online_booking_enabled: boolean("online_booking_enabled").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  users: many(users),
  customers: many(customers),
  staff: many(staff),
  services: many(services),
  serviceCategories: many(serviceCategories),
  appointments: many(appointments),
  products: many(products),
  productCategories: many(productCategories),
  sales: many(sales),
  discounts: many(discounts),
  settings: one(settings),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organization_id],
    references: [organizations.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organization_id],
    references: [organizations.id],
  }),
  appointments: many(appointments),
  sales: many(sales),
  notes: many(customerNotes),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [staff.organization_id],
    references: [organizations.id],
  }),
  schedules: many(staffSchedules),
  appointments: many(appointments),
  sales: many(sales),
  commissions: many(commissions),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [services.organization_id],
    references: [organizations.id],
  }),
  category: one(serviceCategories, {
    fields: [services.category_id],
    references: [serviceCategories.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  organization: one(organizations, {
    fields: [appointments.organization_id],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [appointments.customer_id],
    references: [customers.id],
  }),
  staff: one(staff, {
    fields: [appointments.staff_id],
    references: [staff.id],
  }),
  service: one(services, {
    fields: [appointments.service_id],
    references: [services.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [products.organization_id],
    references: [organizations.id],
  }),
  category: one(productCategories, {
    fields: [products.category_id],
    references: [productCategories.id],
  }),
  stockMovements: many(stockMovements),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [sales.organization_id],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [sales.customer_id],
    references: [customers.id],
  }),
  staff: one(staff, {
    fields: [sales.staff_id],
    references: [staff.id],
  }),
  appointment: one(appointments, {
    fields: [sales.appointment_id],
    references: [appointments.id],
  }),
  items: many(saleItems),
  commissions: many(commissions),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Inferred types
// ─────────────────────────────────────────────────────────────────────────────

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type CustomerNote = typeof customerNotes.$inferSelect;

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;

export type StaffSchedule = typeof staffSchedules.$inferSelect;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type ProductCategory = typeof productCategories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type StockMovement = typeof stockMovements.$inferSelect;

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export type SaleItem = typeof saleItems.$inferSelect;

export type Discount = typeof discounts.$inferSelect;

export type Commission = typeof commissions.$inferSelect;

export type Settings = typeof settings.$inferSelect;
