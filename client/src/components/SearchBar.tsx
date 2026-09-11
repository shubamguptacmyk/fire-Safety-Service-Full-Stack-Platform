import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, X, Clock, ArrowRight, Sparkles } from "lucide-react";
import { productService } from "@/services/productService";
import { Product } from "@/types";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
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
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ak_recent_searches") || "[]");
      if (Array.isArray(saved)) setRecentSearches(saved.slice(0, 5));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  function saveRecentSearch(term: string) {
    if (!term.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem("ak_recent_searches") || "[]");
      const updated = [term.trim(), ...existing.filter((t: string) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      localStorage.setItem("ak_recent_searches", JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      /* ignore */
    }
  }

  function clearRecentSearches() {
    localStorage.removeItem("ak_recent_searches");
    setRecentSearches([]);
  }

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
        const data = await productService.getProducts({ search: query.trim(), limit: 5 });
        setResults(data.products || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(termToSearch?: string) {
    const finalTerm = (termToSearch || query).trim();
    if (!finalTerm) return;
    saveRecentSearch(finalTerm);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(finalTerm)}`);
  }

  function handleSelectProduct(slug: string, productName: string) {
    saveRecentSearch(productName);
    setIsOpen(false);
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
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search fire safety products and resources"
          className="w-full bg-white/10 hover:bg-white/15 focus:bg-white focus:text-ink text-white placeholder-white/60 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-lg border border-white/20 focus:border-brand focus:outline-none transition-all shadow-inner"
        />
        <Search className="absolute left-2.5 w-4 h-4 text-white/60 pointer-events-none" />
        {isLoading ? (
          <Loader2 className="absolute right-2.5 w-4 h-4 text-white/70 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-white/60 hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </form>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-ink rounded-xl shadow-2xl border border-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 text-xs">
          {/* Query Results */}
          {query.trim().length >= 2 ? (
            results.length > 0 ? (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-steel uppercase tracking-wider border-b border-black/5 flex justify-between items-center bg-paper">
                  <span>Matching Catalog Equipment</span>
                  <span className="text-brand cursor-pointer hover:underline" onClick={() => handleSearchSubmit()}>
                    Press Enter to view all
                  </span>
                </div>
                {results.map((product, idx) => {
                  const imgUrl =
                    product.images?.find((i) => i.isPrimary)?.url ||
                    product.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=100&q=80";

                  const isSelected = selectedIndex === idx;

                  return (
                    <button
                      key={product._id}
                      onClick={() => handleSelectProduct(product.slug, product.name)}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors border-b border-black/5 last:border-0 ${
                        isSelected ? "bg-brand/10 text-brand" : "hover:bg-paper"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-black/5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-steel">
                          <span>{product.brand}</span>
                          <span>•</span>
                          <span>{product.SKU}</span>
                        </div>
                      </div>
                      <span className="font-bold text-ink shrink-0">
                        ₹{(product.discountPrice || product.price).toLocaleString("en-IN")}
                      </span>
                    </button>
                  );
                })}
                <button
                  onClick={() => handleSearchSubmit()}
                  className="w-full text-center py-2 font-bold text-brand hover:bg-brand/5 border-t border-black/5 transition-colors flex items-center justify-center gap-1"
                >
                  View all search results for &ldquo;{query}&rdquo; <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : !isLoading ? (
              <div className="p-4 text-center text-steel">
                No matching equipment for &ldquo;{query}&rdquo;.
                <button
                  onClick={() => handleSearchSubmit()}
                  className="block mx-auto mt-2 text-brand font-bold underline"
                >
                  Search guides & articles instead
                </button>
              </div>
            ) : null
          ) : (
            /* Blank state: show Recent Searches & Popular Suggestions */
            <div className="p-3 space-y-3">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-steel uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-steel hover:text-red-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          handleSearchSubmit(term);
                        }}
                        className="px-2.5 py-1 rounded bg-paper hover:bg-gray-200 text-ink text-xs transition-colors flex items-center gap-1"
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-steel uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber" /> Popular Topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SUGGESTIONS.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        handleSearchSubmit(term);
                      }}
                      className="px-2.5 py-1 rounded bg-brand/5 hover:bg-brand/15 text-brand text-xs font-semibold transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
