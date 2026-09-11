import React from "react";
import { FilterOptions, ProductQueryParams } from "@/types";
import { Filter, X, RotateCcw } from "lucide-react";

interface ProductFiltersProps {
  filterOptions?: FilterOptions;
  selectedParams: ProductQueryParams;
  onChange: (newParams: Partial<ProductQueryParams>) => void;
  onReset: () => void;
  className?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function ProductFilters({
  filterOptions,
  selectedParams,
  onChange,
  onReset,
  className = "",
  isMobileOpen = false,
  onCloseMobile,
}: ProductFiltersProps) {
  const [minPriceInput, setMinPriceInput] = React.useState(
    selectedParams.minPrice?.toString() || ""
  );
  const [maxPriceInput, setMaxPriceInput] = React.useState(
    selectedParams.maxPrice?.toString() || ""
  );

  React.useEffect(() => {
    setMinPriceInput(selectedParams.minPrice?.toString() || "");
    setMaxPriceInput(selectedParams.maxPrice?.toString() || "");
  }, [selectedParams.minPrice, selectedParams.maxPrice]);

  function handlePriceApply(e: React.FormEvent) {
    e.preventDefault();
    onChange({
      minPrice: minPriceInput ? Number(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined,
      page: 1,
    });
  }

  function handleBrandToggle(brand: string) {
    if (selectedParams.brand === brand) {
      onChange({ brand: undefined, page: 1 });
    } else {
      onChange({ brand, page: 1 });
    }
  }

  function handleFireClassToggle(fc: string) {
    if (selectedParams.fireClass === fc) {
      onChange({ fireClass: undefined, page: 1 });
    } else {
      onChange({ fireClass: fc, page: 1 });
    }
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand" />
          <h2 className="font-semibold text-sm text-ink uppercase tracking-wider">Filters</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-steel hover:text-brand flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Categories */}
      {filterOptions?.categories && filterOptions.categories.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70 mb-2.5">Category</h3>
          <div className="space-y-1 text-sm">
            <button
              onClick={() => onChange({ category: undefined, page: 1 })}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                !selectedParams.category
                  ? "bg-brand text-white font-medium"
                  : "text-ink/80 hover:bg-black/5"
              }`}
            >
              All Categories
            </button>
            {filterOptions.categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onChange({ category: cat.slug, page: 1 })}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                  selectedParams.category === cat.slug
                    ? "bg-brand text-white font-medium"
                    : "text-ink/80 hover:bg-black/5"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70 mb-2.5">
          Price Range (₹)
        </h3>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-black/10 rounded text-xs focus:border-brand outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-black/10 rounded text-xs focus:border-brand outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-paper hover:bg-gray-200 border border-black/10 text-ink text-xs font-medium rounded transition-colors"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Fire Classes */}
      {filterOptions?.fireClasses && filterOptions.fireClasses.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70 mb-2.5">
            Fire Hazard Class
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.fireClasses.map((fc) => (
              <button
                key={fc}
                type="button"
                onClick={() => handleFireClassToggle(fc)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  selectedParams.fireClass === fc
                    ? "bg-brand text-white font-semibold shadow-sm"
                    : "bg-paper text-ink/70 hover:bg-black/5 border border-black/10"
                }`}
              >
                {fc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {filterOptions?.brands && filterOptions.brands.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70 mb-2.5">Brand</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {filterOptions.brands.map((b) => (
              <label
                key={b}
                className="flex items-center gap-2 text-xs text-ink/80 cursor-pointer hover:text-ink"
              >
                <input
                  type="checkbox"
                  checked={selectedParams.brand === b}
                  onChange={() => handleBrandToggle(b)}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-black/10">
        <label className="flex items-center justify-between text-xs text-ink font-medium cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={selectedParams.inStock === true}
            onChange={(e) => onChange({ inStock: e.target.checked || undefined, page: 1 })}
            className="rounded border-gray-300 text-brand focus:ring-brand"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block w-64 shrink-0 bg-white p-5 rounded-lg border border-black/10 h-fit ${className}`}>
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white p-5 overflow-y-auto shadow-2xl z-10 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10">
              <span className="font-bold text-base">Filter Catalog</span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-steel hover:text-ink rounded"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">{content}</div>
            <div className="pt-4 border-t border-black/10 mt-6">
              <button
                onClick={onCloseMobile}
                className="w-full py-2.5 bg-brand text-white font-semibold text-sm rounded shadow-sm hover:bg-brand-dark"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
