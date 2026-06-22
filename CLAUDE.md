# NovaPOS

NovaPOS is a modern point-of-sale and booking OS for appointment-based service businesses.

Part of the Nova Business OS suite, alongside NovaPilot and NovaHR.

## Writing rules

### ABSOLUTE PROHIBITION: No dashes as punctuation

NEVER use em dashes (U+2014, `—`), en dashes (U+2013, `–`), or their HTML entities (`&mdash;` `&ndash;` `&#8212;` `&#8211;`) anywhere in this codebase.

Use a comma, colon, period, or rephrase the sentence instead.

**Wrong:** `// Singleton pool — reused across hot reloads`
**Correct:** `// Singleton pool: reused across hot reloads`

## Architecture

- **Framework:** Next.js 16, App Router, TypeScript
- **Auth:** better-auth with email/password; `getOrgSession()` returns userId, orgId, role
- **Database:** Drizzle ORM + Neon PostgreSQL; all tables prefixed `pos_`
- **UI:** TailwindCSS v4, shadcn/ui, base-ui primitives, Lucide icons, Recharts
- **Validation:** Zod schemas in `src/lib/validation.ts`
- **Permissions:** Role hierarchy in `src/lib/auth/permissions.ts`; canManage/canAdmin guards on destructive actions

## Domain model

All data is scoped to `organization_id`. The data model has:
- `pos_organizations` as the multi-tenant root
- `pos_users` with role enum: owner/admin/manager/cashier/staff/viewer
- `pos_customers`, `pos_customer_notes`
- `pos_staff`, `pos_staff_schedules`
- `pos_service_categories`, `pos_services`
- `pos_product_categories`, `pos_products`, `pos_stock_movements`
- `pos_appointments` (links customer, staff, service)
- `pos_sales`, `pos_sale_items`, `pos_discounts`, `pos_commissions`
- `pos_settings` (per-org config: tax rate, tip toggle, receipt footer)

On signup, `auth.ts` databaseHooks automatically provisions a `pos_organization` and `pos_user` row for each new user.

## Query pattern

Each domain has two files:
1. `src/lib/db/queries/{domain}.ts`: raw Drizzle queries, always takes `organization_id` as first arg
2. `src/lib/{domain}/actions.ts`: "use server" wrapper, calls `getOrgSession()`, validates with Zod, then calls the query

## Design system

- Accent color: purple (#8B5CF6); `--nova-accent`
- Background: #1A1E2E; `--nova-surface`
- Cards: #1E2235; `--nova-card`
- Deep background: #141728; `--nova-deep`
- Font: Plus Jakarta Sans (300-800) + JetBrains Mono
- All CSS variables are `--nova-*` following the NovaPilot pattern
- Dark-first; light mode via `html.light` class

## Folder conventions

- `src/app/(auth)` - public auth pages (login, signup)
- `src/app/(dashboard)` - protected app pages; layout.tsx calls getOrgSession()
- `src/components/ui` - shared primitive components (dialog, button, badge, table, etc.)
- `src/components/layout` - Sidebar, Header, BottomNav
- `src/components/{domain}` - feature-specific views and dialogs
- `src/lib/auth` - better-auth config, session helper, permissions
- `src/lib/db` - Drizzle schema (schema.ts), auth schema, singleton pool, queries by domain
- `src/lib/{domain}/actions.ts` - server actions per domain
- `src/lib/validation.ts` - Zod schemas for all entities

## Key components

- `Sidebar`: collapsible (w-60/w-14), localStorage key "novapos-sidebar"
- `AppointmentDialog`: create/edit/delete appointments; used in CalendarView
- `ServiceDialog`, `CustomerDialog`, `ProductDialog`, `StaffDialog`: CRUD dialogs
- `StockAdjustDialog`: adjust product stock with movement type
- `CheckoutView`: live cart, real services/products, payment methods, completeSaleAction
- `ReportsView`: Recharts AreaChart + BarChart, real getRevenueSummary/getDailyRevenue data
- `SettingsView`: tabbed settings page, wired to saveBusinessSettingsAction/saveReceiptSettingsAction
- `ErrorBoundary`: React class component for catching render errors

## Phase status

- Phase 1: Foundation (complete)
- Phase 2: Database schema and query layer (complete)
- Phase 3: Calendar with real appointment data and AppointmentDialog (complete)
- Phase 4: Services CRUD with ServiceDialog (complete)
- Phase 5: Customers CRUD with CustomerDialog (complete)
- Phase 6: Products CRUD with ProductDialog (complete)
- Phase 7: Inventory view with StockAdjustDialog (complete)
- Phase 8: Checkout wired to real services/products and completeSaleAction (complete)
- Phase 9: Staff CRUD with StaffDialog (complete)
- Phase 10: Reports with real Recharts charts (complete)
- Phase 11: Settings forms wired to save actions (complete)
- Phase 12: Role-based permission guards on destructive server actions (complete)
- Phase 13: Zod validation schemas, ErrorBoundary component (complete)
- Phase 14: Architecture documentation (complete)

## Next steps (post-launch)

- Appointments list page (`/dashboard/appointments`) full table view
- Customer detail page with appointment history and notes
- Online booking widget
- Receipt printing / PDF export
- Multi-location support
- Push notifications for booking reminders
