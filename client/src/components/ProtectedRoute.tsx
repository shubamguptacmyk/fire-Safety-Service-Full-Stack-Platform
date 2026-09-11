import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Frontend route gating is a UX convenience only — every API endpoint behind
// this still enforces auth/RBAC server-side regardless of what this renders.
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
