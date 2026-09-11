import { useState, useEffect, useCallback } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  User,
  Package,
} from "lucide-react";
import { adminReviewsService, AdminReviewItem } from "@/services/adminReviewsService";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/store/toastStore";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminReviewsService.getReviews({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toast = useToast();
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleApprove(id: string) {
    try {
      await adminReviewsService.moderateReview(id, "approved");
      toast.success("Review published and approved!");
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "approved" as const } : r))
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve review");
    }
  }

  async function handleConfirmReject() {
    if (!rejectingId) return;
    setIsSubmitting(true);
    try {
      await adminReviewsService.moderateReview(rejectingId, "rejected", rejectionReason);
      toast.info("Review marked as rejected");
      setReviews((prev) =>
        prev.map((r) =>
          r._id === rejectingId
            ? { ...r, status: "rejected" as const, rejectionReason }
            : r
        )
      );
      setRejectingId(null);
      setRejectionReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject review");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteReviewId) return;
    setIsDeleting(true);
    try {
      await adminReviewsService.deleteReview(deleteReviewId);
      toast.success("Review permanently deleted");
      setReviews((prev) => prev.filter((r) => r._id !== deleteReviewId));
      setDeleteReviewId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = reviews.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesProduct = r.product?.name?.toLowerCase().includes(term);
    const matchesUser = r.user?.name?.toLowerCase().includes(term) || r.user?.email?.toLowerCase().includes(term);
    const matchesComment = r.comment?.toLowerCase().includes(term) || (r.title && r.title.toLowerCase().includes(term));
    return matchesProduct || matchesUser || matchesComment;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Reviews Moderation" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Product & Service Reviews Moderation</h1>
          <p className="text-xs text-steel mt-0.5">
            Customer feedback moderation queue, star ratings verification, and quality compliance.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded-lg text-xs font-semibold text-ink flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, product, or review text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper/50 border border-black/10 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-steel" />
          <div className="flex rounded-lg border border-black/10 p-0.5 bg-paper/50 text-xs">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded capitalize font-semibold transition-colors ${
                  statusFilter === s ? "bg-brand text-white shadow-sm" : "text-steel hover:text-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-steel gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-xs">Loading reviews...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-steel text-xs">No reviews match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Feedback & Remarks</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-paper/30 transition-colors">
                    <td className="p-3.5 max-w-[200px]">
                      <div className="font-semibold text-ink truncate">{item.product?.name || "Safety Product"}</div>
                      <span className="text-[10px] text-steel font-mono">ID: {item.product?._id}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-ink flex items-center gap-1">
                        {item.user?.name || "Customer"}
                        {item.isVerifiedPurchase && (
                          <span title="Verified Purchase">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-steel block">{item.user?.email}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < item.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-ink ml-1.5">{item.rating}/5</span>
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      {item.title && <div className="font-bold text-ink text-[11px] mb-0.5">{item.title}</div>}
                      <p className="text-steel line-clamp-2">{item.comment}</p>
                      {item.rejectionReason && (
                        <p className="text-[10px] text-red-600 mt-1 italic">Reason: {item.rejectionReason}</p>
                      )}
                    </td>
                    <td className="p-3.5 text-steel whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          item.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                      {item.status !== "approved" && (
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 rounded font-semibold transition-colors"
                          title="Approve Review"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Approve
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button
                          onClick={() => {
                            setRejectingId(item._id);
                            setRejectionReason("");
                          }}
                          className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-200 rounded font-semibold transition-colors"
                          title="Reject Review"
                        >
                          <XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteReviewId(item._id)}
                        className="p-1 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-black/10">
            <h3 className="text-base font-bold text-ink">Reject Customer Review</h3>
            <p className="text-xs text-steel">
              Specify the moderation rationale for rejecting this customer review.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Inappropriate language, off-topic, spam..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 text-xs bg-paper border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 text-xs text-steel hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteReviewId)}
        title="Delete Customer Review?"
        message="Are you sure you want to permanently delete this customer feedback? This action is immutable."
        confirmLabel="Delete Review"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteReviewId(null)}
      />
    </div>
  );
}
