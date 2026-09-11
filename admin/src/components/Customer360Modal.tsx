import { useState, useEffect } from "react";
import {
  X,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShoppingBag,
  FileText,
  Wrench,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Tag,
  Save,
  Loader2,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { adminCrmService, Customer360Data } from "@/services/adminCrmService";

interface Customer360ModalProps {
  customerId: string | null;
  onClose: () => void;
}

export default function Customer360Modal({ customerId, onClose }: Customer360ModalProps) {
  const [data, setData] = useState<Customer360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "quotes" | "equipment" | "amc" | "services" | "timeline"
  >("overview");

  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    adminCrmService
      .getCustomer360(customerId)
      .then((res) => {
        setData(res);
        setNotes(res.profile.notes || "");
        setTags(res.profile.tags || []);
      })
      .catch((err) => {
        console.error("Failed to load customer 360", err);
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  if (!customerId) return null;

  async function handleSaveNotes() {
    if (!customerId) return;
    setIsSavingNotes(true);
    setSaveSuccess(false);
    try {
      await adminCrmService.updateCustomerNotesAndTags(customerId, { notes, tags });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setIsSavingNotes(false);
    }
  }

  function handleAddTag() {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput("");
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Gold":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Silver":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-orange-100 text-orange-800 border-orange-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-paper/70 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-base shadow-sm">
              {data?.profile.name ? data.profile.name[0].toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-ink">
                  {data?.profile.name || "Customer 360"}
                </h2>
                {data?.stats.tier && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getTierColor(
                      data.stats.tier
                    )}`}
                  >
                    ★ {data.stats.tier} Tier
                  </span>
                )}
              </div>
              <p className="text-xs text-steel">
                {data?.profile.companyName ? `${data.profile.companyName} · ` : ""}
                {data?.profile.email} · {data?.profile.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 text-steel hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-steel gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <p className="text-sm font-medium">Loading comprehensive Customer 360 profile...</p>
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-steel">Failed to load customer profile.</div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-4 bg-paper/40 border-b border-black/10 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-black/5">
                <span className="text-[10px] uppercase font-bold text-steel block">Lifetime Spend</span>
                <span className="text-sm font-bold font-mono text-brand">
                  ₹{data.stats.lifetimeSpend.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-black/5">
                <span className="text-[10px] uppercase font-bold text-steel block">Paid Orders</span>
                <span className="text-sm font-bold font-mono text-ink">
                  {data.stats.paidOrders} / {data.stats.totalOrders}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-black/5">
                <span className="text-[10px] uppercase font-bold text-steel block">Quotations</span>
                <span className="text-sm font-bold font-mono text-ink">{data.stats.totalQuotes}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-black/5">
                <span className="text-[10px] uppercase font-bold text-steel block">Fire Equipment</span>
                <span className="text-sm font-bold font-mono text-ink">{data.stats.equipmentCount} units</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-black/5">
                <span className="text-[10px] uppercase font-bold text-steel block">Active AMC</span>
                <span className="text-sm font-bold font-mono text-green-700">
                  {data.stats.activeAMCContracts} active
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-black/5">
                <span className="text-[10px] uppercase font-bold text-steel block">Field Visits</span>
                <span className="text-sm font-bold font-mono text-ink">
                  {data.stats.totalServiceBookings} visits
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-black/5">
                <span className="text-[10px] uppercase font-bold text-steel block">GST Number</span>
                <span className="text-xs font-mono font-bold text-steel">
                  {data.profile.gstNumber || "Unregistered"}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-black/10 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              {[
                { id: "overview", label: "Overview & Notes" },
                { id: "orders", label: `Orders (${data.orders.length})` },
                { id: "quotes", label: `Quotes (${data.quotes.length})` },
                { id: "equipment", label: `Equipment (${data.equipment.length})` },
                { id: "amc", label: `AMC Contracts (${data.amcContracts.length})` },
                { id: "services", label: `Service Bookings (${data.serviceBookings.length})` },
                { id: "timeline", label: "Activity Timeline" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-brand text-brand font-bold"
                      : "border-transparent text-steel hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-6 flex-1">
              {/* 1. OVERVIEW & NOTES */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Details */}
                  <div className="bg-paper/40 p-4 rounded-xl border border-black/5 space-y-3">
                    <h3 className="text-xs font-bold uppercase text-steel tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Client Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-steel block text-[11px]">Client Name</span>
                        <span className="font-semibold text-ink">{data.profile.name}</span>
                      </div>
                      <div>
                        <span className="text-steel block text-[11px]">Client Type</span>
                        <span className="font-semibold text-ink">{data.profile.customerType || "Standard B2B"}</span>
                      </div>
                      <div>
                        <span className="text-steel block text-[11px]">Company / Organization</span>
                        <span className="font-semibold text-ink">{data.profile.companyName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-steel block text-[11px]">GSTIN</span>
                        <span className="font-mono font-bold text-brand">{data.profile.gstNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-steel block text-[11px]">Email</span>
                        <span className="text-ink">{data.profile.email}</span>
                      </div>
                      <div>
                        <span className="text-steel block text-[11px]">Phone</span>
                        <span className="text-ink">{data.profile.phone}</span>
                      </div>
                      <div>
                        <span className="text-steel block text-[11px]">Member Since</span>
                        <span className="text-ink">
                          {new Date(data.profile.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Saved Addresses */}
                    <div className="mt-4 pt-4 border-t border-black/10">
                      <h4 className="text-[11px] font-bold uppercase text-steel flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5" /> Registered Locations & Addresses
                      </h4>
                      {data.addresses.length === 0 ? (
                        <p className="text-xs text-steel italic">No saved addresses recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.addresses.map((addr: any, idx: number) => (
                            <div key={idx} className="bg-white p-2 rounded border border-black/10 text-xs">
                              <span className="font-semibold text-ink block">{addr.name || addr.line1}</span>
                              <span className="text-steel">
                                {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Staff Notes & Tags */}
                  <div className="bg-paper/40 p-4 rounded-xl border border-black/5 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase text-steel tracking-wider flex items-center gap-1.5 mb-3">
                        <Tag className="w-3.5 h-3.5" /> Account Tags
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-brand/10 text-brand rounded-full text-xs font-semibold flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-700 text-brand text-xs font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add new tag (e.g. High Priority, MIDC)..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 text-ink text-xs font-semibold rounded"
                        >
                          Add
                        </button>
                      </div>

                      <h3 className="text-xs font-bold uppercase text-steel tracking-wider flex items-center gap-1.5 mt-5 mb-2">
                        Staff Internal Notes
                      </h3>
                      <textarea
                        rows={4}
                        placeholder="Add internal remarks about this client (e.g. payment terms, site security gate rules)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2.5 text-xs bg-white border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {saveSuccess ? (
                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Notes & tags saved!
                        </span>
                      ) : (
                        <div />
                      )}
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        {isSavingNotes ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-3">
                  {data.orders.length === 0 ? (
                    <p className="text-xs text-steel italic p-4 text-center">No orders placed yet.</p>
                  ) : (
                    <div className="overflow-x-auto border border-black/10 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold">
                          <tr>
                            <th className="p-3">Order Number</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Grand Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {data.orders.map((order: any) => (
                            <tr key={order._id} className="hover:bg-paper/30">
                              <td className="p-3 font-mono font-bold text-ink">{order.orderNumber}</td>
                              <td className="p-3 text-steel">
                                {new Date(order.createdAt).toLocaleDateString("en-IN")}
                              </td>
                              <td className="p-3">{order.items?.length || 0} items</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    order.paymentStatus === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {order.paymentStatus?.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-paper text-ink font-semibold text-[10px]">
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-ink">
                                ₹{(order.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 3. QUOTES */}
              {activeTab === "quotes" && (
                <div className="space-y-3">
                  {data.quotes.length === 0 ? (
                    <p className="text-xs text-steel italic p-4 text-center">No quotation requests found.</p>
                  ) : (
                    <div className="overflow-x-auto border border-black/10 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold">
                          <tr>
                            <th className="p-3">Quote #</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Estimated Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {data.quotes.map((q: any) => (
                            <tr key={q._id} className="hover:bg-paper/30">
                              <td className="p-3 font-mono font-bold text-ink">{q.quoteNumber}</td>
                              <td className="p-3 text-steel">
                                {new Date(q.createdAt).toLocaleDateString("en-IN")}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                  {q.status}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-ink">
                                ₹{(q.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. EQUIPMENT */}
              {activeTab === "equipment" && (
                <div className="space-y-3">
                  {data.equipment.length === 0 ? (
                    <p className="text-xs text-steel italic p-4 text-center">No equipment registered.</p>
                  ) : (
                    <div className="overflow-x-auto border border-black/10 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold">
                          <tr>
                            <th className="p-3">Equipment / Type</th>
                            <th className="p-3">Serial / QR</th>
                            <th className="p-3">Location on Site</th>
                            <th className="p-3">Next Inspection</th>
                            <th className="p-3">Next Refill</th>
                            <th className="p-3">Lifecycle Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {data.equipment.map((eq: any) => (
                            <tr key={eq._id} className="hover:bg-paper/30">
                              <td className="p-3 font-semibold text-ink">
                                {eq.equipmentType} ({eq.capacity})
                              </td>
                              <td className="p-3 font-mono text-steel">{eq.qrCode || eq.serialNumber || "—"}</td>
                              <td className="p-3 text-steel">{eq.locationOnPremises}</td>
                              <td className="p-3 text-steel">
                                {eq.nextInspectionDate
                                  ? new Date(eq.nextInspectionDate).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td className="p-3 text-steel">
                                {eq.nextRefillDate
                                  ? new Date(eq.nextRefillDate).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    eq.status === "Healthy"
                                      ? "bg-green-100 text-green-800"
                                      : eq.status === "Overdue"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {eq.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 5. AMC */}
              {activeTab === "amc" && (
                <div className="space-y-3">
                  {data.amcContracts.length === 0 ? (
                    <p className="text-xs text-steel italic p-4 text-center">No AMC contracts on record.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.amcContracts.map((amc: any) => (
                        <div
                          key={amc._id}
                          className="bg-paper/40 p-4 rounded-xl border border-black/10 flex flex-wrap items-center justify-between gap-4 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-ink">
                                {amc.contractNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold text-[10px]">
                                {amc.status}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                Form B: {amc.formBStatus}
                              </span>
                            </div>
                            <p className="text-steel mt-1 font-medium">{amc.planName}</p>
                            <span className="text-[11px] text-steel">
                              Period: {new Date(amc.startDate).toLocaleDateString("en-IN")} —{" "}
                              {new Date(amc.endDate).toLocaleDateString("en-IN")} ({amc.frequency})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-brand block">
                              ₹{(amc.annualValue || 0).toLocaleString("en-IN")} / yr
                            </span>
                            <span className="text-[11px] text-steel block">
                              Visits: {amc.visitsCompleted} / {amc.visitsPerYear} completed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. SERVICES */}
              {activeTab === "services" && (
                <div className="space-y-3">
                  {data.serviceBookings.length === 0 ? (
                    <p className="text-xs text-steel italic p-4 text-center">No service history.</p>
                  ) : (
                    <div className="overflow-x-auto border border-black/10 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold">
                          <tr>
                            <th className="p-3">Booking ID</th>
                            <th className="p-3">Service Type</th>
                            <th className="p-3">Scheduled Date</th>
                            <th className="p-3">Technician</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {data.serviceBookings.map((b: any) => (
                            <tr key={b._id} className="hover:bg-paper/30">
                              <td className="p-3 font-mono font-bold text-ink">{b.bookingId}</td>
                              <td className="p-3 font-medium text-ink">{b.serviceType}</td>
                              <td className="p-3 text-steel">
                                {b.preferredDate
                                  ? new Date(b.preferredDate).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td className="p-3 text-steel">
                                {b.assignedTechnicianName || "Unassigned"}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-paper text-ink font-semibold text-[10px]">
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 7. TIMELINE */}
              {activeTab === "timeline" && (
                <div className="space-y-4 pl-4 border-l-2 border-brand/20">
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-brand absolute -left-[23px] top-1" />
                    <span className="text-xs font-bold text-ink block">Account Registered</span>
                    <span className="text-[11px] text-steel">
                      {new Date(data.profile.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {data.orders.slice(0, 5).map((ord: any) => (
                    <div key={ord._id} className="relative">
                      <span className="w-3 h-3 rounded-full bg-blue-500 absolute -left-[23px] top-1" />
                      <span className="text-xs font-bold text-ink block">
                        Placed Order {ord.orderNumber} (₹{(ord.pricing?.grandTotal || 0).toLocaleString("en-IN")})
                      </span>
                      <span className="text-[11px] text-steel">
                        {new Date(ord.createdAt).toLocaleString("en-IN")} · Status: {ord.status}
                      </span>
                    </div>
                  ))}
                  {data.serviceBookings.slice(0, 5).map((srv: any) => (
                    <div key={srv._id} className="relative">
                      <span className="w-3 h-3 rounded-full bg-amber-500 absolute -left-[23px] top-1" />
                      <span className="text-xs font-bold text-ink block">
                        Service Booking: {srv.serviceType} ({srv.bookingId})
                      </span>
                      <span className="text-[11px] text-steel">
                        {new Date(srv.createdAt).toLocaleString("en-IN")} · Status: {srv.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
