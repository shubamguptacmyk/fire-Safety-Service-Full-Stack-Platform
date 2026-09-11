import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  FileSpreadsheet,
  ShieldCheck,
  Wrench,
  Receipt,
  MapPin,
  Heart,
  LogOut,
  CalendarCheck,
  FileCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";

export default function AccountNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshToken, clearSession } = useAuthStore();

  if (!user) return null;

  async function handleLogout() {
    if (refreshToken) {
      await authService.logout(refreshToken).catch(() => {});
    }
    clearSession();
    navigate("/");
  }

  const navItems = [
    { to: "/profile", label: "Dashboard", icon: User },
    { to: "/orders", label: "Orders & Delivery", icon: ShoppingBag },
    { to: "/quotes", label: "B2B Quotations", icon: FileSpreadsheet },
    { to: "/my-equipment", label: "Equipment Registry", icon: ShieldCheck },
    { to: "/service-history", label: "Service History", icon: CalendarCheck },
    { to: "/book-service", label: "Book Technician", icon: Wrench },
    { to: "/services/amc", label: "AMC & Form B", icon: FileCheck },
    { to: "/invoices", label: "GST Tax Invoices", icon: Receipt },
    { to: "/addresses", label: "Saved Addresses", icon: MapPin },
    { to: "/wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      {/* User Identity Card */}
      <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-base">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-ink text-sm truncate">{user.name}</h3>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber/15 text-ink border border-amber/30">
              {user.customerType || "Retail"} Client
            </span>
          </div>
        </div>
        {user.companyName && (
          <p className="text-xs text-steel mt-3 pt-3 border-t border-black/5 truncate">
            🏢 {user.companyName}
          </p>
        )}
      </div>

      {/* Navigation Links (Desktop Vertical List, Mobile Horizontal Scroll) */}
      <nav
        className="bg-white border border-black/10 rounded-2xl p-2 shadow-sm flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1"
        aria-label="Account Navigation"
      >
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/profile" && location.pathname.startsWith(item.to));

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "text-steel hover:text-ink hover:bg-paper"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-steel"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1 pt-2 border-t border-black/5 whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </nav>
    </aside>
  );
}
