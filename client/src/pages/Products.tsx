import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { ProductQueryParams } from "@/types";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import PromoBanner from "@/components/PromoBanner";
import Seo from "@/components/Seo";
import { SlidersHorizontal, PackageOpen, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function Products() {
  const { category: categoryParam } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Parse state from URL params
  const initialParams: ProductQueryParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    category: categoryParam || searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    fireClass: searchParams.get("fireClass") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
    sort: (searchParams.get("sort") as any) || "newest",
    search: searchParams.get("search") || undefined,
  };

  const [filters, setFilters] = useState<ProductQueryParams>(initialParams);

  // Sync when route param changes (e.g. /products/fire-extinguishers)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryParam || undefined,
      page: 1,
    }));
  }, [categoryParam]);

  // Fetch products with React Query
  const {
    data: productData,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
  });

  // Fetch filter options (categories, brands, fireClasses, etc.)
  const { data: filterOptions } = useQuery({
    queryKey: ["product-filter-options"],
    queryFn: () => productService.getFilterOptions(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch active category details if browsing by category
  const { data: currentCategory } = useQuery({
    queryKey: ["category-detail", categoryParam],
    queryFn: () => (categoryParam ? categoryService.getBySlug(categoryParam) : null),
    enabled: Boolean(categoryParam),
  });

  function handleFilterChange(newValues: Partial<ProductQueryParams>) {
    setFilters((prev) => {
      const next = { ...prev, ...newValues };
      // Sync to URL search params
      const sp = new URLSearchParams();
      if (next.page && next.page > 1) sp.set("page", next.page.toString());
      if (next.brand) sp.set("brand", next.brand);
      if (next.fireClass) sp.set("fireClass", next.fireClass);
      if (next.minPrice !== undefined) sp.set("minPrice", next.minPrice.toString());
      if (next.maxPrice !== undefined) sp.set("maxPrice", next.maxPrice.toString());
      if (next.inStock) sp.set("inStock", "true");
      if (next.sort && next.sort !== "newest") sp.set("sort", next.sort);
      if (next.search) sp.set("search", next.search);
      setSearchParams(sp, { replace: true });
      return next;
    });
  }

  function handleResetFilters() {
    const resetValues: ProductQueryParams = {
      page: 1,
      limit: 12,
      category: categoryParam || undefined,
      sort: "newest",
    };
    setFilters(resetValues);
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  const page = productData?.meta?.page || 1;
  const totalPages = productData?.meta?.totalPages || 1;
  const total = productData?.meta?.total || 0;

  const pageTitle = currentCategory
    ? `${currentCategory.name} — AK Fire Safety Service`
    : "Fire Safety Equipment & Products Catalog — AK Fire Safety";

  return (
    <>
      <Seo
        title={pageTitle}
        description={
          currentCategory?.description ||
          "Browse ISI-certified fire extinguishers, hydrant valves, smoke detectors, alarm panels, and fire suppression systems in Navi Mumbai."
        }
      />

      {/* Hero / Header Banner */}
      <section className="bg-ink text-white py-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-1">
            Navi Mumbai · Commercial & Industrial Fire Protection
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            {currentCategory ? currentCategory.name : "Product Catalog"}
          </h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            {currentCategory?.description ||
              "Explore our complete inventory of BIS-approved fire fighting equipment, suppression systems, and certified detection components."}
          </p>

          {/* Subcategories Pills */}
          {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {currentCategory.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() =>
                    handleFilterChange({
                      subcategory: filters.subcategory === sub.name ? undefined : sub.name,
                      page: 1,
                    })
                  }
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    filters.subcategory === sub.name
                      ? "bg-amber text-ink font-bold shadow-sm"
                      : "bg-white/10 hover:bg-white/20 text-white/90"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Optional Admin-controlled Category Banner */}
      <PromoBanner position="category_top" className="!py-4" />

      {/* Main Catalog Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-black/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-paper border border-black/10 rounded text-xs font-semibold text-ink"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand" /> Filters
            </button>
            <span className="text-xs sm:text-sm text-steel">
              Showing <strong className="text-ink">{productData?.products.length || 0}</strong> of{" "}
              <strong className="text-ink">{total}</strong> items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-steel font-medium">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sort || "newest"}
              onChange={(e) => handleFilterChange({ sort: e.target.value as any, page: 1 })}
              className="px-2.5 py-1.5 bg-white border border-black/10 rounded text-xs text-ink font-medium focus:border-brand outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="bestseller">Best Sellers</option>
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Layout: Sidebar Filters + Products Grid */}
        <div className="flex gap-8 items-start">
          <ProductFilters
            filterOptions={filterOptions}
            selectedParams={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            isMobileOpen={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
          />

          <div className="flex-1 min-w-0">
            {isProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-80 bg-white border border-black/10 rounded-lg p-4 animate-pulse flex flex-col justify-between"
                  >
                    <div className="w-full h-44 bg-slate-100 rounded" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded mt-4" />
                  </div>
                ))}
              </div>
            ) : isProductsError ? (
              <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg text-red-800">
                <p className="font-semibold text-sm">Failed to load products.</p>
                <button
                  onClick={() => handleFilterChange({})}
                  className="mt-2 text-xs font-semibold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            ) : productData?.products.length === 0 ? (
              <div className="p-12 text-center bg-white border border-black/10 rounded-lg">
                <PackageOpen className="w-12 h-12 text-steel/50 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-lg text-ink">No Products Found</h3>
                <p className="text-steel text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                  No fire safety equipment matches your selected filters or search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-dark transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {productData?.products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleFilterChange({ page: Math.max(1, page - 1) })}
                      disabled={page <= 1}
                      className="p-2 border border-black/10 rounded bg-white text-ink text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleFilterChange({ page: pageNum })}
                          className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                            pageNum === page
                              ? "bg-brand text-white"
                              : "bg-white border border-black/10 text-ink hover:bg-paper"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleFilterChange({ page: Math.min(totalPages, page + 1) })}
                      disabled={page >= totalPages}
                      className="p-2 border border-black/10 rounded bg-white text-ink text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
