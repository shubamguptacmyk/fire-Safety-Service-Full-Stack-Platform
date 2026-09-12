import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import {
  LogOut,
  ShoppingBag,
  FileText,
  Bookmark,
  MapPin,
  ShieldCheck,
  Wrench,
  Receipt,
  User,
  Building2,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Flame,
} from "lucide-react";

export default function Profile() {
  const { user, refreshToken, clearSession } = useAuthStore();
  const navigate = useNavigate();

  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleLogout() {
    if (refreshToken) {
      await authService.logout(refreshToken).catch(() => {});
    }
    clearSession();
    navigate("/");
  }

  async function handleRequestPasswordReset() {
    if (!user?.email) {
      setResetError("No email address is linked to your account. Please contact support to register an email.");
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      await authService.forgotPassword(user.email);
      setResetSent(true);
    } catch (err: any) {
      setResetError(err?.response?.data?.message || "Failed to send reset email. Please try again later.");
    } finally {
      setResetLoading(false);
    }
  }

  if (!user) return null;

  const quickLinks = [
    {
      to: "/orders",
      label: "My Orders",
      desc: "Equipment delivery tracking, dispatch timeline & receipts",
      icon: ShoppingBag,
      color: "text-primary-700 bg-primary-50 border-primary-100",
    },
    {
      to: "/quotes",
      label: "B2B Quotations",
      desc: "Formal project estimates, volume rates & GST approvals",
      icon: FileText,
      color: "text-orange-700 bg-orange-50 border-orange-100",
    },
    {
      to: "/my-equipment",
      label: "Fire Equipment Tracker",
      desc: "Registered extinguishers, hydro-test schedules & statutory reminders",
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      to: "/service-history",
      label: "Service & Maintenance Log",
      desc: "Status of technician visits, cylinder refills & Form B tests",
      icon: Wrench,
      color: "text-blue-700 bg-blue-50 border-blue-100",
    },
    {
      to: "/invoices",
      label: "GST Tax Invoices",
      desc: "Download official compliance tax invoices & payment vouchers",
      icon: Receipt,
      color: "text-purple-700 bg-purple-50 border-purple-100",
    },
    {
      to: "/wishlist",
      label: "Saved Wishlist",
      desc: "Equipment shortlisted for future facility upgrades",
      icon: Bookmark,
      color: "text-rose-700 bg-rose-50 border-rose-100",
    },
    {
      to: "/addresses",
      label: "Premise & Site Addresses",
      desc: "Manage factory locations, plant addresses & delivery sites",
      icon: MapPin,
      color: "text-slate-700 bg-slate-100 border-slate-200",
    },
    {
      to: "/book-service",
      label: "Book Certified Inspection",
      desc: "Schedule emergency refill, hydrostatic test, or fire audit",
      icon: ExternalLink,
      color: "text-primary-700 bg-primary-50 border-primary-100",
    },
  ];

  return (
    <>
      <Seo
        title="Customer Safety Portal — Shubam Fire Protection"
        description="Manage your Shubam Fire Protection account, equipment records, Form B compliance, and quotations."
      />

      <div className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: "Customer Portal" }]} />
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer Safety Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-dark">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Authorized facility account &bull; Direct access to equipment records, Form B compliance &amp; orders
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors w-fit shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Profile Card & Security Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-primary-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-dark text-base font-display">{user.name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize mt-1 border border-slate-200">
                    {user.customerType} Client
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold">{user.phone}</span>
                </div>
                {user.email && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium break-all">{user.email}</span>
                  </div>
                )}
                {user.companyName && (
                  <div className="flex items-start gap-3 text-slate-700 pt-2 border-t border-slate-100">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-dark block font-bold">{user.companyName}</strong>
                      {user.gstNumber && (
                        <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                          GSTIN: {user.gstNumber}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security & Password Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lock className="w-4 h-4 text-dark" />
                <h3 className="font-bold text-dark text-sm font-display">Security Credentials</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need to update your account password? Receive a secure password reset link directly at your registered email address.
              </p>

              {resetSent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Reset link dispatched to {user.email}. Please check your inbox.</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestPasswordReset}
                  isLoading={resetLoading}
                  className="w-full"
                >
                  Send Password Reset Link
                </Button>
              )}

              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Services Grid */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Services &amp; Records Management
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-hover transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-3.5 shadow-2xs ${link.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-dark text-sm font-display group-hover:text-primary-700 transition-colors">
                        {link.label}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {link.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-700">
                      <span>Access Portal</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
