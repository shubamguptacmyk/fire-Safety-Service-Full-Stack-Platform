import { useState, useEffect } from "react";
import { Category, Subcategory } from "@/types";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

interface CategoryModalProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
}

export default function CategoryModal({
  category,
  isOpen,
  onClose,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subName, setSubName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setSlug(category.slug || "");
      setDescription(category.description || "");
      setImage(category.image || "");
      setSortOrder(category.sortOrder || 0);
      setIsActive(category.isActive ?? true);
      setSubcategories(category.subcategories || []);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setImage("");
      setSortOrder(0);
      setIsActive(true);
      setSubcategories([]);
    }
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  function handleAddSubcategory(e: React.FormEvent) {
    e.preventDefault();
    if (!subName.trim()) return;
    const subSlug = subName
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-");
    setSubcategories((prev) => [...prev, { name: subName.trim(), slug: subSlug }]);
    setSubName("");
  }

  function handleRemoveSubcategory(index: number) {
    setSubcategories((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        image: image.trim(),
        sortOrder: Number(sortOrder),
        isActive,
        subcategories,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-black/10 z-10 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-4">
          <h3 className="font-bold text-base text-ink">
            {category ? "Edit Category" : "Add New Category"}
          </h3>
          <button onClick={onClose} className="text-steel hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink/80 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fire Extinguishers"
              className="w-full px-3 py-2 border border-black/20 rounded text-sm focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/80 mb-1">
              URL Slug (Optional - auto-generated if blank)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. fire-extinguishers"
              className="w-full px-3 py-2 border border-black/20 rounded text-sm focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/80 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of this equipment line..."
              className="w-full px-3 py-2 border border-black/20 rounded text-sm focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/80 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-black/20 rounded text-sm focus:border-brand outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink/80 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 border border-black/20 rounded text-sm focus:border-brand outline-none"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                Active in Catalog
              </label>
            </div>
          </div>

          {/* Subcategories Manager */}
          <div className="pt-3 border-t border-black/10">
            <label className="block text-xs font-semibold text-ink/80 mb-2">Subcategories</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="New subcategory name..."
                className="flex-1 px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {subcategories.map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-paper border border-black/10 rounded text-xs flex items-center gap-1.5"
                >
                  {sub.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubcategory(idx)}
                    className="text-steel hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600 pt-1">{error}</p>}

          <div className="flex justify-end gap-2 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black/10 rounded text-xs font-medium hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {category ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
