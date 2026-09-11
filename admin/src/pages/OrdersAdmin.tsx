import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  FileSpreadsheet,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Edit,
  Building,
  User,
  Phone,
  IndianRupee,
  Download,
  Loader2,
  ArrowRight,
  RefreshCw,
  X,
  Package,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { adminOrderService, AdminOrder } from "@/services/adminOrderService";
import { adminQuoteService, AdminQuote } from "@/services/adminQuoteService";
import { useToast } from "@/store/toastStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import StatusBadge from "@/components/StatusBadge";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ConfirmDialog from "@/components/ConfirmDialog";

const ORDER_STATUSES = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

const QUOTE_STATUSES = [
  "All",
  "submitted",
  "under_review",
  "proposal_sent",
  "approved",
  "converted",
  "rejected",
];

export default function OrdersAdmin() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"orders" | "quotes">("orders");

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit] = useState(15);
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  // Quotes State
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [quotesTotal, setQuotesTotal] = useState(0);
  const [quotesPage, setQuotesPage] = useState(1);
  const [quotesLimit] = useState(15);
  const [quoteStatusFilter, setQuoteStatusFilter] = useState("All");

  // Search & Loading
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Selected Quote for Details Modal
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null);

  // Dispatch Fulfillment Modal
  const [dispatchModalOrder, setDispatchModalOrder] = useState<AdminOrder | null>(null);
  const [carrier, setCarrier] = useState("V-Trans Safe Express");
  const [lrNumber, setLrNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [dispatching, setDispatching] = useState(false);

  // Status Change State
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Confirm Convert Quote Dialog
  const [convertDialogQuote, setConvertDialogQuote] = useState<AdminQuote | null>(null);
  const [converting, setConverting] = useState(false);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminOrderService.listOrders({
        page: ordersPage,
        limit: ordersLimit,
        status: orderStatusFilter === "All" ? undefined : orderStatusFilter,
        search: searchTerm.trim() || undefined,
      });
      setOrders(res.orders || []);
      setOrdersTotal(res.meta?.total ?? res.orders?.length ?? 0);
    } catch (err: any) {
      console.error("Failed to load orders", err);
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [ordersPage, ordersLimit, orderStatusFilter, searchTerm]);

  // Fetch Quotes
  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminQuoteService.listQuotes({
        page: quotesPage,
        limit: quotesLimit,
        status: quoteStatusFilter === "All" ? undefined : quoteStatusFilter,
        search: searchTerm.trim() || undefined,
      });
      setQuotes(res.quotes || []);
      setQuotesTotal(res.meta?.total ?? res.quotes?.length ?? 0);
    } catch (err: any) {
      console.error("Failed to load quotes", err);
      setError(err?.response?.data?.message || "Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }, [quotesPage, quotesLimit, quoteStatusFilter, searchTerm]);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else {
      fetchQuotes();
    }
  }, [activeTab, fetchOrders, fetchQuotes]);

  // Quick Order Status Update
  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    setStatusUpdateLoading(true);
    try {
      const updated = await adminOrderService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status marked as ${newStatus}`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setStatusUpdateLoading(false);
    }
  }

  // Submit Dispatch Info
  async function handleSubmitDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!dispatchModalOrder) return;
    setDispatching(true);
    try {
      await adminOrderService.updateOrderStatus(dispatchModalOrder._id, {
        status: "Dispatched",
        deliveryDetails: {
          carrier,
          lrNumber,
          estimatedDelivery: estimatedDelivery || undefined,
        },
      });
      toast.success(`Consignment marked as Dispatched with LR #${lrNumber || "N/A"}`);
      setDispatchModalOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to dispatch order");
    } finally {
      setDispatching(false);
    }
  }

  // Update Quote Status
  async function handleUpdateQuoteStatus(quoteId: string, newStatus: string) {
    try {
      await adminQuoteService.updateQuote(quoteId, { status: newStatus });
      toast.success(`Quotation marked as ${newStatus.replace(/_/g, " ")}`);
      setQuotes((prev) => prev.map((q) => (q._id === quoteId ? { ...q, status: newStatus as any } : q)));
      if (selectedQuote && selectedQuote._id === quoteId) {
        setSelectedQuote((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update quote");
    }
  }

  // Convert Quote to Order
  async function handleConfirmConvert() {
    if (!convertDialogQuote) return;
    setConverting(true);
    try {
      const res = await adminQuoteService.convertQuoteToOrder(convertDialogQuote._id);
      toast.success("Quotation successfully converted to Commercial Order!");
      setConvertDialogQuote(null);
      fetchQuotes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to convert quote to order");
    } finally {
      setConverting(false);
    }
  }

  // Download Invoice PDF
  async function handleDownloadInvoice(order: AdminOrder) {
    try {
      await adminOrderService.downloadInvoice(order._id, `INV-${order.orderNumber}.pdf`);
      toast.success("GST Tax Invoice PDF download initiated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to download tax invoice PDF");
    }
  }

  // Download Quote PDF
  async function handleDownloadQuote(quote: AdminQuote) {
    try {
      await adminQuoteService.downloadQuotePdf(quote._id, `${quote.quoteNumber}.pdf`);
      toast.success("Quotation proposal PDF download initiated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to download quotation PDF");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Commercial Orders & B2B Proposals" }]} />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Commercial Orders & Quotations</h1>
          <p className="text-xs text-steel mt-0.5">
            Process commercial fire safety consignments, assign transporters & LR dockets, and respond to industrial RFQs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white border border-black/10 rounded-xl p-1 shadow-xs">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "orders" ? "bg-brand text-white shadow-2xs" : "text-steel hover:text-ink"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Consignment Orders ({ordersTotal})
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "quotes" ? "bg-brand text-white shadow-2xs" : "text-steel hover:text-ink"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> B2B Commercial Quotes ({quotesTotal})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "orders"
                ? "Search by Order #, Client, Company, Phone, or GSTIN..."
                : "Search by RFQ #, Client Company, Contact person, Email..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-paper/50 border border-black/10 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand text-ink"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-steel" />
          {activeTab === "orders" ? (
            <select
              value={orderStatusFilter}
              onChange={(e) => {
                setOrderStatusFilter(e.target.value);
                setOrdersPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-brand shadow-2xs"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "All Order Statuses" : st}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={quoteStatusFilter}
              onChange={(e) => {
                setQuoteStatusFilter(e.target.value);
                setQuotesPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-brand shadow-2xs capitalize"
            >
              {QUOTE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "All Quote Statuses" : st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => (activeTab === "orders" ? fetchOrders() : fetchQuotes())}
            disabled={loading}
            className="p-2 bg-paper hover:bg-black/5 border border-black/10 rounded-xl text-ink transition-colors shadow-2xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton rows={8} />
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => (activeTab === "orders" ? fetchOrders() : fetchQuotes())}
        />
      ) : activeTab === "orders" ? (
        /* =================== TAB 1: ORDERS TABLE =================== */
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-xs">
          {orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-6 h-6 text-brand" />}
              title="No Consignments Found"
              description={
                searchTerm || orderStatusFilter !== "All"
                  ? "No orders match the current search filter criteria."
                  : "No equipment orders have been placed in the database yet."
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px] font-mono">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Customer / Entity</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total (18% GST)</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Fulfillment Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-paper/40 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-ink block">{ord.orderNumber}</span>
                          {ord.deliveryDetails?.lrNumber && (
                            <span className="text-[10px] font-mono text-steel block">
                              LR: {ord.deliveryDetails.lrNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-steel">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-ink block">
                            {ord.customer?.name || "Customer"}
                          </span>
                          <span className="text-[11px] text-steel block">
                            {ord.customer?.companyName || "Direct Individual Customer"}
                          </span>
                          {ord.customer?.gstNumber && (
                            <span className="font-mono text-[10px] text-brand block font-semibold">
                              GST: {ord.customer.gstNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-ink font-bold">
                            {ord.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || ord.items?.length || 0} units
                          </span>
                          <span className="text-[10px] text-steel block truncate max-w-[140px]">
                            {ord.items?.[0]?.name}
                            {(ord.items?.length || 0) > 1 ? ` +${ord.items.length - 1} more` : ""}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold font-mono text-ink block">
                            ₹{(ord.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-steel block">
                            GST: ₹{(ord.pricing?.gst || 0).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={ord.paymentStatus} size="sm" />
                        </td>
                        <td className="p-4">
                          <StatusBadge status={ord.status} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 bg-paper hover:bg-black/10 rounded-lg text-ink transition-colors"
                              title="View Order Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {ord.status !== "Dispatched" && ord.status !== "Delivered" && ord.status !== "Cancelled" && (
                              <button
                                onClick={() => {
                                  setDispatchModalOrder(ord);
                                  setCarrier(ord.deliveryDetails?.carrier || "V-Trans Safe Express");
                                  setLrNumber(ord.deliveryDetails?.lrNumber || "");
                                  setEstimatedDelivery("");
                                }}
                                className="p-1.5 bg-brand/10 hover:bg-brand hover:text-white text-brand rounded-lg transition-colors"
                                title="Dispatch Consignment"
                              >
                                <Truck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadInvoice(ord)}
                              className="p-1.5 bg-paper hover:bg-black/10 rounded-lg text-steel hover:text-ink transition-colors"
                              title="Download GST Invoice PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-black/10 flex items-center justify-between text-xs text-steel">
                <span>
                  Showing {orders.length} of {ordersTotal} orders
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrdersPage((p) => Math.max(p - 1, 1))}
                    disabled={ordersPage <= 1}
                    className="p-1.5 bg-white border border-black/10 rounded-lg hover:bg-paper disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-ink">Page {ordersPage}</span>
                  <button
                    onClick={() => setOrdersPage((p) => p + 1)}
                    disabled={orders.length < ordersLimit}
                    className="p-1.5 bg-white border border-black/10 rounded-lg hover:bg-paper disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* =================== TAB 2: QUOTATIONS TABLE =================== */
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-xs">
          {quotes.length === 0 ? (
            <EmptyState
              icon={<FileSpreadsheet className="w-6 h-6 text-brand" />}
              title="No Commercial Quotations"
              description={
                searchTerm || quoteStatusFilter !== "All"
                  ? "No quotations match the active filter criteria."
                  : "No B2B RFQs or quotations logged in database yet."
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px] font-mono">
                    <tr>
                      <th className="p-4">RFQ / Quote #</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Client & Contact</th>
                      <th className="p-4">Project Requirements</th>
                      <th className="p-4">Estimated Value</th>
                      <th className="p-4">Proposal Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {quotes.map((q) => (
                      <tr key={q._id} className="hover:bg-paper/40 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-ink block">{q.quoteNumber}</span>
                          {q.convertedOrderId && (
                            <span className="text-[10px] font-mono text-green-700 font-bold block">
                              Order Linked
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-steel">
                          {new Date(q.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-ink block">
                            {q.customer?.companyName || q.customer?.name || "Client"}
                          </span>
                          <span className="text-[11px] text-steel block">
                            Contact: {q.customer?.name} ({q.customer?.phone})
                          </span>
                          <span className="text-[10px] text-steel block">{q.customer?.email}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-ink font-medium block truncate max-w-xs">
                            {q.requirements || "Commercial fire safety installation & supply"}
                          </span>
                          <span className="text-[10px] text-steel font-mono">
                            {q.items?.length || 0} line items requested
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold font-mono text-brand text-sm block">
                            ₹{(q.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-steel">Includes 18% GST</span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={q.status} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedQuote(q)}
                              className="p-1.5 bg-paper hover:bg-black/10 rounded-lg text-ink transition-colors"
                              title="View Quote Proposal Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {q.status !== "converted" && q.status !== "rejected" && (
                              <button
                                onClick={() => setConvertDialogQuote(q)}
                                className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg font-semibold text-[11px] transition-colors"
                                title="Convert to Purchase Order"
                              >
                                Convert to Order
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadQuote(q)}
                              className="p-1.5 bg-paper hover:bg-black/10 rounded-lg text-steel hover:text-ink transition-colors"
                              title="Download Quote Proposal PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-black/10 flex items-center justify-between text-xs text-steel">
                <span>
                  Showing {quotes.length} of {quotesTotal} quotations
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuotesPage((p) => Math.max(p - 1, 1))}
                    disabled={quotesPage <= 1}
                    className="p-1.5 bg-white border border-black/10 rounded-lg hover:bg-paper disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-ink">Page {quotesPage}</span>
                  <button
                    onClick={() => setQuotesPage((p) => p + 1)}
                    disabled={quotes.length < quotesLimit}
                    className="p-1.5 bg-white border border-black/10 rounded-lg hover:bg-paper disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =================== MODAL 1: ORDER DETAILS =================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-2xl border border-black/10 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-ink">
                    Order Consignment {selectedOrder.orderNumber}
                  </h3>
                  <StatusBadge status={selectedOrder.status} />
                  <StatusBadge status={selectedOrder.paymentStatus} />
                </div>
                <p className="text-xs text-steel mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")} via{" "}
                  <span className="capitalize">{selectedOrder.paymentMethod || "Online / Gateway"}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-steel hover:text-ink rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Customer & Shipping Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-paper/50 rounded-xl p-4 border border-black/5 space-y-2">
                  <span className="font-bold text-ink uppercase tracking-wider text-[10px] font-mono block">
                    Customer & Commercial Entity
                  </span>
                  <p className="font-semibold text-sm text-ink">{selectedOrder.customer?.name}</p>
                  {selectedOrder.customer?.companyName && (
                    <p className="text-steel font-medium">{selectedOrder.customer.companyName}</p>
                  )}
                  <p className="text-steel">Phone: {selectedOrder.customer?.phone}</p>
                  {selectedOrder.customer?.email && (
                    <p className="text-steel">Email: {selectedOrder.customer.email}</p>
                  )}
                  {selectedOrder.customer?.gstNumber && (
                    <p className="font-mono font-bold text-brand mt-1">
                      GSTIN: {selectedOrder.customer.gstNumber}
                    </p>
                  )}
                </div>

                <div className="bg-paper/50 rounded-xl p-4 border border-black/5 space-y-2">
                  <span className="font-bold text-ink uppercase tracking-wider text-[10px] font-mono block">
                    Consignment Destination
                  </span>
                  <p className="text-ink font-medium">
                    {selectedOrder.shippingAddress?.line1}
                    {selectedOrder.shippingAddress?.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ""}
                  </p>
                  <p className="text-steel">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                    <span className="font-mono font-bold text-ink">
                      {selectedOrder.shippingAddress?.pincode}
                    </span>
                  </p>
                  <div className="pt-2 border-t border-black/5">
                    <span className="text-[11px] text-steel">
                      Transporter:{" "}
                      <strong>{selectedOrder.deliveryDetails?.carrier || "Standard Delivery"}</strong>
                    </span>
                    {selectedOrder.deliveryDetails?.lrNumber && (
                      <span className="block font-mono text-[11px] text-ink font-bold">
                        Docket/LR: {selectedOrder.deliveryDetails.lrNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-black/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-paper border-b border-black/10 font-bold uppercase tracking-wider text-[10px] text-steel font-mono">
                    <tr>
                      <th className="p-3">Fire Safety Product / Hardware</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3">
                          <span className="font-semibold text-ink block">{item.name}</span>
                          {item.SKU && (
                            <span className="text-[10px] font-mono text-steel">SKU: {item.SKU}</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-ink">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right font-mono text-steel">
                          ₹{item.price.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-ink">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pricing Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 p-4 bg-paper/60 rounded-xl border border-black/5">
                  <div className="flex justify-between text-steel">
                    <span>Taxable Subtotal</span>
                    <span className="font-mono text-ink">
                      ₹{(selectedOrder.pricing?.subtotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-steel">
                    <span>Statutory GST (18%)</span>
                    <span className="font-mono text-ink">
                      ₹{(selectedOrder.pricing?.gst || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedOrder.pricing?.shippingFee ? (
                    <div className="flex justify-between text-steel">
                      <span>Logistics & Freight</span>
                      <span className="font-mono text-ink">
                        ₹{selectedOrder.pricing.shippingFee.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : null}
                  {selectedOrder.pricing?.discount ? (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Discount Coupon</span>
                      <span className="font-mono">
                        -₹{selectedOrder.pricing.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : null}
                  <div className="pt-2 border-t border-black/10 flex justify-between font-bold text-sm text-ink">
                    <span>Grand Total</span>
                    <span className="font-mono text-brand">
                      ₹{(selectedOrder.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Order Actions */}
              <div className="p-4 bg-paper rounded-xl border border-black/5 flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-ink">Fulfillment Status Workflow:</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                    disabled={statusUpdateLoading}
                    className="px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-bold text-ink focus:outline-none focus:ring-1 focus:ring-brand shadow-2xs"
                  >
                    {ORDER_STATUSES.filter((s) => s !== "All").map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    className="px-3 py-1.5 bg-brand text-white rounded-lg font-semibold flex items-center gap-1.5 hover:bg-brand-dark transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Tax Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL 2: QUOTE DETAILS =================== */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-2xl border border-black/10 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-ink">
                    Quotation Proposal {selectedQuote.quoteNumber}
                  </h3>
                  <StatusBadge status={selectedQuote.status} />
                </div>
                <p className="text-xs text-steel mt-0.5">
                  Submitted on {new Date(selectedQuote.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1.5 text-steel hover:text-ink rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="bg-paper/50 rounded-xl p-4 border border-black/5 space-y-2">
                <span className="font-bold text-ink uppercase tracking-wider text-[10px] font-mono block">
                  Commercial Prospect Information
                </span>
                <p className="font-semibold text-sm text-ink">
                  {selectedQuote.customer?.companyName || selectedQuote.customer?.name}
                </p>
                <p className="text-steel">Contact Person: {selectedQuote.customer?.name}</p>
                <p className="text-steel">Phone: {selectedQuote.customer?.phone}</p>
                <p className="text-steel">Email: {selectedQuote.customer?.email}</p>
                {selectedQuote.customer?.gstNumber && (
                  <p className="font-mono font-bold text-brand">
                    GSTIN: {selectedQuote.customer.gstNumber}
                  </p>
                )}
              </div>

              <div>
                <span className="font-bold text-ink block mb-1">Requirement Specifications:</span>
                <div className="p-3 bg-paper rounded-xl border border-black/5 text-ink leading-relaxed whitespace-pre-wrap">
                  {selectedQuote.requirements || "Comprehensive fire extinguisher refill and hydrant audit."}
                </div>
              </div>

              {selectedQuote.items && selectedQuote.items.length > 0 && (
                <div className="border border-black/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-paper border-b border-black/10 font-bold uppercase tracking-wider text-[10px] text-steel font-mono">
                      <tr>
                        <th className="p-3">Specification Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Rate</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {selectedQuote.items.map((it, i) => (
                        <tr key={i}>
                          <td className="p-3 font-semibold text-ink">{it.name}</td>
                          <td className="p-3 text-center font-mono font-bold">{it.quantity}</td>
                          <td className="p-3 text-right font-mono text-steel">
                            ₹{it.unitPrice.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-ink">
                            ₹{(it.total || it.unitPrice * it.quantity).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 bg-paper/60 rounded-xl border border-black/5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-ink block">
                    Commercial Proposal Valuation:
                  </span>
                  <span className="text-[11px] text-steel">Includes 18% statutory GST</span>
                </div>
                <span className="text-xl font-display font-bold font-mono text-brand">
                  ₹{(selectedQuote.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Status transition controls */}
              <div className="p-4 bg-paper rounded-xl border border-black/5 flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-ink">Proposal Stage:</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedQuote.status}
                    onChange={(e) => handleUpdateQuoteStatus(selectedQuote._id, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-bold text-ink focus:outline-none focus:ring-1 focus:ring-brand shadow-2xs capitalize"
                  >
                    {QUOTE_STATUSES.filter((s) => s !== "All").map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDownloadQuote(selectedQuote)}
                    className="px-3 py-1.5 bg-brand text-white rounded-lg font-semibold flex items-center gap-1.5 hover:bg-brand-dark transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Proposal PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL 3: DISPATCH FULFILLMENT =================== */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-2xl border border-black/10 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div>
                <h3 className="font-display font-bold text-base text-ink">Dispatch Consignment</h3>
                <p className="text-xs text-steel">Order #{dispatchModalOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="p-1 text-steel hover:text-ink rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">
                  Logistics Transporter / Carrier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. V-Trans Safe Express, Blue Dart, Local City Van"
                  required
                  className="w-full px-3 py-2 bg-paper/50 border border-black/15 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand font-medium text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Transporter Docket / LR Number
                </label>
                <input
                  type="text"
                  value={lrNumber}
                  onChange={(e) => setLrNumber(e.target.value)}
                  placeholder="e.g. LR-MH-882104"
                  required
                  className="w-full px-3 py-2 bg-paper/50 border border-black/15 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand font-mono font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">
                  Estimated Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full px-3 py-2 bg-paper/50 border border-black/15 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand text-ink"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 bg-paper hover:bg-gray-100 rounded-xl font-semibold text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                >
                  {dispatching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Quote Confirmation Dialog */}
      {convertDialogQuote && (
        <ConfirmDialog
          isOpen={Boolean(convertDialogQuote)}
          title="Convert Quotation to Order?"
          message={`Are you sure you want to convert quote ${convertDialogQuote.quoteNumber} into a commercial order with value ₹${(convertDialogQuote.pricing?.grandTotal || 0).toLocaleString("en-IN")}? A purchase consignment record will be generated immediately.`}
          confirmLabel="Convert to Order"
          cancelLabel="Dismiss"
          isLoading={converting}
          onConfirm={handleConfirmConvert}
          onCancel={() => setConvertDialogQuote(null)}
        />
      )}
    </div>
  );
}
