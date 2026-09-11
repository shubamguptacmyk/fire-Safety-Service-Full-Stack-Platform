import { useState } from "react";
import { Product } from "@/types";
import { X, Loader2 } from "lucide-react";

interface StockModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: number) => Promise<void>;
}

export default function StockModal({ product, isOpen, onClose, onSave }: StockModalProps) {
  const [stock, setStock] = useState(product.stock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSave(Number(stock));
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update stock");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-5 border border-black/10 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-4">
          <h3 className="font-bold text-base text-ink">Update Stock Level</h3>
          <button onClick={onClose} className="text-steel hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-ink truncate">{product.name}</p>
            <p className="text-[11px] text-steel">SKU: {product.SKU}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">
              Current Available Quantity
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-black/20 rounded text-sm focus:border-brand outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-black/10 rounded text-xs font-medium hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
