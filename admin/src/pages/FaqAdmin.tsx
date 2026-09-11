import { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { adminFaqService, AdminFAQItem } from "@/services/adminFaqService";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/store/toastStore";

export default function FaqAdmin() {
  const [faqs, setFaqs] = useState<AdminFAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Fire Extinguishers");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFaqService.getFaqs();
      setFaqs(data || []);
    } catch (err) {
      console.error("Failed to fetch FAQs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  function openCreateModal() {
    setEditingFaqId(null);
    setQuestion("");
    setAnswer("");
    setCategory("Fire Extinguishers");
    setOrder(faqs.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(faq: AdminFAQItem) {
    setEditingFaqId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setOrder(faq.order || 0);
    setIsActive(faq.isActive);
    setIsModalOpen(true);
  }

  async function handleSaveFaq(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingFaqId) {
        await adminFaqService.updateFaq(editingFaqId, {
          question,
          answer,
          category,
          order,
          isActive,
        });
      } else {
        await adminFaqService.createFaq({
          question,
          answer,
          category,
          order,
          isActive,
        });
      }
      toast.success(editingFaqId ? "FAQ updated successfully" : "New FAQ created successfully");
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save FAQ");
    } finally {
      setIsSaving(false);
    }
  }

  const toast = useToast();
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleToggleStatus(faq: AdminFAQItem) {
    try {
      await adminFaqService.updateFaqStatus(faq._id, !faq.isActive);
      toast.info(`FAQ ${!faq.isActive ? "activated" : "deactivated"}`);
      setFaqs((prev) =>
        prev.map((f) => (f._id === faq._id ? { ...f, isActive: !faq.isActive } : f))
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle FAQ status");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteFaqId) return;
    setIsDeleting(true);
    try {
      await adminFaqService.deleteFaq(deleteFaqId);
      toast.success("FAQ deleted successfully");
      setFaqs((prev) => prev.filter((f) => f._id !== deleteFaqId));
      setDeleteFaqId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete FAQ");
    } finally {
      setIsDeleting(false);
    }
  }

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category || "General")))];

  const filtered = faqs.filter((f) => {
    const matchesCategory = categoryFilter === "All" || f.category === categoryFilter;
    const matchesSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Frequently Asked Questions" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Frequently Asked Questions (FAQ)</h1>
          <p className="text-xs text-steel mt-0.5">
            Public portal helpdesk answers, refill FAQs, AMC guidelines, and customer troubleshooting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFaqs}
            className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded-lg text-xs font-semibold text-ink flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper/50 border border-black/10 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-steel font-medium">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-black/10 rounded text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-steel gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-xs">Loading FAQs...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-steel text-xs">No FAQ items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 max-w-xs">Question</th>
                  <th className="p-3.5">Answer Summary</th>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-paper/30 transition-colors">
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-brand/10 text-brand font-medium text-[11px] whitespace-nowrap">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-ink max-w-xs">{item.question}</td>
                    <td className="p-3.5 text-steel max-w-md line-clamp-2">{item.answer}</td>
                    <td className="p-3.5 font-mono text-steel">{item.order}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-steel hover:text-ink hover:bg-paper rounded transition-colors"
                        title="Edit FAQ"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteFaqId(item._id)}
                        className="p-1 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete FAQ"
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

      {/* FAQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display font-bold text-base text-ink">
                {editingFaqId ? "Edit FAQ" : "Create New FAQ"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-steel hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fire Extinguishers, AMC Contracts, Hydrant System"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How often should fire extinguishers be refilled?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive, clear instructions and statutory references..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-ink block mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span className="font-medium text-ink">Active on Public Site</span>
                  </label>
                </div>
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
                  {isSaving ? "Saving..." : editingFaqId ? "Update FAQ" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteFaqId)}
        title="Delete FAQ Entry?"
        message="Are you sure you want to delete this FAQ? It will be removed from the public customer support portal."
        confirmLabel="Delete FAQ"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteFaqId(null)}
      />
    </div>
  );
}
