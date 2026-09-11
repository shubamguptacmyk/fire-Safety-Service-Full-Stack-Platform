import { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Percent,
  IndianRupee,
  Calendar,
  X,
  Clock,
  Layers,
} from "lucide-react";
import { adminCouponService, AdminCouponItem } from "@/services/adminCouponService";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/store/toastStore";

export default function CouponsAdmin() {
  const { can } = useAdminAuthStore();
  const canManage = can("settings.manage") || can("*");

  const [coupons, setCoupons] = useState<AdminCouponItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCouponItem | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minimumOrderValue: number;
    maxDiscountAmount: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    perUserLimit: number;
    isActive: boolean;
  }>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderValue: 2000,
    maxDiscountAmount: 1000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    couponId: string;
    code: string;
  }>({
    isOpen: false,
    couponId: "",
    code: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminCouponService.getCoupons({
        page,
        limit,
        isActive: activeFilter === "all" ? undefined : activeFilter === "active",
      });
      setCoupons(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load coupon codes");
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  function openCreateModal() {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minimumOrderValue: 2000,
      maxDiscountAmount: 1000,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      usageLimit: 100,
      perUserLimit: 1,
      isActive: true,
    });
    setModalOpen(true);
  }

  function openEditModal(coupon: AdminCouponItem) {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderValue: coupon.minimumOrderValue || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 10) : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 10) : "",
      usageLimit: coupon.usageLimit || 100,
      perUserLimit: coupon.perUserLimit || 1,
      isActive: coupon.isActive,
    });
    setModalOpen(true);
  }

  const toast = useToast();

  async function handleSaveCoupon(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        await adminCouponService.updateCoupon(editingCoupon._id, formData);
        toast.success(`Coupon code ${formData.code} updated successfully`);
      } else {
        await adminCouponService.createCoupon(formData);
        toast.success(`Coupon code ${formData.code} created successfully`);
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCoupon() {
    setIsDeleting(true);
    try {
      await adminCouponService.deleteCoupon(deleteDialog.couponId);
      toast.success(`Coupon ${deleteDialog.code} deleted successfully`);
      setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete coupon");
    } finally {
      setIsDeleting(false);
    }
  }

  // Filtered by Search Term
  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Coupons & Promotions" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Coupons & Promotional Discounts</h1>
          <p className="text-xs text-steel mt-0.5">
            Manage percentage and fixed-value promotional codes, minimum order requirements, and redemption limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={openCreateModal}
              className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Create Coupon
            </button>
          )}

          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="px-3.5 py-1.5 bg-white border border-black/10 hover:bg-gray-50 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Campaigns"
          value={activeCount}
          subtext="Codes currently redeemable during checkout"
          icon={Tag}
          iconColorClass="text-brand bg-brand/10"
        />
        <StatCard
          title="Total Redemptions"
          value={totalRedemptions}
          subtext="Orders completed with applied coupon savings"
          icon={CheckCircle2}
          iconColorClass="text-green-700 bg-green-50"
        />
        <StatCard
          title="Configured Coupons"
          value={total}
          subtext="Total promotional coupons registered"
          icon={Layers}
        />
        <StatCard
          title="Average Discount"
          value="15%"
          subtext="Standard promotional incentive rate"
          icon={Percent}
          iconColorClass="text-amber-700 bg-amber-50"
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-steel absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search coupon code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand font-medium text-ink bg-paper/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-paper/60 px-3 py-1.5 rounded-lg border border-black/5">
            <Filter className="w-3.5 h-3.5 text-steel" />
            <span className="font-semibold text-steel">Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none font-bold text-ink focus:outline-none cursor-pointer"
            >
              <option value="all">All Coupons</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCoupons} />
      ) : filteredCoupons.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-6 h-6" />}
          title="No promo coupons found"
          description="Create your first discount coupon code to incentivize customers or special seasonal sales."
          action={
            canManage ? (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-brand text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create Coupon
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
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Discount</th>
                  <th className="p-3.5">Min. Order</th>
                  <th className="p-3.5">Usage / Limit</th>
                  <th className="p-3.5">Valid Dates</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredCoupons.map((c) => {
                  const isExpired = new Date(c.endDate) < new Date();

                  return (
                    <tr key={c._id} className="hover:bg-paper/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-brand text-sm">{c.code}</div>
                        {c.description && (
                          <span className="text-[11px] text-steel block truncate max-w-xs">
                            {c.description}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-ink whitespace-nowrap">
                        {c.discountType === "percentage" ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-mono">
                            {c.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-mono">
                            ₹{c.discountValue} FLAT
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-steel whitespace-nowrap">
                        ₹{c.minimumOrderValue ? c.minimumOrderValue.toLocaleString("en-IN") : "0"}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-semibold text-ink">
                          {c.usageCount} / {c.usageLimit || "∞"}
                        </div>
                        <span className="text-[10px] text-steel block">
                          Max {c.perUserLimit} per account
                        </span>
                      </td>
                      <td className="p-3.5 text-steel whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span>{new Date(c.startDate).toLocaleDateString("en-IN")}</span>
                          <span>→</span>
                          <span className={isExpired ? "text-red-600 font-bold" : ""}>
                            {new Date(c.endDate).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        {isExpired && (
                          <span className="text-[10px] text-red-600 font-semibold block">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {c.isActive && !isExpired ? (
                          <StatusBadge status="active" />
                        ) : (
                          <StatusBadge status={isExpired ? "expired" : "inactive"} />
                        )}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEditModal(c)}
                              className="p-1.5 text-steel hover:text-ink hover:bg-black/5 rounded transition-colors"
                              title="Edit Coupon Parameters"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteDialog({
                                  isOpen: true,
                                  couponId: c._id,
                                  code: c.code,
                                })
                              }
                              className="p-1.5 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-black/10 overflow-hidden">
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand" />
                <h2 className="font-display font-bold text-base text-ink">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-black/10 rounded font-mono font-bold uppercase focus:ring-1 focus:ring-brand"
                  placeholder="e.g. DIWALI20"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Campaign Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-black/10 rounded focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Special Festive 20% discount on fire safety equipment"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full p-2 border border-black/10 rounded font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-black/10 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Min. Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumOrderValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumOrderValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: parseInt(e.target.value, 10) || 100 })
                    }
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Per User Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, perUserLimit: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border border-black/10 rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveCoupon"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-brand focus:ring-brand"
                />
                <label htmlFor="isActiveCoupon" className="font-semibold text-ink cursor-pointer">
                  Activate this coupon immediately for customer checkouts
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white border border-black/10 rounded-lg text-ink font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Promotion Coupon"
        message={`Are you sure you want to permanently delete coupon "${deleteDialog.code}"? Customers will no longer be able to apply this code.`}
        confirmLabel="Delete Coupon"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteCoupon}
        onCancel={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
