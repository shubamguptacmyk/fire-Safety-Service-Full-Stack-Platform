import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  Calendar,
  X,
  ArrowDownLeft,
} from "lucide-react";
import { adminPaymentService, AdminPaymentItem } from "@/services/adminPaymentService";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/store/toastStore";

export default function PaymentsAdmin() {
  const { can } = useAdminAuthStore();
  const canManage = can("payments.manage") || can("*");

  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Selected for Details Modal
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentItem | null>(null);

  // Status Change Dialog
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
    newStatus: "pending" | "success" | "failed" | "refunded";
    title: string;
    message: string;
  }>({
    isOpen: false,
    paymentId: "",
    newStatus: "refunded",
    title: "",
    message: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminPaymentService.getPayments({
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        method: methodFilter === "all" ? undefined : methodFilter,
        search: search.trim() || undefined,
      });
      setPayments(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, methodFilter, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const toast = useToast();

  async function handleConfirmStatusChange() {
    setIsUpdatingStatus(true);
    try {
      await adminPaymentService.updatePaymentStatus(
        statusDialog.paymentId,
        statusDialog.newStatus
      );
      toast.success(`Transaction marked as "${statusDialog.newStatus}"`);
      setStatusDialog((prev) => ({ ...prev, isOpen: false }));
      if (selectedPayment && selectedPayment._id === statusDialog.paymentId) {
        setSelectedPayment((prev) =>
          prev ? { ...prev, status: statusDialog.newStatus } : null
        );
      }
      fetchPayments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update payment status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  // Summary Metrics
  const totalVolume = payments.reduce(
    (acc, p) => (p.status === "success" ? acc + p.amount : acc),
    0
  );
  const successCount = payments.filter((p) => p.status === "success").length;
  const refundCount = payments.filter((p) => p.status === "refunded").length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Payment Management" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Payments & Transactions</h1>
          <p className="text-xs text-steel mt-0.5">
            Real-time gateway settlements, Razorpay transaction verification, UPI/Cards, and client refunds.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white border border-black/10 hover:bg-gray-50 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Feed
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Captured Volume (Page)"
          value={`₹${totalVolume.toLocaleString("en-IN")}`}
          subtext="Successfully settled into merchant ledger"
          icon={IndianRupee}
          iconColorClass="text-green-700 bg-green-50"
        />
        <StatCard
          title="Total Transactions"
          value={total}
          subtext="Total payment transaction attempts recorded"
          icon={CreditCard}
        />
        <StatCard
          title="Settled Successfully"
          value={successCount}
          subtext="Verified via Razorpay / Instant gateway webhook"
          icon={CheckCircle2}
          iconColorClass="text-blue-700 bg-blue-50"
        />
        <StatCard
          title="Refunds Processed"
          value={refundCount}
          subtext="Order cancellations or customer adjustments"
          icon={ArrowDownLeft}
          iconColorClass="text-amber-700 bg-amber-50"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-steel absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Payment #, Txn ID, or Razorpay ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand font-medium text-ink bg-paper/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-paper/60 px-3 py-1.5 rounded-lg border border-black/5">
            <Filter className="w-3.5 h-3.5 text-steel" />
            <span className="font-semibold text-steel">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none font-bold text-ink focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-paper/60 px-3 py-1.5 rounded-lg border border-black/5">
            <span className="font-semibold text-steel">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none font-bold text-ink focus:outline-none cursor-pointer"
            >
              <option value="all">All Gateways</option>
              <option value="razorpay">Razorpay / UPI</option>
              <option value="cod">Cash On Delivery</option>
              <option value="mock">Sandbox / Mock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content / Table */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPayments} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-6 h-6" />}
          title="No payment records found"
          description="Try adjusting your filters or search terms. All inbound payments will appear here in real time."
        />
      ) : (
        <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-paper/80 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Linked Order</th>
                  <th className="p-3.5">Customer / Contact</th>
                  <th className="p-3.5">Amount (INR)</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {payments.map((p) => {
                  const customerName =
                    p.orderId?.customer?.name || p.user?.name || "Anonymous Guest";
                  const customerEmail =
                    p.orderId?.customer?.email || p.user?.email || "—";
                  const orderNum = p.orderId?.orderNumber || "—";

                  return (
                    <tr key={p._id} className="hover:bg-paper/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-ink whitespace-nowrap">
                        {p.paymentNumber}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {orderNum !== "—" ? (
                          <span className="font-mono font-semibold text-brand hover:underline cursor-pointer">
                            {orderNum}
                          </span>
                        ) : (
                          <span className="text-steel">—</span>
                        )}
                      </td>
                      <td className="p-3.5 max-w-[200px] truncate">
                        <div className="font-semibold text-ink truncate">{customerName}</div>
                        <span className="text-[11px] text-steel block truncate">{customerEmail}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-ink whitespace-nowrap">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-paper rounded text-[10px] font-mono font-semibold uppercase text-steel border border-black/5">
                          {p.method}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-steel whitespace-nowrap max-w-[150px] truncate">
                        {p.transactionId || p.razorpayPaymentId || "—"}
                      </td>
                      <td className="p-3.5 text-steel whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-black/10 rounded font-semibold text-ink inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
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
              Showing {payments.length} of {total} transactions
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
                disabled={payments.length < limit || page * limit >= total}
                className="px-3 py-1 bg-white border border-black/10 rounded font-semibold text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Drawer / Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-black/10">
            {/* Header */}
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-brand" />
                <div>
                  <h2 className="font-display font-bold text-base text-ink">
                    Payment {selectedPayment.paymentNumber}
                  </h2>
                  <span className="text-[11px] text-steel">
                    Logged on {new Date(selectedPayment.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Status Header */}
              <div className="p-4 bg-paper/50 rounded-xl border border-black/10 flex items-center justify-between">
                <div>
                  <span className="text-steel block text-[10px] uppercase font-bold">Transaction Status</span>
                  <StatusBadge status={selectedPayment.status} size="md" className="mt-1" />
                </div>
                <div className="text-right">
                  <span className="text-steel block text-[10px] uppercase font-bold">Settlement Amount</span>
                  <span className="text-xl font-mono font-bold text-ink">
                    ₹{selectedPayment.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Transaction Specs */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-sm text-ink pb-1 border-b border-black/10">
                  Payment Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3 py-1 font-mono">
                  <div className="p-2.5 bg-paper rounded border border-black/5">
                    <span className="text-[10px] text-steel uppercase block">Gateway Method</span>
                    <span className="font-bold text-ink uppercase">{selectedPayment.method}</span>
                  </div>
                  <div className="p-2.5 bg-paper rounded border border-black/5">
                    <span className="text-[10px] text-steel uppercase block">Currency</span>
                    <span className="font-bold text-ink">{selectedPayment.currency}</span>
                  </div>
                  <div className="col-span-2 p-2.5 bg-paper rounded border border-black/5 break-all">
                    <span className="text-[10px] text-steel uppercase block">Transaction Reference ID</span>
                    <span className="font-bold text-ink">
                      {selectedPayment.transactionId || selectedPayment.razorpayPaymentId || "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Order */}
              {selectedPayment.orderId && (
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-sm text-ink pb-1 border-b border-black/10">
                    Linked Sales Order
                  </h3>
                  <div className="p-3.5 bg-paper rounded-lg border border-black/5 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-steel">Order Number:</span>
                      <span className="font-mono font-bold text-brand">
                        {selectedPayment.orderId.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel">Customer Name:</span>
                      <span className="font-bold text-ink">
                        {selectedPayment.orderId.customer?.name || "Client"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel">Phone:</span>
                      <span className="font-mono text-ink">
                        {selectedPayment.orderId.customer?.phone || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel">Order Status:</span>
                      <StatusBadge status={selectedPayment.orderId.status} />
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway Payload (if any) */}
              {selectedPayment.gatewayResponse && (
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-sm text-ink pb-1 border-b border-black/10">
                    Raw Gateway Response Payload
                  </h3>
                  <pre className="p-3 bg-gray-900 text-green-400 font-mono text-[10px] rounded-lg overflow-x-auto max-h-48 border border-black/10">
                    {JSON.stringify(selectedPayment.gatewayResponse, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions & Status Controls */}
              {canManage && (
                <div className="space-y-2 pt-2 border-t border-black/10">
                  <h3 className="font-display font-bold text-sm text-ink">Administrative Controls</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPayment.status !== "refunded" && (
                      <button
                        onClick={() =>
                          setStatusDialog({
                            isOpen: true,
                            paymentId: selectedPayment._id,
                            newStatus: "refunded",
                            title: "Issue Full Customer Refund",
                            message: `Are you sure you want to mark payment ${selectedPayment.paymentNumber} (₹${selectedPayment.amount.toLocaleString("en-IN")}) as REFUNDED? The linked order's payment status will also be synchronized to refunded.`,
                          })
                        }
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" /> Process / Mark Refunded
                      </button>
                    )}

                    {selectedPayment.status === "pending" && (
                      <button
                        onClick={() =>
                          setStatusDialog({
                            isOpen: true,
                            paymentId: selectedPayment._id,
                            newStatus: "success",
                            title: "Mark Payment as Success",
                            message: `Marking payment ${selectedPayment.paymentNumber} as SUCCESS confirms that funds have been settled into the merchant bank account.`,
                          })
                        }
                        className="px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Settlement
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        title={statusDialog.title}
        message={statusDialog.message}
        confirmLabel={statusDialog.newStatus === "refunded" ? "Confirm Refund" : "Update Status"}
        isDestructive={statusDialog.newStatus === "refunded"}
        isLoading={isUpdatingStatus}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
