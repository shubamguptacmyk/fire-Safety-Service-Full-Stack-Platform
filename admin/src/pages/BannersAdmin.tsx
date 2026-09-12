import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { adminMarketingService, AdminBannerItem } from "@/services/adminMarketingService";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConfirmDialog from "@/components/ConfirmDialog";
import ImageUploadInput from "@/components/ImageUploadInput";
import { useToast } from "@/store/toastStore";

export default function BannersAdmin() {
  const [banners, setBanners] = useState<AdminBannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [position, setPosition] = useState<"home_hero" | "home_secondary" | "promo_strip" | "category_top">("home_hero");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminMarketingService.getBanners();
      setBanners(data || []);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  function openCreateModal() {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setImage("");
    setLink("");
    setButtonText("Explore Now");
    setPosition("home_hero");
    setOrder(banners.length + 1);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setIsModalOpen(true);
  }

  function openEditModal(b: AdminBannerItem) {
    setEditingId(b._id);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImage(b.image);
    setLink(b.link || "");
    setButtonText(b.buttonText || "");
    setPosition(b.position);
    setOrder(b.order || 0);
    setIsActive(b.isActive);
    setStartDate(b.startDate ? b.startDate.substring(0, 10) : "");
    setEndDate(b.endDate ? b.endDate.substring(0, 10) : "");
    setIsModalOpen(true);
  }

  async function handleSaveBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!image.trim()) {
      toast.error("Please provide or upload a banner image");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title,
        subtitle,
        image,
        link,
        buttonText,
        position,
        order,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };

      if (editingId) {
        await adminMarketingService.updateBanner(editingId, payload);
        toast.success("Promotional banner updated successfully");
      } else {
        await adminMarketingService.createBanner(payload);
        toast.success("Promotional banner published successfully");
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save banner");
    } finally {
      setIsSaving(false);
    }
  }

  const toast = useToast();
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deleteBannerId) return;
    setIsDeleting(true);
    try {
      await adminMarketingService.deleteBanner(deleteBannerId);
      toast.success("Banner deleted successfully");
      setBanners((prev) => prev.filter((b) => b._id !== deleteBannerId));
      setDeleteBannerId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete banner");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Marketing Banners" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Marketing Banner Management</h1>
          <p className="text-xs text-steel mt-0.5">
            Configure homepage hero slider campaigns, seasonal discount ribbons, and category banner displays.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded-lg text-xs font-semibold text-ink flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        </div>
      </div>

      {/* Banner Grid Preview */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-steel gap-2 bg-white rounded-xl border border-black/10">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <span className="text-xs">Loading banners...</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center text-steel text-xs bg-white rounded-xl border border-black/10">
          No promotional banners configured yet. Click "Add Banner" to launch a campaign.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-brand/40 transition-colors"
            >
              <div>
                {/* Visual Preview */}
                <div className="h-40 bg-paper relative overflow-hidden flex items-center justify-center">
                  {b.image ? (
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-steel" />
                  )}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.isActive ? "bg-green-600 text-white" : "bg-gray-700 text-white"
                    }`}
                  >
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                    {b.position}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1.5 text-xs">
                  <h3 className="font-bold text-ink text-sm">{b.title}</h3>
                  {b.subtitle && <p className="text-steel line-clamp-1">{b.subtitle}</p>}
                  {b.link && (
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand text-[11px] font-semibold flex items-center gap-1 hover:underline truncate"
                    >
                      <ExternalLink className="w-3 h-3" /> {b.link}
                    </a>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-paper/50 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-steel text-[11px] font-mono">Order: #{b.order}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1 text-steel hover:text-ink hover:bg-white rounded transition-colors"
                    title="Edit Banner"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteBannerId(b._id)}
                    className="p-1 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-black/10 space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/10 pb-3 shrink-0">
              <h3 className="font-display font-bold text-base text-ink">
                {editingId ? "Edit Promotional Banner" : "Add Promotional Banner"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-steel hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3.5 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="font-bold text-ink block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Fire Safety Month — 15% Off AMC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Subtitle / Callout</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Form B renewals for MIDC Navi Mumbai factories"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                />
              </div>

              <ImageUploadInput
                label="Banner Image"
                required
                value={image}
                onChange={setImage}
                folder="banners"
                aspectRatio="banner"
                helpText="Choose 'Upload Image' to upload from your computer or 'Image URL' to enter an image address directly."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Target Page Link</label>
                  <input
                    type="text"
                    placeholder="/products or /service"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Book Inspection"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Display Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full p-2 bg-white border border-black/10 rounded font-semibold"
                  >
                    <option value="home_hero">Homepage Hero Slider</option>
                    <option value="home_secondary">Homepage Secondary Promo</option>
                    <option value="promo_strip">Top Promo Strip Ribbon</option>
                    <option value="category_top">Category Header Banner</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Campaign Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Campaign End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="font-bold text-ink">Active on Live Website</span>
                </label>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-steel hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-brand text-white rounded font-bold hover:bg-brand-dark"
                >
                  {isSaving ? "Saving..." : editingId ? "Update Banner" : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteBannerId)}
        title="Delete Promotional Banner?"
        message="Are you sure you want to delete this promotional banner? It will be immediately removed from the customer storefront."
        confirmLabel="Delete Banner"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteBannerId(null)}
      />
    </div>
  );
}
