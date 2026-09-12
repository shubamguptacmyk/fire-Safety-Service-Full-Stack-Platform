import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, X, Clock, ArrowRight, Sparkles, ArrowLeft, Tag } from "lucide-react";
import { productService } from "@/services/productService";
import { Product } from "@/types";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  isMobileTrigger?: boolean;
}

const POPULAR_SUGGESTIONS = [
  "ABC Powder Extinguisher",
  "CO2 Fire Extinguisher",
  "Hydrant Landing Valve",
  "Clean Agent HFC",
  "Smoke Detector",
];

export default function SearchBar({
  className = "",
  placeholder = "Search equipment, SKU, IS standards...",
  isMobileTrigger = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dropdownAlign, setDropdownAlign] = useState<"left" | "right">("left");

  const containerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved =
        JSON.parse(localStorage.getItem("shubam_recent_searches") || "null") ||
        JSON.parse(localStorage.getItem("ak_recent_searches") || "[]");
      if (Array.isArray(saved)) setRecentSearches(saved.slice(0, 5));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  function saveRecentSearch(term: string) {
    if (!term.trim()) return;
    try {
      const existing =
        JSON.parse(localStorage.getItem("shubam_recent_searches") || "null") ||
        JSON.parse(localStorage.getItem("ak_recent_searches") || "[]");
      const updated = [
        term.trim(),
        ...existing.filter((t: string) => t.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 5);
      localStorage.setItem("shubam_recent_searches", JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      /* ignore */
    }
  }

  function clearRecentSearches() {
    localStorage.removeItem("shubam_recent_searches");
    localStorage.removeItem("ak_recent_searches");
    setRecentSearches([]);
  }

  // Adjust dropdown horizontal alignment based on viewport boundary
  const updateDropdownAlignment = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 560; // Max expected width
      if (rect.left + dropdownWidth > window.innerWidth - 16) {
        setDropdownAlign("right");
      } else {
        setDropdownAlign("left");
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownAlignment();
      window.addEventListener("resize", updateDropdownAlignment);
      return () => window.removeEventListener("resize", updateDropdownAlignment);
    }
  }, [isOpen, updateDropdownAlignment]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await productService.getProducts({ search: query.trim(), limit: 6 });
        setResults(data.products || []);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to dismiss desktop dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile search modal is open
  useEffect(() => {
    if (isMobileModalOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileModalOpen]);

  function handleSearchSubmit(termToSearch?: string) {
    const finalTerm = (termToSearch || query).trim();
    if (!finalTerm) return;
    saveRecentSearch(finalTerm);
    setIsOpen(false);
    setIsMobileModalOpen(false);
    navigate(`/search?q=${encodeURIComponent(finalTerm)}`);
  }

  function handleSelectProduct(slug: string, productName: string) {
    saveRecentSearch(productName);
    setIsOpen(false);
    setIsMobileModalOpen(false);
    setQuery("");
    navigate(`/product/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectProduct(results[selectedIndex].slug, results[selectedIndex].name);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setIsMobileModalOpen(false);
    }
  }

  // Determine if on mobile screen
  function handleInputFocus() {
    if (window.innerWidth < 768) {
      setIsMobileModalOpen(true);
    } else {
      setIsOpen(true);
    }
  }

  return (
    <>
      {/* Search Input Bar (Desktop & Inline Mobile) */}
      <div ref={containerRef} className={`relative ${className}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
          className="relative flex items-center w-full"
        >
          <input
            ref={desktopInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search fire safety products and resources"
            className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-dark placeholder:text-slate-400 text-xs sm:text-sm pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all shadow-2xs"
          />
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          {isLoading ? (
            <Loader2 className="absolute right-3 w-4 h-4 text-slate-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </form>

        {/* Desktop Search Dropdown Panel (Only visible md:) */}
        {isOpen && (
          <div
            className={`hidden md:block absolute top-full mt-2 w-[520px] lg:w-[580px] max-w-[calc(100vw-2rem)] bg-white text-dark rounded-2xl shadow-elevated border border-slate-200/95 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 text-xs ${
              dropdownAlign === "right" ? "right-0 left-auto" : "left-0 right-auto"
            }`}
          >
            {/* Query Results */}
            {query.trim().length >= 2 ? (
              results.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                    <span>Matching Safety Equipment ({results.length})</span>
                    <button
                      type="button"
                      className="text-primary-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      onClick={() => handleSearchSubmit()}
                    >
                      <span>View all &rarr;</span>
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {results.map((product, idx) => {
                      const imgUrl =
                        product.images?.find((i) => i.isPrimary)?.url ||
                        product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=100&q=80";

                      const isSelected = selectedIndex === idx;

                      return (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleSelectProduct(product.slug, product.name)}
                          className={`w-full px-4 py-3 flex items-center gap-3.5 text-left transition-colors ${
                            isSelected ? "bg-primary-50 text-primary-950" : "hover:bg-slate-50"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-semibold text-sm text-dark line-clamp-2 leading-snug">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span className="font-medium text-slate-600">{product.brand}</span>
                              <span>&bull;</span>
                              <span className="font-mono text-slate-400">SKU: {product.SKU}</span>
                              {product.capacity && (
                                <>
                                  <span>&bull;</span>
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                                    {product.capacity}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-sm text-dark font-display block">
                              ₹{(product.discountPrice || product.price).toLocaleString("en-IN")}
                            </span>
                            {product.discountPrice && (
                              <span className="text-[10px] text-slate-400 line-through block">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full text-center py-3 font-bold text-primary-700 hover:bg-primary-50/50 border-t border-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>View all results for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : !isLoading ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="text-sm font-semibold text-dark">
                    No safety equipment found for &ldquo;{query}&rdquo;.
                  </p>
                  <p className="text-xs text-slate-500">
                    Check spelling or try broader terms like &ldquo;ABC&rdquo;, &ldquo;CO2&rdquo;, or &ldquo;Hydrant&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="inline-flex items-center gap-1 mt-2 text-primary-700 font-bold text-xs hover:underline"
                  >
                    <span>Search guides, articles &amp; services instead</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null
            ) : (
              /* Blank state: show Structured Recent Searches & Popular Searches */
              <div className="p-4 space-y-5">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentSearches();
                        }}
                        className="text-slate-400 hover:text-red-600 transition-colors font-semibold"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            handleSearchSubmit(term);
                          }}
                          className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-between group text-left"
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-700 shrink-0" />
                            <span className="truncate">{term}</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular Searches
                  </div>
                  <div className="space-y-1">
                    {POPULAR_SUGGESTIONS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          handleSearchSubmit(term);
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-primary-50/70 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-between group text-left"
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-700 shrink-0" />
                          <span className="truncate">{term}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-Screen Mobile Search Overlay */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col md:hidden animate-in fade-in duration-150">
          {/* Mobile Search Header */}
          <div className="px-3 py-3 border-b border-slate-200 bg-white flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(false)}
              className="p-2 text-slate-600 hover:text-dark rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 active:bg-slate-100"
              aria-label="Back to page"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="relative flex-1 flex items-center"
            >
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search equipment, SKU, IS code..."
                className="w-full bg-slate-100 text-dark placeholder:text-slate-400 text-sm pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-primary-600 focus:bg-white outline-none"
              />
              <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              {isLoading ? (
                <Loader2 className="absolute right-3 w-4 h-4 text-slate-400 animate-spin" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </form>

            {query.trim() && (
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="px-3 py-2 text-xs font-bold text-primary-700 hover:text-primary-800 min-h-[44px] flex items-center shrink-0"
              >
                Search
              </button>
            )}
          </div>

          {/* Mobile Content Area (Full Available Width) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 space-y-4">
            {query.trim().length >= 2 ? (
              results.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                    <span>Matching Safety Equipment</span>
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="text-primary-700 font-semibold"
                    >
                      View all ({results.length}) &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {results.map((product) => {
                      const imgUrl =
                        product.images?.find((i) => i.isPrimary)?.url ||
                        product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=100&q=80";

                      return (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleSelectProduct(product.slug, product.name)}
                          className="w-full py-3.5 flex items-start gap-3.5 text-left border-b border-slate-100 last:border-0 active:bg-slate-50 min-h-[56px]"
                        >
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-14 h-14 object-contain rounded-xl bg-white p-1.5 border border-slate-200 shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0 pr-1">
                            <p className="font-bold text-sm text-dark leading-snug break-words">
                              {product.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="font-semibold text-slate-700">{product.brand}</span>
                              <span>&bull;</span>
                              <span className="font-mono text-[11px]">SKU: {product.SKU}</span>
                              {product.capacity && (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {product.capacity}
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 flex items-baseline gap-2">
                              <span className="font-extrabold text-sm text-dark font-display">
                                ₹{(product.discountPrice || product.price).toLocaleString("en-IN")}
                              </span>
                              {product.discountPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                  >
                    <span>View all matching results for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : !isLoading ? (
                <div className="py-12 text-center text-slate-500 space-y-3 px-4">
                  <p className="text-sm font-bold text-dark">
                    No equipment found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-slate-500">
                    Try searching for extinguisher types (ABC, CO2), services (AMC, Refill), or parts.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:underline"
                  >
                    <span>Search general safety articles &amp; guides</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null
            ) : (
              /* Mobile Blank State */
              <div className="space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-xs text-slate-400 hover:text-red-600 font-semibold p-1"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            handleSearchSubmit(term);
                          }}
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between text-left min-h-[44px] active:bg-slate-200"
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{term}</span>
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular Searches
                  </div>
                  <div className="space-y-1.5">
                    {POPULAR_SUGGESTIONS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          handleSearchSubmit(term);
                        }}
                        className="w-full px-3.5 py-3 rounded-xl bg-primary-50/60 hover:bg-primary-50 text-slate-900 text-xs font-semibold flex items-center justify-between text-left min-h-[44px] active:bg-primary-100"
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <Search className="w-4 h-4 text-primary-600 shrink-0" />
                          <span className="truncate">{term}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
