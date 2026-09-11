import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import AccountNav from "@/components/AccountNav";
import {
  LogOut,
  ShoppingBag,
  FileSpreadsheet,
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
  CalendarCheck,
  FileCheck,
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
      icon: FileSpreadsheet,
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
      to: "/services/amc",
      label: "AMC & Form B",
      desc: "Active maintenance contracts & statutory compliance",
      icon: FileCheck,
      color: "text-red-600 bg-red-50 border-red-100",
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
      label: "Book a Technician",
      desc: "Schedule fire extinguisher refill or safety audit",
      icon: ExternalLink,
      color: "text-brand bg-brand/5 border-brand/20",
    },
  ];

  return (
    <>
      <Seo
        title="My Account — AK Fire Safety Service"
        description="Manage your AK Fire Safety customer account, orders, registered equipment, and safety services."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand font-mono">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-0.5">
              Account Overview
            </h1>
            <p className="text-xs sm:text-sm text-steel mt-0.5">
              Welcome back, <strong className="text-ink">{user.name}</strong>. Manage your commercial equipment, orders, and safety certificates.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />

          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* User Profile & Company Credentials Card */}
            <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg font-display">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-ink text-base">{user.name}</h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                      {user.customerType || "Retail"} Account
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-steel block">Account Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-safe">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Verified
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-paper/60 rounded-xl border border-black/5 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand shrink-0" />
                  <div>
                    <span className="text-[10px] text-steel block">Phone Number</span>
                    <strong className="text-ink font-medium">{user.phone}</strong>
                  </div>
                </div>

                <div className="p-3 bg-paper/60 rounded-xl border border-black/5 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand shrink-0" />
                  <div>
                    <span className="text-[10px] text-steel block">Email Address</span>
                    <strong className="text-ink font-medium break-all">{user.email || "Not Provided"}</strong>
                  </div>
                </div>

                {user.companyName && (
                  <div className="p-3 bg-paper/60 rounded-xl border border-black/5 flex items-center gap-3 sm:col-span-2">
                    <Building2 className="w-4 h-4 text-brand shrink-0" />
                    <div>
                      <span className="text-[10px] text-steel block">Company / Housing Society Name</span>
                      <strong className="text-ink font-medium">{user.companyName}</strong>
                      {user.gstNumber && (
                        <span className="ml-2 text-steel font-mono text-[11px]">(GSTIN: {user.gstNumber})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Portals Grid */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-steel mb-3">
                Quick Service &amp; Asset Management
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
                        <h3 className="font-semibold text-ink text-sm group-hover:text-brand transition-colors">
                          {link.label}
                        </h3>
                        <p className="text-xs text-steel mt-1 line-clamp-2 leading-relaxed">{link.desc}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-brand mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Access portal &rarr;
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Security & Password Settings Card */}
            <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-black/10 mb-4">
                <Lock className="w-4 h-4 text-brand" />
                <h3 className="font-bold text-ink text-sm">Security &amp; Account Credentials</h3>
              </div>
              <p className="text-xs text-steel mb-4 leading-relaxed max-w-xl">
                Update your account password or request a secure verification link to ensure authorized access to facility records.
              </p>

              {resetSent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Password reset email dispatched to <strong>{user.email}</strong>. Check your inbox to proceed.</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    disabled={resetLoading}
                    className="text-xs font-bold py-2.5 px-4 bg-paper hover:bg-gray-200 border border-black/15 hover:border-brand hover:text-brand rounded-lg transition-colors text-ink disabled:opacity-50"
                  >
                    {resetLoading ? "Sending Link..." : "Send Password Reset Email"}
                  </button>
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-1.5 text-xs text-red-700">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
