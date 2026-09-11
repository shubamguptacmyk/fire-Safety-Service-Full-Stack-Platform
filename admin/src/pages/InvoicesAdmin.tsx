import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Eye,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  Calendar,
  Building,
} from "lucide-react";
import { adminInvoiceService, AdminInvoiceItem } from "@/services/adminInvoiceService";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { useToast } from "@/store/toastStore";

export default function InvoicesAdmin() {
  const { can } = useAdminAuthStore();
  const canCreate = can("invoices.create") || can("*");

  const [invoices, setInvoices] = useState<AdminInvoiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Selected Invoice for Details Modal
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoiceItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Create Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState<{
    customerName: string;
    companyName: string;
    gstin: string;
    phone: string;
    email: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    itemName: string;
    hsnSac: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    paymentStatus: "unpaid" | "paid";
  }>({
    customerName: "",
    companyName: "",
    gstin: "",
    phone: "",
    email: "",
    line1: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    itemName: "ABC Powder Fire Extinguisher 6kg (ISI Marked)",
    hsnSac: "84241000",
    quantity: 2,
    unitPrice: 2450,
    taxRate: 18,
    paymentStatus: "unpaid",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminInvoiceService.getInvoices({
        page,
        limit,
        search: search.trim() || undefined,
        paymentStatus: paymentStatusFilter === "all" ? undefined : paymentStatusFilter,
      });
      setInvoices(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load GST invoices");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, paymentStatusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const toast = useToast();

  async function handleDownloadPdf(invoice: AdminInvoiceItem) {
    setDownloadingId(invoice._id);
    try {
      await adminInvoiceService.downloadInvoicePdf(invoice._id, invoice.invoiceNumber);
      toast.success(`Tax Invoice PDF for ${invoice.invoiceNumber} downloaded`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate invoice PDF");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const taxable = newInvoice.quantity * newInvoice.unitPrice;
      const cgst = Math.round((taxable * (newInvoice.taxRate / 2)) / 100);
      const sgst = Math.round((taxable * (newInvoice.taxRate / 2)) / 100);
      const grandTotal = taxable + cgst + sgst;

      await adminInvoiceService.createInvoice({
        customer: {
          name: newInvoice.customerName,
          companyName: newInvoice.companyName || undefined,
          gstin: newInvoice.gstin || undefined,
          phone: newInvoice.phone,
          email: newInvoice.email || undefined,
          address: {
            line1: newInvoice.line1,
            city: newInvoice.city,
            state: newInvoice.state,
            pincode: newInvoice.pincode,
          },
        },
        items: [
          {
            name: newInvoice.itemName,
            hsnSac: newInvoice.hsnSac,
            quantity: newInvoice.quantity,
            unitPrice: newInvoice.unitPrice,
            taxableAmount: taxable,
            taxRate: newInvoice.taxRate,
            cgstAmount: cgst,
            sgstAmount: sgst,
            igstAmount: 0,
            totalAmount: grandTotal,
          },
        ],
        totals: {
          taxableAmount: taxable,
          cgstTotal: cgst,
          sgstTotal: sgst,
          igstTotal: 0,
          grandTotal,
          roundOff: 0,
        },
        paymentStatus: newInvoice.paymentStatus,
      });

      toast.success("GST Tax Invoice generated successfully!");
      setShowCreateModal(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Summary Metrics
  const grossInvoiced = invoices.reduce((acc, inv) => acc + (inv.totals?.grandTotal || 0), 0);
  const totalGstCollected = invoices.reduce(
    (acc, inv) =>
      acc + (inv.totals?.cgstTotal || 0) + (inv.totals?.sgstTotal || 0) + (inv.totals?.igstTotal || 0),
    0
  );
  const paidCount = invoices.filter((inv) => inv.paymentStatus === "paid").length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Invoice Management" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Tax Invoices & Proformas</h1>
          <p className="text-xs text-steel mt-0.5">
            Statutory 18% GST invoices, GSTR-1 compliance, HSN code billing, and downloadable PDF receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Create GST Invoice
            </button>
          )}

          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="px-3.5 py-1.5 bg-white border border-black/10 hover:bg-gray-50 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Invoiced (Page)"
          value={`₹${grossInvoiced.toLocaleString("en-IN")}`}
          subtext="Total value of hardware & service proformas"
          icon={IndianRupee}
          iconColorClass="text-brand bg-brand/10"
        />
        <StatCard
          title="18% GST Accounted"
          value={`₹${totalGstCollected.toLocaleString("en-IN")}`}
          subtext="CGST (9%) + SGST (9%) statutory tax"
          icon={Building}
          iconColorClass="text-purple-700 bg-purple-50"
        />
        <StatCard
          title="Total Invoices"
          value={total}
          subtext="Total registered invoice documents"
          icon={FileText}
        />
        <StatCard
          title="Paid Invoices"
          value={paidCount}
          subtext="Settled with valid payment reconciliation"
          icon={CheckCircle2}
          iconColorClass="text-green-700 bg-green-50"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-steel absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Invoice #, Customer name, or Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand font-medium text-ink bg-paper/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-paper/60 px-3 py-1.5 rounded-lg border border-black/5">
            <Filter className="w-3.5 h-3.5 text-steel" />
            <span className="font-semibold text-steel">Payment Status:</span>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none font-bold text-ink focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchInvoices} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No GST invoices generated yet"
          description="Invoices are automatically created upon order placement or manually generated for B2B contracts."
          action={
            canCreate ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-brand text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Invoice
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-paper/80 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer / Company</th>
                  <th className="p-3.5">Taxable (INR)</th>
                  <th className="p-3.5">18% GST (INR)</th>
                  <th className="p-3.5">Grand Total (INR)</th>
                  <th className="p-3.5">Invoice Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {invoices.map((inv) => {
                  const gstSum =
                    (inv.totals?.cgstTotal || 0) +
                    (inv.totals?.sgstTotal || 0) +
                    (inv.totals?.igstTotal || 0);

                  return (
                    <tr key={inv._id} className="hover:bg-paper/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3.5 max-w-[220px]">
                        <div className="font-semibold text-ink truncate">{inv.customer?.name}</div>
                        {inv.customer?.companyName && (
                          <span className="text-[11px] text-steel block truncate">
                            {inv.customer.companyName}
                          </span>
                        )}
                        {inv.customer?.gstin && (
                          <span className="text-[10px] text-brand font-mono block">
                            GSTIN: {inv.customer.gstin}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-ink whitespace-nowrap">
                        ₹{(inv.totals?.taxableAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 font-mono text-purple-700 whitespace-nowrap">
                        ₹{gstSum.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-ink whitespace-nowrap">
                        ₹{(inv.totals?.grandTotal || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 text-steel whitespace-nowrap">
                        {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={inv.paymentStatus} />
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-black/10 rounded font-semibold text-ink inline-flex items-center gap-1 transition-colors"
                          title="View Invoice Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          disabled={downloadingId === inv._id}
                          className="px-2.5 py-1 bg-brand/10 hover:bg-brand hover:text-white border border-brand/20 text-brand rounded font-semibold inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Download Tax Invoice PDF"
                        >
                          <Download
                            className={`w-3.5 h-3.5 ${
                              downloadingId === inv._id ? "animate-bounce" : ""
                            }`}
                          />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-black/10 bg-paper/30 flex items-center justify-between text-xs text-steel">
            <span>
              Showing {invoices.length} of {total} registered invoices
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-white border border-black/10 rounded font-semibold text-ink disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-bold text-ink">Page {page}</span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={invoices.length < limit || page * limit >= total}
                className="px-3 py-1 bg-white border border-black/10 rounded font-semibold text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-black/10 overflow-hidden">
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand" />
                <h2 className="font-display font-bold text-base text-ink">
                  Tax Invoice: {selectedInvoice.invoiceNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Customer & Dates Box */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-paper/40 rounded-xl border border-black/10">
                <div className="space-y-1">
                  <span className="text-[10px] text-steel uppercase font-bold block">Billed To (Client)</span>
                  <div className="font-bold text-ink">{selectedInvoice.customer?.name}</div>
                  {selectedInvoice.customer?.companyName && (
                    <div className="font-medium text-steel">{selectedInvoice.customer.companyName}</div>
                  )}
                  {selectedInvoice.customer?.gstin && (
                    <div className="font-mono text-[11px] text-brand font-bold">
                      GSTIN: {selectedInvoice.customer.gstin}
                    </div>
                  )}
                  <div className="text-steel">{selectedInvoice.customer?.phone}</div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] text-steel uppercase font-bold block">Invoice Information</span>
                  <div className="font-mono text-ink">
                    Date: {new Date(selectedInvoice.invoiceDate || selectedInvoice.createdAt).toLocaleDateString("en-IN")}
                  </div>
                  <div className="flex sm:justify-end items-center gap-1.5 pt-1">
                    <span className="text-steel">Payment:</span>
                    <StatusBadge status={selectedInvoice.paymentStatus} />
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-xs uppercase text-steel tracking-wider">
                  Itemized Supplies & Taxes
                </h3>
                <div className="border border-black/10 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-paper text-steel border-b border-black/10 text-[10px] uppercase font-bold">
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">HSN/SAC</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Rate (₹)</th>
                        <th className="p-2.5 text-right">Taxable (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {selectedInvoice.items?.map((item, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium text-ink">{item.name}</td>
                          <td className="p-2.5 font-mono text-steel">{item.hsnSac}</td>
                          <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                          <td className="p-2.5 text-right font-mono">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            ₹{item.taxableAmount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 p-3.5 bg-paper rounded-lg border border-black/5 font-mono">
                  <div className="flex justify-between text-steel">
                    <span>Taxable Value:</span>
                    <span>₹{(selectedInvoice.totals?.taxableAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-steel">
                    <span>CGST (9%):</span>
                    <span>₹{(selectedInvoice.totals?.cgstTotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-steel">
                    <span>SGST (9%):</span>
                    <span>₹{(selectedInvoice.totals?.sgstTotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-ink border-t border-black/10 pt-1.5">
                    <span>Grand Total:</span>
                    <span className="text-brand">
                      ₹{(selectedInvoice.totals?.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-black/10 bg-paper/40 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-white border border-black/10 rounded-lg text-ink font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPdf(selectedInvoice)}
                disabled={downloadingId === selectedInvoice._id}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download Official GST PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create GST Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-black/10 overflow-hidden">
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand" />
                <h2 className="font-display font-bold text-base text-ink">Generate New GST Tax Invoice</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 font-bold text-ink border-b pb-1">Client Identification</div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.customerName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand font-medium"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Company Legal Entity</label>
                  <input
                    type="text"
                    value={newInvoice.companyName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, companyName: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand font-medium"
                    placeholder="e.g. Zenith Techparks Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    value={newInvoice.gstin}
                    onChange={(e) => setNewInvoice({ ...newInvoice, gstin: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand font-mono uppercase"
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newInvoice.phone}
                    onChange={(e) => setNewInvoice({ ...newInvoice, phone: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand font-mono"
                    placeholder="+91 98000 00000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-ink mb-1">Billing Street Address *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.line1}
                    onChange={(e) => setNewInvoice({ ...newInvoice, line1: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand"
                    placeholder="Plot 10, MIDC Industrial Area"
                  />
                </div>

                <div className="sm:col-span-2 font-bold text-ink border-b pb-1 pt-2">Line Item & HSN Details</div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-ink mb-1">Product or Service Description *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.itemName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, itemName: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">HSN / SAC Code *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.hsnSac}
                    onChange={(e) => setNewInvoice({ ...newInvoice, hsnSac: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newInvoice.quantity}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, quantity: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Unit Rate (Excl. GST) ₹ *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newInvoice.unitPrice}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, unitPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Initial Payment Status</label>
                  <select
                    value={newInvoice.paymentStatus}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        paymentStatus: e.target.value as "unpaid" | "paid",
                      })
                    }
                    className="w-full p-2 border border-black/10 rounded font-semibold"
                  >
                    <option value="unpaid">Unpaid / Proforma</option>
                    <option value="paid">Paid & Settled</option>
                  </select>
                </div>
              </div>

              {/* Total Calculation Snapshot */}
              <div className="p-3 bg-paper rounded-lg border border-black/10 flex justify-between items-center font-mono font-bold">
                <span className="text-steel">Computed Total (incl. 18% GST):</span>
                <span className="text-brand text-sm">
                  ₹
                  {(
                    newInvoice.quantity *
                    newInvoice.unitPrice *
                    (1 + newInvoice.taxRate / 100)
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white border border-black/10 rounded-lg text-ink font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
