import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";
import { adminMarketingService, AdminGalleryItem } from "@/services/adminMarketingService";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/store/toastStore";

export default function GalleryAdmin() {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<"installation" | "amc" | "training" | "equipment" | "audit">("installation");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminMarketingService.getGallery({
        category: categoryFilter === "all" ? undefined : categoryFilter,
      });
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch gallery items", err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  function openCreateModal() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setCategory("installation");
    setOrder(items.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(g: AdminGalleryItem) {
    setEditingId(g._id);
    setTitle(g.title);
    setDescription(g.description || "");
    setImageUrl(g.imageUrl);
    setCategory(g.category);
    setOrder(g.order || 0);
    setIsActive(g.isActive);
    setIsModalOpen(true);
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        title,
        description,
        imageUrl,
        category,
        order,
        isActive,
      };

      if (editingId) {
        await adminMarketingService.updateGalleryItem(editingId, payload);
        toast.success("Gallery showcase item updated successfully");
      } else {
        await adminMarketingService.createGalleryItem(payload);
        toast.success("New project image added to gallery showcase");
      }
      setIsModalOpen(false);
      fetchGallery();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save gallery item");
    } finally {
      setIsSaving(false);
    }
  }

  const toast = useToast();
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deleteGalleryId) return;
    setIsDeleting(true);
    try {
      await adminMarketingService.deleteGalleryItem(deleteGalleryId);
      toast.success("Gallery item removed successfully");
      setItems((prev) => prev.filter((i) => i._id !== deleteGalleryId));
      setDeleteGalleryId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete gallery item");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Project Gallery" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Project Showcase & Field Work Gallery</h1>
          <p className="text-xs text-steel mt-0.5">
            Photographs of industrial hydrant installations, fire suppression flooding tests, mock drills, and AMC audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchGallery}
            className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded-lg text-xs font-semibold text-ink flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Project Photo
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="bg-white border border-black/10 rounded-xl p-3 flex items-center gap-2 overflow-x-auto shadow-sm text-xs">
        <Filter className="w-3.5 h-3.5 text-steel ml-1" />
        <span className="text-steel font-medium">Category:</span>
        {[
          { id: "all", label: "All Projects" },
          { id: "installation", label: "Installation & Hydrants" },
          { id: "amc", label: "AMC & Inspection" },
          { id: "training", label: "Fire Drills & Training" },
          { id: "audit", label: "Statutory Safety Audits" },
          { id: "equipment", label: "Equipment Testing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              categoryFilter === tab.id
                ? "bg-brand text-white shadow-sm"
                : "bg-paper text-steel hover:text-ink border border-black/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsive Gallery Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-steel gap-2 bg-white rounded-xl border border-black/10">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <span className="text-xs">Loading showcase gallery...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-steel text-xs bg-white rounded-xl border border-black/10">
          No project photographs found in this category. Click "Add Project Photo" to upload.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-brand/40 transition-colors"
            >
              <div>
                <div className="h-44 bg-paper relative overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-steel" />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold capitalize">
                    {item.category}
                  </span>
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.isActive ? "bg-green-600 text-white" : "bg-gray-700 text-white"
                    }`}
                  >
                    {item.isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
                <div className="p-3 text-xs space-y-1">
                  <h3 className="font-bold text-ink truncate text-sm">{item.title}</h3>
                  {item.description && (
                    <p className="text-steel text-[11px] line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-paper/50 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="font-mono text-steel text-[10px]">Order #{item.order}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-steel hover:text-ink hover:bg-white rounded transition-colors"
                    title="Edit Photo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteGalleryId(item._id)}
                    className="p-1 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Photo"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display font-bold text-base text-ink">
                {editingId ? "Edit Showcase Item" : "Add Project Photograph"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-steel hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Project / System Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CO2 Flooding System Installation — Turbhe MIDC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/install.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-white border border-black/10 rounded font-semibold"
                  >
                    <option value="installation">Installation</option>
                    <option value="amc">AMC & Inspection</option>
                    <option value="training">Training & Drills</option>
                    <option value="audit">Safety Audit</option>
                    <option value="equipment">Equipment Testing</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Description / Project Scope</label>
                <textarea
                  rows={3}
                  placeholder="Details about client type, location, system specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="font-bold text-ink">Visible on Public Showcase</span>
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
                  {isSaving ? "Saving..." : editingId ? "Update Item" : "Add to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteGalleryId)}
        title="Delete Gallery Photo?"
        message="Are you sure you want to remove this image from the public project showcase gallery? This action is permanent."
        confirmLabel="Delete Photo"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteGalleryId(null)}
      />
    </div>
  );
}
