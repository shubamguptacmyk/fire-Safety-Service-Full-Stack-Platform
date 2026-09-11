// Granular, backend-enforced permission model (spec section 37).
// Roles map to a fixed permission set. requirePermission() middleware checks
// this on every protected route — the frontend hiding a button is UX only,
// never the actual authorization boundary.
export const PERMISSIONS = [
  "products.read", "products.create", "products.update", "products.delete",
  "categories.read", "categories.manage",
  "orders.read", "orders.update",
  "quotes.read", "quotes.create", "quotes.update",
  "customers.read", "customers.manage",
  "services.read", "services.update",
  "technicians.manage",
  "amc.read", "amc.manage",
  "equipment.read",
  "reviews.moderate",
  "blog.manage",
  "gallery.manage",
  "faqs.manage",
  "coupons.manage",
  "reports.read",
  "settings.manage",
  "audit.read",
  "notifications.manage",
  "admins.read",
  "admins.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type Role = "super_admin" | "admin" | "sales" | "technician" | "accountant" | "customer";

const ALL_PERMISSIONS = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS.filter((p) => p !== "settings.manage" && p !== "admins.manage"), // settings and admin management reserved for super_admin
  sales: [
    "products.read", "categories.read",
    "orders.read", "orders.update",
    "quotes.read", "quotes.create", "quotes.update",
    "customers.read", "customers.manage",
    "services.read",
    "amc.read", "amc.manage",
    "equipment.read",
    "reports.read",
  ],
  technician: ["services.read", "services.update", "equipment.read"],
  accountant: ["orders.read", "quotes.read", "reports.read", "customers.read"],
  customer: [], // customers act on their own resources via ownership checks, not role permissions
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
