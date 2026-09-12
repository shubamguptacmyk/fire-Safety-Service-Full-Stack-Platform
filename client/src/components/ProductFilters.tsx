import React from "react";
import { FilterOptions, ProductQueryParams } from "@/types";
import { Filter, X, RotateCcw, Check } from "lucide-react";
import Button from "./ui/Button";

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

  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

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
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-700" />
          <h3 className="font-bold text-sm font-display text-dark uppercase tracking-wider">
            Filter Catalog
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-primary-700 flex items-center gap-1 transition-colors font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Categories */}
      {filterOptions?.categories && filterOptions.categories.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Equipment Category
          </h4>
          <div className="space-y-1">
            <button
              onClick={() => onChange({ category: undefined, page: 1 })}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                !selectedParams.category
                  ? "bg-primary-700 text-white shadow-2xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>All Categories</span>
              {!selectedParams.category && <Check className="w-3.5 h-3.5" />}
            </button>
            {filterOptions.categories.map((cat) => {
              const isSelected = selectedParams.category === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onChange({ category: cat.slug, page: 1 })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-primary-700 text-white shadow-2xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Price Range (₹)
        </h4>
        <form onSubmit={handlePriceApply} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              min="0"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-dark placeholder:text-slate-400 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-colors"
            />
            <input
              type="number"
              placeholder="Max ₹"
              min="0"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-dark placeholder:text-slate-400 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-dark font-bold text-xs rounded-lg transition-colors border border-slate-200"
          >
            Apply Price Filter
          </button>
        </form>
      </div>

      {/* Fire Classes */}
      {filterOptions?.fireClasses && filterOptions.fireClasses.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Fire Hazard Class
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.fireClasses.map((fc) => {
              const isSelected = selectedParams.fireClass === fc;
              return (
                <button
                  key={fc}
                  type="button"
                  onClick={() => handleFireClassToggle(fc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  Class {fc}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands */}
      {filterOptions?.brands && filterOptions.brands.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Manufacturer / Brand
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {filterOptions.brands.map((b) => (
              <label
                key={b}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-dark font-medium"
              >
                <input
                  type="checkbox"
                  checked={selectedParams.brand === b}
                  onChange={() => handleBrandToggle(b)}
                  className="rounded border-slate-300 text-primary-700 focus:ring-primary-600 w-4 h-4"
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* In-Stock Toggle */}
      <div className="pt-3 border-t border-slate-200">
        <label className="flex items-center justify-between text-xs text-dark font-semibold cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={selectedParams.inStock === true}
            onChange={(e) => onChange({ inStock: e.target.checked || undefined, page: 1 })}
            className="rounded border-slate-300 text-primary-700 focus:ring-primary-600 w-4 h-4"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block w-64 shrink-0 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card h-fit ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          <div
            className="fixed inset-0 bg-dark/60 backdrop-blur-2xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative ml-auto w-full max-w-xs sm:w-80 h-full bg-white p-4 sm:p-6 overflow-y-auto shadow-2xl z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
                <span className="font-bold text-base font-display text-dark">Filter Equipment</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 text-slate-400 hover:text-dark hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>{content}</div>
            </div>

            <div className="pt-6 border-t border-slate-200 mt-6">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={onCloseMobile}
              >
                Apply Filters &amp; View Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
