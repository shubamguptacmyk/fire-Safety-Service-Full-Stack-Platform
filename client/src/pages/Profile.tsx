import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
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
      setResetError("No email address is linked to your account. Please contact support to update your email.");
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
      desc: "Track orders, dispatch updates & delivery status",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      to: "/quotes",
      label: "B2B Quotations",
      desc: "View submitted RFQs, approvals & download PDFs",
      icon: FileText,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      to: "/my-equipment",
      label: "Fire Equipment",
      desc: "Registered extinguishers, hydro-test logs & reminders",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      to: "/service-history",
      label: "Service Bookings",
      desc: "Status of technician visits, refills & inspections",
      icon: Wrench,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      to: "/wishlist",
      label: "Saved Wishlist",
      desc: "Products saved for future purchases or quotes",
      icon: Bookmark,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      to: "/invoices",
      label: "GST Invoices",
      desc: "Download official tax invoices & receipts",
      icon: Receipt,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      to: "/addresses",
      label: "Delivery Addresses",
      desc: "Manage saved shipping & site inspection locations",
      icon: MapPin,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      to: "/book-service",
      label: "Book a Service",
      desc: "Schedule fire extinguisher refill or safety audit",
      icon: ExternalLink,
      color: "text-brand bg-brand/5 border-brand/20",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Seo
        title="My Account — AK Fire Safety Service"
        description="Manage your AK Fire Safety customer account, orders, registered equipment, and safety services."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-black/10">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Account Dashboard</h1>
          <p className="text-sm text-steel mt-1">
            Welcome back, <span className="font-medium text-charcoal">{user.name}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors w-fit"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" /> Log Out
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card & Security Info */}
        <div className="space-y-6">
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-charcoal text-base">{user.name}</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                  {user.customerType} Client
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-charcoal/80">
                <Phone className="w-4 h-4 text-charcoal/40 shrink-0" />
                <span className="font-medium">{user.phone}</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-2.5 text-charcoal/80">
                  <Mail className="w-4 h-4 text-charcoal/40 shrink-0" />
                  <span className="font-medium break-all">{user.email}</span>
                </div>
              )}
              {user.companyName && (
                <div className="flex items-center gap-2.5 text-charcoal/80">
                  <Building2 className="w-4 h-4 text-charcoal/40 shrink-0" />
                  <span>
                    <strong className="text-charcoal font-semibold">{user.companyName}</strong>
                    {user.gstNumber && <span className="block text-steel mt-0.5">GST: {user.gstNumber}</span>}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security & Password Settings */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <Lock className="w-4 h-4 text-charcoal" />
              <h3 className="font-semibold text-charcoal text-sm">Security & Password</h3>
            </div>
            <p className="text-xs text-steel mb-4 leading-relaxed">
              Need to change your password? Request a secure reset email link to update your credentials.
            </p>

            {resetSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Reset email dispatched to {user.email}. Check your inbox to set a new password.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestPasswordReset}
                disabled={resetLoading}
                className="w-full text-xs font-semibold py-2 px-3 border border-black/15 hover:border-brand hover:text-brand rounded-lg transition-colors text-charcoal"
              >
                {resetLoading ? "Sending Link..." : "Send Password Reset Email"}
              </button>
            )}

            {resetError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-steel mb-4">
            Customer Services & Portals
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="bg-white border border-black/10 rounded-2xl p-5 hover:border-brand/40 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${link.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-charcoal text-sm group-hover:text-brand transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-xs text-steel mt-1 line-clamp-2 leading-relaxed">{link.desc}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-brand mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View details &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
