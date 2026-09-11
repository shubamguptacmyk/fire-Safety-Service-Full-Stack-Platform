import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Building,
  Phone,
  FileText,
  Mail,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  Percent,
} from "lucide-react";
import {
  adminSettingsService,
  AllSettingsResponse,
  CompanySettings,
  TaxSettings,
  ShippingSettings,
  InvoicingSettings,
  AMCSettings,
  NotificationSettings,
  EmailSettings,
} from "@/services/adminSettingsService";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorState from "@/components/ErrorState";
import { useToast } from "@/store/toastStore";

type SettingsTab =
  | "general"
  | "company"
  | "contact"
  | "gst"
  | "email"
  | "notifications"
  | "system";

export default function SettingsAdmin() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Live Settings State
  const [company, setCompany] = useState<CompanySettings>({
    name: "AK Fire Safety & Engineering Solutions",
    tagline: "Licensed Category A Fire Safety Agency",
    phone: "+91 98200 00000",
    email: "contact@akfiresafety.com",
    supportEmail: "support@akfiresafety.com",
    address: "Shop 4, Fire Safety Plaza, MIDC Turbhe, Navi Mumbai, Maharashtra 400705",
    gstin: "27AAAAA0000A1Z5",
    pan: "AAAAA0000A",
    licenseNo: "MFS/LA/CAT-A/2024/0987",
    category: "Category A - Licensed Fire Agency",
    workingHours: "Mon - Sat: 9:00 AM - 7:00 PM",
    emergencyHelpline: "+91 98200 99999",
  });

  const [tax, setTax] = useState<TaxSettings>({
    defaultGSTRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
  });

  const [shipping, setShipping] = useState<ShippingSettings>({
    freeShippingThreshold: 2999,
    flatShippingFee: 150,
  });

  const [invoicing, setInvoicing] = useState<InvoicingSettings>({
    invoicePrefix: "INV-2025-",
    quotePrefix: "QT-2025-",
    bookingPrefix: "BK-2025-",
    jobCardPrefix: "JC-2025-",
  });

  const [amc, setAmc] = useState<AMCSettings>({
    minimumContractDurationMonths: 12,
    defaultVisitsPerYear: 4,
    formBAutoGenerate: true,
    reminderDays: [30, 15, 7, 1, 0],
    statutoryAct: "Maharashtra Fire Prevention & Life Safety Measures Act 2006",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    whatsappNotificationsEnabled: true,
  });

  const [email, setEmail] = useState<EmailSettings>({
    senderName: "AK Fire Safety",
    fromAddress: "no-reply@akfiresafety.com",
    supportEmail: "support@akfiresafety.com",
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSettingsService.getAllSettings();
      if (data) {
        if (data.company) setCompany((prev) => ({ ...prev, ...data.company }));
        if (data.tax) setTax((prev) => ({ ...prev, ...data.tax }));
        if (data.shipping) setShipping((prev) => ({ ...prev, ...data.shipping }));
        if (data.invoicing) setInvoicing((prev) => ({ ...prev, ...data.invoicing }));
        if (data.amc) setAmc((prev) => ({ ...prev, ...data.amc }));
        if (data.notifications) setNotifications((prev) => ({ ...prev, ...data.notifications }));
        if (data.email) setEmail((prev) => ({ ...prev, ...data.email }));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toast = useToast();

  async function handleSave(key: string, data: any) {
    setSaving(true);
    setSavedSuccessMessage(null);
    try {
      await adminSettingsService.updateSetting(key, data);
      toast.success(`Configuration for "${key.toUpperCase()}" updated successfully!`);
      setSavedSuccessMessage(`Configuration for "${key.toUpperCase()}" updated successfully!`);
      setTimeout(() => setSavedSuccessMessage(null), 4000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to update ${key} settings`);
    } finally {
      setSaving(false);
    }
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: any }> = [
    { id: "company", label: "Company & License", icon: Building },
    { id: "contact", label: "Contact & Helpline", icon: Phone },
    { id: "gst", label: "GST & Statutory Tax", icon: Percent },
    { id: "general", label: "Shipping & Cart", icon: Sliders },
    { id: "email", label: "Email & SMTP", icon: Mail },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "system", label: "Invoicing & Form B", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <Breadcrumbs items={[{ label: "Platform & Statutory Settings" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">System & Statutory Settings</h1>
          <p className="text-xs text-steel mt-0.5">
            Configure Directorate of Maharashtra Fire Services agency credentials, 18% GST parameters, automated reminders, and SMTP headers.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white border border-black/10 hover:bg-gray-50 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Reload Settings
        </button>
      </div>

      {savedSuccessMessage && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          {savedSuccessMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-black/10 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-steel hover:text-ink hover:bg-black/5 border border-black/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSkeleton type="details" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSettings} />
      ) : (
        <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm">
          {/* TAB 1: COMPANY & MFS LICENSING */}
          {activeTab === "company" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("company", company);
              }}
              className="space-y-4 text-xs"
            >
              <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                <Building className="w-4 h-4 text-brand" /> Registered Fire Safety Organization
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Company Legal Entity Name *</label>
                  <input
                    type="text"
                    required
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Organization Tagline</label>
                  <input
                    type="text"
                    value={company.tagline}
                    onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">MFS Agency License Number *</label>
                  <input
                    type="text"
                    required
                    value={company.licenseNo}
                    onChange={(e) => setCompany({ ...company, licenseNo: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand font-mono font-bold text-brand"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">MFS Agency Category</label>
                  <input
                    type="text"
                    value={company.category}
                    onChange={(e) => setCompany({ ...company, category: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">GSTIN *</label>
                  <input
                    type="text"
                    required
                    value={company.gstin}
                    onChange={(e) => setCompany({ ...company, gstin: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">PAN Number *</label>
                  <input
                    type="text"
                    required
                    value={company.pan}
                    onChange={(e) => setCompany({ ...company, pan: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-ink mb-1">Registered Workshop & Yard Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Company Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CONTACT & HELPLINE */}
          {activeTab === "contact" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("company", company);
              }}
              className="space-y-4 text-xs"
            >
              <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand" /> Dispatch Helpline & Working Hours
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Primary Hotline Phone</label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">24/7 Emergency Dispatch Helpline</label>
                  <input
                    type="text"
                    value={company.emergencyHelpline}
                    onChange={(e) => setCompany({ ...company, emergencyHelpline: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand font-mono font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">General Inquiries Email</label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Technical Support Email</label>
                  <input
                    type="email"
                    value={company.supportEmail}
                    onChange={(e) => setCompany({ ...company, supportEmail: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-ink mb-1">Operational Hours</label>
                  <input
                    type="text"
                    value={company.workingHours}
                    onChange={(e) => setCompany({ ...company, workingHours: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Contact Details
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: GST & TAXATION */}
          {activeTab === "gst" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("tax", tax);
              }}
              className="space-y-4 text-xs"
            >
              <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                <Percent className="w-4 h-4 text-brand" /> Statutory GST Rates & Split Configurations
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Standard Combined GST Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={tax.defaultGSTRate}
                    onChange={(e) => setTax({ ...tax, defaultGSTRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-steel mt-1 block">
                    Standard 18% applicable to Fire Fighting Hardware and AMC Services.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Integrated GST (IGST) Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={tax.igstRate}
                    onChange={(e) => setTax({ ...tax, igstRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-steel mt-1 block">
                    Applied on inter-state supply of extinguishers and machinery.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Central GST (CGST) Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    value={tax.cgstRate}
                    onChange={(e) => setTax({ ...tax, cgstRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">State GST (SGST) Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    value={tax.sgstRate}
                    onChange={(e) => setTax({ ...tax, sgstRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Tax Parameters
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: GENERAL & SHIPPING */}
          {activeTab === "general" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("shipping", shipping);
              }}
              className="space-y-4 text-xs"
            >
              <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand" /> Logistics & Free Shipping Thresholds
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Free Delivery Cargo Minimum (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={shipping.freeShippingThreshold}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        freeShippingThreshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-steel mt-1 block">
                    Orders with cart value above this amount qualify for zero freight delivery.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Base Logistics Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={shipping.flatShippingFee}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        flatShippingFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Shipping Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: EMAIL & SMTP */}
          {activeTab === "email" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("email", email);
              }}
              className="space-y-4 text-xs"
            >
              <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand" /> SMTP Email Sender Configuration
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Outbound Sender Name</label>
                  <input
                    type="text"
                    value={email.senderName}
                    onChange={(e) => setEmail({ ...email, senderName: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">From Email Address</label>
                  <input
                    type="email"
                    value={email.fromAddress}
                    onChange={(e) => setEmail({ ...email, fromAddress: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-ink mb-1">Customer Support Reply-To Email</label>
                  <input
                    type="email"
                    value={email.supportEmail}
                    onChange={(e) => setEmail({ ...email, supportEmail: e.target.value })}
                    className="w-full p-2.5 border border-black/10 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Email Configuration
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: NOTIFICATIONS & REMINDERS */}
          {activeTab === "notifications" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave("notifications", notifications);
              }}
              className="space-y-4 text-xs"
            >
              <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand" /> Multi-Channel Automated Alerts
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-paper rounded-xl border border-black/5">
                  <div>
                    <span className="font-bold text-ink block">Email Notifications (SMTP)</span>
                    <span className="text-steel text-[11px]">
                      Dispatches order confirmations, proformas, and refill alerts via Email.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotificationsEnabled}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailNotificationsEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-paper rounded-xl border border-black/5">
                  <div>
                    <span className="font-bold text-ink block">SMS Alerts (Fast2SMS Gateway)</span>
                    <span className="text-steel text-[11px]">
                      Sends technician OTPs, ETA notifications, and critical pressure refill alerts.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsNotificationsEnabled}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        smsNotificationsEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-paper rounded-xl border border-black/5">
                  <div>
                    <span className="font-bold text-ink block">WhatsApp Business API Webhooks</span>
                    <span className="text-steel text-[11px]">
                      Sends Form-B PDF attachments and quarterly AMC maintenance reminders.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.whatsappNotificationsEnabled}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        whatsappNotificationsEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Notification Toggles
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: INVOICING & AMC COMPLIANCE */}
          {activeTab === "system" && (
            <div className="space-y-6 text-xs">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("invoicing", invoicing);
                }}
                className="space-y-4"
              >
                <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand" /> Document Numbering Series & Prefixes
                </h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-ink mb-1">Invoice Prefix</label>
                    <input
                      type="text"
                      value={invoicing.invoicePrefix}
                      onChange={(e) => setInvoicing({ ...invoicing, invoicePrefix: e.target.value })}
                      className="w-full p-2 border border-black/10 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink mb-1">Quote Prefix</label>
                    <input
                      type="text"
                      value={invoicing.quotePrefix}
                      onChange={(e) => setInvoicing({ ...invoicing, quotePrefix: e.target.value })}
                      className="w-full p-2 border border-black/10 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink mb-1">Booking Prefix</label>
                    <input
                      type="text"
                      value={invoicing.bookingPrefix}
                      onChange={(e) => setInvoicing({ ...invoicing, bookingPrefix: e.target.value })}
                      className="w-full p-2 border border-black/10 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink mb-1">Job Card Prefix</label>
                    <input
                      type="text"
                      value={invoicing.jobCardPrefix}
                      onChange={(e) => setInvoicing({ ...invoicing, jobCardPrefix: e.target.value })}
                      className="w-full p-2 border border-black/10 rounded font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-brand text-white rounded font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Prefixes
                  </button>
                </div>
              </form>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("amc", amc);
                }}
                className="space-y-4 pt-4 border-t"
              >
                <h2 className="font-display font-bold text-base text-ink pb-2 border-b flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" /> Maharashtra Fire Act Form-B Compliance
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-ink mb-1">Statutory Regulation Act</label>
                    <input
                      type="text"
                      value={amc.statutoryAct}
                      onChange={(e) => setAmc({ ...amc, statutoryAct: e.target.value })}
                      className="w-full p-2 border border-black/10 rounded font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-ink mb-1">Mandatory Visits Per Year</label>
                    <input
                      type="number"
                      min="1"
                      value={amc.defaultVisitsPerYear}
                      onChange={(e) =>
                        setAmc({ ...amc, defaultVisitsPerYear: parseInt(e.target.value, 10) || 4 })
                      }
                      className="w-full p-2 border border-black/10 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="autoFormB"
                    checked={amc.formBAutoGenerate}
                    onChange={(e) => setAmc({ ...amc, formBAutoGenerate: e.target.checked })}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <label htmlFor="autoFormB" className="font-semibold text-ink cursor-pointer">
                    Automatically generate downloadable Form-B Certificate when all visits pass inspection
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-brand text-white rounded font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Compliance Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
