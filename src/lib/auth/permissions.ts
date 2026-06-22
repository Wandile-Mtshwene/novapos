type Role = "owner" | "admin" | "manager" | "cashier" | "staff" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 6,
  admin: 5,
  manager: 4,
  cashier: 3,
  staff: 2,
  viewer: 1,
};

export function hasRole(userRole: string, required: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[required];
  return userLevel >= requiredLevel;
}

export function canManage(userRole: string) {
  return hasRole(userRole, "manager");
}

export function canAdmin(userRole: string) {
  return hasRole(userRole, "admin");
}

export function canCheckout(userRole: string) {
  return hasRole(userRole, "cashier");
}

export function canViewReports(userRole: string) {
  return hasRole(userRole, "staff");
}

export function isOwner(userRole: string) {
  return userRole === "owner";
}
