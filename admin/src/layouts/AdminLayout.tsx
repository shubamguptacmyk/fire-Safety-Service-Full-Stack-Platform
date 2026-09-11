import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wrench,
  Users,
  BarChart3,
  Settings,
  Flame,
  Bell,
  LogOut,
  MessageSquare,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Camera,
  CreditCard,
  Receipt,
  Tag,
  ShieldAlert,
  Menu,
  X,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Shield,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { authService } from "@/services/authService";
import { adminNotificationService } from "@/services/adminNotificationService";
import { apiClient } from "@/services/apiClient";
import NotificationCenterModal from "@/components/NotificationCenterModal";
import OmnisearchModal from "@/components/OmnisearchModal";
import ToastContainer from "@/components/ToastContainer";
import ErrorBoundary from "@/components/ErrorBoundary";

interface NavSection {
  title: string;
  items: Array<{
    to: string;
    label: string;
    icon: any;
    permission?: string;
  }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Commerce & Inventory",
    items: [
      { to: "/catalog", label: "Catalog & Stock", icon: Package, permission: "products.read" },
      { to: "/orders", label: "Orders & Quotes", icon: ShoppingBag, permission: "orders.read" },
      { to: "/invoices", label: "Tax Invoices", icon: Receipt, permission: "invoices.read" },
      { to: "/payments", label: "Payments", icon: CreditCard, permission: "payments.read" },
      { to: "/coupons", label: "Coupons", icon: Tag, permission: "coupons.read" },
    ],
  },
  {
    title: "Operations & Service",
    items: [
      { to: "/service", label: "AMC & Service", icon: Wrench, permission: "services.read" },
      { to: "/customers", label: "Customers 360", icon: Users, permission: "customers.read" },
    ],
  },
  {
    title: "Marketing & CMS",
    items: [
      { to: "/reviews", label: "Reviews", icon: MessageSquare, permission: "settings.manage" },
      { to: "/blog", label: "Blog CMS", icon: FileText, permission: "settings.manage" },
      { to: "/faqs", label: "FAQs", icon: HelpCircle, permission: "settings.manage" },
      { to: "/banners", label: "Banners", icon: ImageIcon, permission: "settings.manage" },
      { to: "/gallery", label: "Gallery", icon: Camera, permission: "settings.manage" },
    ],
  },
  {
    title: "Intelligence & Security",
    items: [
      { to: "/reports", label: "Reports & GST", icon: BarChart3, permission: "reports.read" },
      { to: "/admins", label: "Admin Management", icon: ShieldCheck, permission: "admins.read" },
      { to: "/audit-logs", label: "Audit Logs", icon: ShieldAlert, permission: "settings.manage" },
      { to: "/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
    ],
  },
];

export default function AdminLayout() {
  const { user, refreshToken, clearSession, can } = useAdminAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modals
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // System status & Notifications
  const [unreadCount, setUnreadCount] = useState(0);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Save collapse state
  function toggleCollapse() {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  }

  // Keyboard shortcut Ctrl+K / Cmd+K for Omnisearch
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close profile popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check API Health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await apiClient.get("/health");
        setApiOnline(res.data?.status === "ok" || res.data?.success === true);
      } catch {
        setApiOnline(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 90000);
    return () => clearInterval(interval);
  }, []);

  // Refresh Unread notification count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await adminNotificationService.getNotifications({ isRead: false, limit: 1 });
      setUnreadCount(res.meta?.total ?? 0);
    } catch {
      // silently ignore if unauthenticated or network error
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  async function handleLogout() {
    if (refreshToken) await authService.logout(refreshToken).catch(() => {});
    clearSession();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-paper text-ink selection:bg-brand/20 selection:text-brand-dark">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar: Responsive Desktop + Mobile Slide-out Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-ink text-white transition-all duration-300 ease-in-out lg:static lg:z-auto ${
          isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"} shrink-0`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <span className="font-display text-base font-bold tracking-tight block text-white truncate">
                  AK FIRE SAFETY
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber font-semibold block">
                  Command Center
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
          aria-label="Admin navigation"
        >
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => !item.permission || can(item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {(!isCollapsed || isMobileOpen) && (
                  <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 font-mono">
                    {section.title}
                  </h4>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      title={isCollapsed && !isMobileOpen ? item.label : undefined}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? "bg-brand text-white shadow-lg shadow-brand/20 font-bold"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        } ${isCollapsed && !isMobileOpen ? "justify-center px-0" : ""}`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle (Desktop only) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-white/10 text-xs text-white/60">
          {!isCollapsed && (
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] font-mono text-white/50 truncate">v2.0 · MIDC Turbhe</span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors mx-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern SaaS Header */}
        <header className="h-16 bg-white border-b border-black/10 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          {/* Left section: Hamburger for mobile + Omnisearch Trigger */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-paper text-steel hover:text-ink lg:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Omnisearch Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 max-w-md flex items-center gap-2.5 px-3.5 py-2 bg-paper/60 hover:bg-paper border border-black/10 rounded-xl text-xs text-steel hover:text-ink transition-all text-left shadow-2xs group"
            >
              <Search className="w-4 h-4 text-steel group-hover:text-brand transition-colors shrink-0" />
              <span className="truncate">Quick jump, products, orders...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-auto px-1.5 py-0.5 text-[10px] font-mono text-steel bg-white border border-black/10 rounded shadow-2xs">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right section: Health status, Storefront link, Notifications, Staff Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* API Health Pill */}
            {apiOnline !== null && (
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${
                  apiOnline
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
                title={apiOnline ? "Backend API cluster connected" : "Backend unreachable or degraded"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span>{apiOnline ? "API Online" : "API Offline"}</span>
              </div>
            )}

            {/* Public Storefront Link */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-steel hover:text-brand hover:bg-paper rounded-lg transition-colors border border-black/5"
              title="Open Public Customer Portal"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              aria-label="View notifications"
              className="relative p-2 rounded-xl hover:bg-paper text-steel hover:text-ink transition-colors border border-black/5"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-bold font-mono text-white bg-brand rounded-full flex items-center justify-center leading-none shadow-sm animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-paper border border-black/5 transition-colors text-left"
                aria-label="Staff profile menu"
              >
                <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center text-xs font-bold font-display shadow-sm">
                  {user?.name?.[0] ? user.name[0].toUpperCase() : "A"}
                </div>
                <div className="hidden xl:block text-xs leading-tight pr-1">
                  <span className="font-bold text-ink block truncate max-w-[120px]">{user?.name || "Staff Admin"}</span>
                  <span className="text-[10px] font-mono text-steel capitalize block">
                    {user?.role?.replace("_", " ") || "Administrator"}
                  </span>
                </div>
              </button>

              {/* Popover Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-black/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-black/5">
                  <div className="px-4 py-3">
                    <p className="font-bold text-xs text-ink truncate">{user?.name}</p>
                    <p className="text-[11px] text-steel font-mono truncate mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-brand/10 text-brand border border-brand/20">
                      Role: {user?.role?.replace("_", " ")}
                    </span>
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-steel" /> System Settings
                    </NavLink>
                    <NavLink
                      to="/audit-logs"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-steel" /> Security & Audit
                    </NavLink>
                    {can("admins.read") && (
                      <NavLink
                        to="/admins"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-steel" /> Admin Management
                      </NavLink>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <NotificationCenterModal
        isOpen={isNotifOpen}
        onClose={() => {
          setIsNotifOpen(false);
          refreshUnreadCount();
        }}
        onNotificationRead={refreshUnreadCount}
      />

      <OmnisearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}
