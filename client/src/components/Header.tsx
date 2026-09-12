import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Flame,
  ShoppingCart,
  Menu,
  X,
  User as UserIcon,
  Heart,
  FileSpreadsheet,
  ShieldCheck,
  ChevronDown,
  Wrench,
  Bell,
  Phone,
  Clock,
  ExternalLink,
  FlameKindling,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { notificationService, ApiNotification } from "@/services/notificationService";
import SearchBar from "./SearchBar";

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const lines = useCartStore((s) => s.lines);
  const wishlistIds = useWishlistStore((s) => s.itemIds);
  const { user, isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const cartCount = lines.reduce((s, l) => s + l.quantity, 0);

  // Scroll listener for compact sticky header
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns and drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesDropdown(false);
    setNotifDropdown(false);
    setUserDropdown(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications if logged in
  useEffect(() => {
    if (loggedIn) {
      notificationService
        .getMyNotifications({ limit: 5 })
        .then((res) => {
          setNotifications(res.items || []);
          setUnreadCount(res.unreadCount ?? res.items?.filter((n) => !n.isRead).length ?? 0);
        })
        .catch(() => {
          setNotifications([]);
          setUnreadCount(0);
        });
    }
  }, [loggedIn]);

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setUnreadCount(0);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      {/* Top Professional Trust & Contact Bar */}
      <div className="bg-dark text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-6 min-w-0">
            <span className="flex items-center gap-1.5 text-slate-300 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-[11px] sm:text-xs truncate">
                Govt. Licensed Agency
                <span className="hidden sm:inline font-normal text-slate-400"> &bull; Form B &amp; BIS ISI Certified</span>
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-slate-300 text-[11px] sm:text-xs">
            <a
              href="tel:+919800000000"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-500 shrink-0" />
              <span className="font-semibold whitespace-nowrap">+91 98000 00000</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>24/7 Emergency Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`bg-white transition-all duration-200 border-b border-slate-200 ${
          scrolled ? "py-2.5 shadow-sm" : "py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-700 flex items-center justify-center shadow-sm text-white group-hover:bg-primary-800 transition-colors shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-display text-base sm:text-xl font-extrabold tracking-tight text-dark block leading-none">
                SHUBAM <span className="text-primary-700">FIRE</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 hidden sm:block mt-0.5">
                Professional Fire Protection &amp; Safety
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md lg:max-w-xl mx-2 lg:mx-4 relative z-30">
            <SearchBar />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link
              to="/"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname === "/" ? "text-primary-700 font-bold" : ""
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname.startsWith("/products") ? "text-primary-700 font-bold" : ""
              }`}
            >
              Products
            </Link>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdown(true)}
              onMouseLeave={() => setServicesDropdown(false)}
            >
              <button
                className={`flex items-center gap-1 hover:text-primary-700 transition-colors py-1 ${
                  location.pathname.startsWith("/services") ? "text-primary-700 font-bold" : ""
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {servicesDropdown && (
                <div className="absolute top-full -left-4 w-72 bg-white border border-slate-200 rounded-2xl shadow-elevated py-2 text-xs flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Engineering Services
                  </div>
                  <Link
                    to="/services"
                    className="px-4 py-2.5 hover:bg-slate-50 text-slate-800 hover:text-primary-700 font-bold flex items-center gap-2.5"
                  >
                    <Wrench className="w-4 h-4 text-primary-700" />
                    <span>All Fire Protection Services</span>
                  </Link>
                  <Link
                    to="/services/amc"
                    className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-primary-700 flex items-center gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-dark">AMC &amp; Form B Inspection</p>
                      <p className="text-[11px] text-slate-500">Statutory municipal compliance</p>
                    </div>
                  </Link>
                  <Link
                    to="/services/refilling"
                    className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-primary-700 flex items-center gap-2.5"
                  >
                    <FlameKindling className="w-4 h-4 text-accent" />
                    <div>
                      <p className="font-semibold text-dark">Cylinder Refill &amp; Hydro-Test</p>
                      <p className="text-[11px] text-slate-500">Hydrostatic testing at 35 kg/cm²</p>
                    </div>
                  </Link>
                  <Link
                    to="/services/fire-safety-audit"
                    className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-primary-700 flex items-center gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold text-dark">Building Fire Safety Audits</p>
                      <p className="text-[11px] text-slate-500">Maharashtra Fire Act compliance</p>
                    </div>
                  </Link>
                  <Link
                    to="/services/installation"
                    className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-primary-700 flex items-center gap-2.5"
                  >
                    <Wrench className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-semibold text-dark">Turnkey System Installation</p>
                      <p className="text-[11px] text-slate-500">Hydrants, sprinklers &amp; gas flooding</p>
                    </div>
                  </Link>
                  <div className="p-2 border-t border-slate-100 bg-slate-50/70 mt-1">
                    <Link
                      to="/book-service"
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary-700 text-white font-bold hover:bg-primary-800 transition-colors shadow-2xs text-xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Book Technician Visit</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/services/amc"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname === "/services/amc" ? "text-primary-700 font-bold" : ""
              }`}
            >
              AMC
            </Link>

            <Link
              to="/about"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname === "/about" ? "text-primary-700 font-bold" : ""
              }`}
            >
              About
            </Link>

            <Link
              to="/blog"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname.startsWith("/blog") ? "text-primary-700 font-bold" : ""
              }`}
            >
              Resources
            </Link>

            <Link
              to="/contact"
              className={`hover:text-primary-700 transition-colors ${
                location.pathname === "/contact" ? "text-primary-700 font-bold" : ""
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Suite */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-primary-700 hover:bg-slate-100 rounded-xl transition-colors min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
              title="Saved Equipment / Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Notification Bell (If Logged In) */}
            {loggedIn && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifDropdown((v) => !v)}
                  className="relative p-2 text-slate-600 hover:text-primary-700 hover:bg-slate-100 rounded-xl transition-colors min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
                  title="Compliance & Service Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white text-dark rounded-2xl shadow-elevated border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-dark uppercase tracking-wider">
                        Compliance &amp; Alerts
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary-700 hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No new notifications at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-4 text-xs transition-colors ${
                              n.isRead ? "bg-white" : "bg-orange-50/50"
                            }`}
                          >
                            <p className="font-bold text-dark">{n.title}</p>
                            <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-2 block">
                              {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account / User Portal */}
            {user ? (
              <div ref={userRef} className="relative hidden sm:block">
                <button
                  onClick={() => setUserDropdown((v) => !v)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-semibold text-dark transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-elevated py-2 text-xs z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-dark truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email || user.phone}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Customer Portal</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/quotes"
                      className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                      <span>B2B Quotations</span>
                    </Link>
                    <Link
                      to="/my-equipment"
                      className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <Wrench className="w-4 h-4 text-slate-400" />
                      <span>Equipment Tracker</span>
                    </Link>
                    <Link
                      to="/service-history"
                      className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span>Service History</span>
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => useAuthStore.getState().clearSession()}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary-700 px-2.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t("nav.login")}</span>
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 p-2 text-slate-700 hover:text-primary-700 hover:bg-slate-100 rounded-xl transition-colors min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  className="bg-primary-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs -top-0.5 -right-0.5 absolute"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Prominent B2B Quote CTA Button */}
            <Link
              to="/request-quote"
              className="hidden sm:inline-flex items-center gap-1.5 bg-primary-700 hover:bg-primary-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Request Quote</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              className="lg:hidden p-2 text-slate-700 hover:text-dark hover:bg-slate-100 rounded-xl transition-colors min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar on small screens */}
        <div className="md:hidden px-3 sm:px-4 pt-2 pb-1.5 border-t border-slate-100">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Drawer Navigation (Slide-in Drawer with Backdrop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay preventing accidental clicks */}
          <div
            className="fixed inset-0 bg-dark/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-700 flex items-center justify-center text-white shadow-xs">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-display font-extrabold text-base text-dark block leading-none">
                    SHUBAM <span className="text-primary-700">FIRE</span>
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mt-0.5">
                    Navigation Menu
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-500 hover:text-dark hover:bg-slate-200/60 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions CTA */}
            <div className="p-4 border-b border-slate-100 grid grid-cols-2 gap-2 bg-white">
              <Link
                to="/request-quote"
                className="py-3 px-2 rounded-xl bg-primary-700 text-white font-bold text-center flex items-center justify-center gap-1.5 text-xs shadow-xs min-h-[44px] active:scale-95 transition-transform"
                onClick={() => setMobileOpen(false)}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Request Quote</span>
              </Link>
              <Link
                to="/book-service"
                className="py-3 px-2 rounded-xl bg-slate-900 text-white font-bold text-center flex items-center justify-center gap-1.5 text-xs shadow-xs min-h-[44px] active:scale-95 transition-transform"
                onClick={() => setMobileOpen(false)}
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Book Service</span>
              </Link>
            </div>

            {/* Navigation Links Scrollable List */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 text-xs font-semibold text-slate-700 divide-y divide-slate-100/70">
              <div className="space-y-0.5 pb-2">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  All Safety Products &amp; Equipment
                </Link>
              </div>

              <div className="space-y-0.5 py-2">
                <span className="px-3 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Engineering Services
                </span>
                <Link
                  to="/services"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px] font-bold text-slate-800"
                  onClick={() => setMobileOpen(false)}
                >
                  All Fire Protection Services
                </Link>
                <Link
                  to="/services/amc"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px] pl-6 text-slate-600"
                  onClick={() => setMobileOpen(false)}
                >
                  &bull; AMC &amp; Form B Inspection
                </Link>
                <Link
                  to="/services/refilling"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px] pl-6 text-slate-600"
                  onClick={() => setMobileOpen(false)}
                >
                  &bull; Cylinder Refill &amp; Hydro-Test
                </Link>
                <Link
                  to="/services/fire-safety-audit"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px] pl-6 text-slate-600"
                  onClick={() => setMobileOpen(false)}
                >
                  &bull; Building Fire Safety Audits
                </Link>
                <Link
                  to="/services/installation"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px] pl-6 text-slate-600"
                  onClick={() => setMobileOpen(false)}
                >
                  &bull; Turnkey Installation
                </Link>
              </div>

              <div className="space-y-0.5 py-2">
                <span className="px-3 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Portal &amp; Records
                </span>
                <Link
                  to="/my-equipment"
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-100 text-primary-700 font-bold min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  My Equipment Tracker
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  My Equipment Orders
                </Link>
                <Link
                  to="/quotes"
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  B2B Quotations
                </Link>
                <Link
                  to="/service-history"
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  Service &amp; Maintenance History
                </Link>
              </div>

              <div className="space-y-0.5 py-2">
                <span className="px-3 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Company &amp; Resources
                </span>
                <Link
                  to="/about"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px]"
                  onClick={() => setMobileOpen(false)}
                >
                  About Shubam Fire Protection
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px]"
                  onClick={() => setMobileOpen(false)}
                >
                  Safety Guides &amp; Articles
                </Link>
                <Link
                  to="/faq"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px]"
                  onClick={() => setMobileOpen(false)}
                >
                  Frequently Asked Questions (FAQ)
                </Link>
                <Link
                  to="/gallery"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px]"
                  onClick={() => setMobileOpen(false)}
                >
                  Project Installation Gallery
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-primary-700 min-h-[40px]"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact Support
                </Link>
              </div>
            </nav>

            {/* Drawer Bottom Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <Link
                to={user ? "/profile" : "/login"}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 font-bold text-primary-700 flex items-center justify-center gap-2 shadow-2xs min-h-[44px] text-xs"
                onClick={() => setMobileOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                <span>{user ? `Customer Portal (${user.name})` : "Sign In / Register"}</span>
              </Link>
              <a
                href="tel:+919800000000"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-200/70 text-slate-700 font-semibold flex items-center justify-center gap-2 text-xs min-h-[44px]"
              >
                <Phone className="w-3.5 h-3.5 text-primary-700" />
                <span>24/7 Hotline: +91 98000 00000</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
