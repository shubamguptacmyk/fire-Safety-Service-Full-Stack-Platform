import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "@/store/adminAuthStore";

// Staff-only gate. Customers who somehow obtain a valid customer JWT still
// cannot act as staff — every admin API route independently checks role/permissions.
export default function ProtectedRoute({ permission }: { permission?: string }) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated());
  const can = useAdminAuthStore((s) => s.can);
  const role = useAdminAuthStore((s) => s.user?.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === "customer") return <Navigate to="/login" replace />;
  if (permission && !can(permission)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
