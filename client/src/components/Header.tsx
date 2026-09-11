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
  Check,
  BookOpen,
  Info,
  Phone,
  Clock,
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
  const [scrolled, setScrolled] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const cartCount = lines.reduce((s, l) => s + l.quantity, 0);

  // Scroll transition listener
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesDropdown(false);
    setNotifDropdown(false);
  }, [location.pathname]);

  // Click outside to dismiss notifications
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdown(false);
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
          setNotifications(res.items);
          setUnreadCount(res.unreadCount || res.items.filter((n) => !n.isRead).length);
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
    <>
      <div className="h-1 hazard-strip" />
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-ink/95 backdrop-blur-md shadow-lg py-2 border-b border-white/10"
            : "bg-ink py-3.5 shadow-md"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded bg-brand flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-amber" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white block leading-none">
                AK FIRE SAFETY
              </span>
              <span className="text-[9px] uppercase tracking-widest text-amber font-mono block">
                Govt. Licensed Agency
              </span>
            </div>
          </Link>

          {/* Search Bar on Desktop */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm mx-2">
            <SearchBar />
          </div>

          {/* Primary Navigation Desktop */}
          <nav
            className="hidden lg:flex items-center gap-4 text-xs font-medium text-white/80"
            aria-label="Primary"
          >
            <Link
              to="/products"
              className={`hover:text-white transition-colors ${
                location.pathname.startsWith("/products") ? "text-white font-bold" : ""
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
                className={`flex items-center gap-1 hover:text-white transition-colors py-1 ${
                  location.pathname.startsWith("/services") ? "text-white font-bold" : ""
                }`}
              >
                Services <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {servicesDropdown && (
                <div className="absolute top-full left-0 w-60 bg-ink border border-white/15 rounded-xl shadow-2xl py-2 text-xs flex flex-col z-50 animate-in fade-in slide-in-from-top-1">
                  <Link
                    to="/services"
                    className="px-4 py-2 hover:bg-white/10 hover:text-white font-bold flex items-center gap-2 text-white"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber" /> All Fire Safety Services
                  </Link>
                  <Link
                    to="/services/amc"
                    className="px-4 py-2 hover:bg-white/10 hover:text-white flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> AMC & Form B Inspection
                  </Link>
                  <Link
                    to="/services/refilling"
                    className="px-4 py-2 hover:bg-white/10 hover:text-white"
                  >
                    Cylinder Refill & Hydro-Test
                  </Link>
                  <Link
                    to="/services/fire-safety-audit"
                    className="px-4 py-2 hover:bg-white/10 hover:text-white"
                  >
                    Building Fire Safety Audits
                  </Link>
                  <Link
                    to="/services/installation"
                    className="px-4 py-2 hover:bg-white/10 hover:text-white"
                  >
                    Turnkey Hydrant & FM-200 Installation
                  </Link>
                  <Link
                    to="/services/inspection"
                    className="px-4 py-2 hover:bg-white/10 hover:text-white"
                  >
                    Testing & Verification Diagnostics
                  </Link>
                  <Link
                    to="/book-service"
                    className="mt-1 pt-1 border-t border-white/10 px-4 py-2 text-amber font-bold hover:bg-white/10 flex items-center justify-between"
                  >
                    <span>Book Technician Visit</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/services/amc"
              className={`hover:text-white transition-colors ${
                location.pathname === "/services/amc" ? "text-white font-bold" : ""
              }`}
            >
              AMC
            </Link>

            <Link
              to="/about"
              className={`hover:text-white transition-colors ${
                location.pathname === "/about" ? "text-white font-bold" : ""
              }`}
            >
              About
            </Link>

            <Link
              to="/blog"
              className={`hover:text-white transition-colors ${
                location.pathname.startsWith("/blog") ? "text-white font-bold" : ""
              }`}
            >
              Resources & Blog
            </Link>

            <Link
              to="/contact"
              className={`hover:text-white transition-colors ${
                location.pathname === "/contact" ? "text-white font-bold" : ""
              }`}
            >
              Contact
            </Link>

            <Link
              to="/request-quote"
              className="hover:text-amber text-amber font-bold transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> B2B Quote
            </Link>
          </nav>

          {/* Right Action Icons: Wishlist, Notifications, Account, Cart, Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-1.5 text-white/80 hover:text-white transition-colors"
              title="Saved Equipment / Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Notification Bell (If Logged In) */}
            {loggedIn && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifDropdown((v) => !v)}
                  className="relative p-1.5 text-white/80 hover:text-white transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber text-ink text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white text-ink rounded-xl shadow-2xl border border-black/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-black/10 flex items-center justify-between">
                      <span className="font-display font-bold text-xs">Compliance Alerts</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-brand hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-black/5">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-steel">
                          No new notifications at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 text-xs transition-colors ${
                              n.isRead ? "bg-white" : "bg-amber-50/50"
                            }`}
                          >
                            <p className="font-bold text-ink">{n.title}</p>
                            <p className="text-steel mt-0.5 text-[11px]">{n.message}</p>
                            <span className="text-[10px] text-steel/60 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account / Login */}
            <Link
              to={user ? "/profile" : "/login"}
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors"
            >
              <UserIcon className="w-4 h-4" aria-hidden="true" />
              <span>{user ? user.name.split(" ")[0] : t("nav.login")}</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 bg-brand hover:bg-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.cart")}</span>
              {cartCount > 0 && (
                <span
                  className="bg-amber text-ink text-[11px] font-bold rounded-full px-1.5 py-0.2 shadow-sm"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-1 text-white/80 hover:text-white"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-3 text-xs bg-ink animate-in fade-in">
            <div className="pb-1">
              <SearchBar placeholder="Search equipment, codes, SKU..." />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <Link
                to="/products"
                className="p-2 rounded bg-white/5 text-white hover:bg-white/10 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Catalog / Products
              </Link>
              <Link
                to="/services"
                className="p-2 rounded bg-white/5 text-white hover:bg-white/10 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                All Services
              </Link>
              <Link
                to="/services/amc"
                className="p-2 rounded bg-white/5 text-white hover:bg-white/10 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                AMC & Form B
              </Link>
              <Link
                to="/book-service"
                className="p-2 rounded bg-brand text-white font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Book Technician
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2 text-white/80">
              <Link
                to="/request-quote"
                className="py-1.5 text-amber font-bold flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <FileSpreadsheet className="w-4 h-4" /> Request B2B Quotation
              </Link>
              <Link
                to="/my-equipment"
                className="py-1 hover:text-white flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Wrench className="w-4 h-4 text-brand" /> My Equipment Tracker
              </Link>
              <Link
                to="/blog"
                className="py-1 hover:text-white flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <BookOpen className="w-4 h-4 text-amber" /> Safety Guides & Blog
              </Link>
              <Link
                to="/about"
                className="py-1 hover:text-white flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Info className="w-4 h-4 text-brand" /> About AK Fire Safety
              </Link>
              <Link
                to="/faq"
                className="py-1 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                Frequently Asked Questions (FAQ)
              </Link>
              <Link
                to="/gallery"
                className="py-1 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                Project Installation Gallery
              </Link>
              <Link
                to="/contact"
                className="py-1 hover:text-white flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Phone className="w-4 h-4 text-brand" /> Contact Us
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <Link
                to={user ? "/profile" : "/login"}
                className="py-1 text-amber flex items-center gap-2 font-bold"
                onClick={() => setMobileOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                {user ? `Account (${user.name})` : "Login / Register"}
              </Link>
              <Link
                to="/wishlist"
                className="py-1 text-white/70 hover:text-white flex items-center gap-1"
                onClick={() => setMobileOpen(false)}
              >
                <Heart className="w-4 h-4 text-brand" /> Wishlist ({wishlistIds.length})
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
