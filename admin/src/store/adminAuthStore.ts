import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StaffUser, Role } from "@/types";

// Client-side permission mirror — for UI convenience (hiding nav items) ONLY.
// The server independently re-checks every request; this list must never be
// treated as the security boundary.
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ["*"],
  admin: [
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
    "audit.read",
    "notifications.manage",
    "admins.read",
    // Note: admins.manage and settings.manage are reserved for super_admin
  ],
  sales: [
    "products.read",
    "orders.read",
    "orders.update",
    "quotes.read",
    "quotes.create",
    "quotes.update",
    "customers.read",
    "customers.manage",
    "amc.read",
    "amc.manage",
    "reports.read",
    "payments.read",
    "coupons.read",
  ],
  technician: ["services.read", "services.update", "equipment.read"],
  accountant: [
    "orders.read",
    "quotes.read",
    "reports.read",
    "customers.read",
    "payments.read",
    "payments.manage",
    "invoices.read",
    "invoices.create",
    "coupons.read",
  ],
  customer: [],
};

interface AdminAuthState {
  user: StaffUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: StaffUser, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
  can: (permission: string) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      clearSession: () => set({ user: null, accessToken: null, refreshToken: null }),
      isAuthenticated: () => Boolean(get().accessToken),
      can: (permission: string) => {
        const role = get().user?.role;
        if (!role) return false;
        const perms = ROLE_PERMISSIONS[role];
        return perms.includes("*") || perms.includes(permission);
      },
    }),
    { name: "ak-fire-safety-admin-auth" }
  )
);
