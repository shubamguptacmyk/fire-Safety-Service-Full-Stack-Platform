import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { bannerService } from "@/services/bannerService";
import { ProductQueryParams } from "@/types";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";
import { ProductCardSkeleton } from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import { SlidersHorizontal, PackageOpen, ArrowRight, ShieldCheck } from "lucide-react";

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

  // Fetch products
  const {
    data: productData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
  });

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["product-filter-options"],
    queryFn: () => productService.getFilterOptions(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch active category details
  const { data: currentCategory } = useQuery({
    queryKey: ["category-detail", categoryParam],
    queryFn: () => (categoryParam ? categoryService.getBySlug(categoryParam) : null),
    enabled: Boolean(categoryParam),
  });

  // Fetch dynamic category top banner
  const { data: categoryBanners } = useQuery({
    queryKey: ["category-banners"],
    queryFn: () => bannerService.getActiveBanners("category_top"),
    staleTime: 5 * 60 * 1000,
  });
  const categoryTopBanner = categoryBanners?.[0];

  function handleFilterChange(newValues: Partial<ProductQueryParams>) {
    setFilters((prev) => {
      const next = { ...prev, ...newValues };
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
    ? `${currentCategory.name} — Shubam Fire Protection`
    : "Industrial Fire Safety Equipment Catalog — Shubam Fire Protection";

  return (
    <>
      <Seo
        title={pageTitle}
        description={
          currentCategory?.description ||
          "Explore ISI-certified fire extinguishers, hydrant valves, smoke detectors, alarm panels, and automatic suppression systems by Shubam Fire Protection."
        }
      />

      {/* Header Banner */}
      <section className="bg-dark text-white py-10 sm:py-12 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-700/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: "Products", href: "/products" },
                ...(currentCategory ? [{ label: currentCategory.name }] : []),
              ]}
              className="text-slate-400"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>BIS ISI &bull; IS 15683 &amp; IS 2190 Certified</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                {currentCategory ? currentCategory.name : "Fire Safety Equipment Catalog"}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                {currentCategory?.description ||
                  "Direct manufacturer distribution of ISI-marked extinguishers, hydrant systems, clean agent gas suppression, and emergency detection gear."}
              </p>
            </div>

            <div className="shrink-0">
              <Link to="/request-quote">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Request Bulk Quote
                </Button>
              </Link>
            </div>
          </div>

          {/* Subcategories Pills */}
          {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800">
              {currentCategory.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() =>
                    handleFilterChange({
                      subcategory: filters.subcategory === sub.name ? undefined : sub.name,
                      page: 1,
                    })
                  }
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
                    filters.subcategory === sub.name
                      ? "bg-primary-700 text-white shadow-xs"
                      : "bg-white/10 hover:bg-white/20 text-slate-300"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Category Top Banner if present */}
      {categoryTopBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="relative rounded-2xl overflow-hidden shadow-card border border-slate-200 aspect-[21/6] group">
            <img
              src={categoryTopBanner.image}
              alt={categoryTopBanner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/40 to-transparent flex flex-col justify-center p-6 sm:p-10 text-white max-w-lg">
              <span className="text-[10px] uppercase tracking-wider text-orange-400 font-bold mb-1">
                Special Catalog Notice
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display leading-tight">
                {categoryTopBanner.title}
              </h3>
              {categoryTopBanner.subtitle && (
                <p className="text-slate-300 text-xs mt-1 line-clamp-2">
                  {categoryTopBanner.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-8 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-dark shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary-700" />
              <span>Filters</span>
            </button>
            <span className="text-xs sm:text-sm text-slate-500">
              Showing <strong className="text-dark font-bold">{productData?.products.length || 0}</strong> of{" "}
              <strong className="text-dark font-bold">{total}</strong> certified items
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="sort-select" className="text-xs text-slate-500 font-semibold">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sort || "newest"}
              onChange={(e) => handleFilterChange({ sort: e.target.value as any, page: 1 })}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-dark font-semibold focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none shadow-2xs transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="bestseller">Best Sellers</option>
              <option value="featured">Featured Gear</option>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : isProductsError ? (
              <ErrorState
                title="Failed to Load Products"
                message="We encountered an issue loading safety equipment. Please try again."
                onRetry={() => refetchProducts()}
              />
            ) : productData?.products.length === 0 ? (
              <EmptyState
                icon={<PackageOpen className="w-10 h-10 text-slate-400" />}
                title="No Products Match Your Criteria"
                description="Try clearing some of your selected filters, adjusting the price range, or searching with broader keywords."
                action={
                  <Button variant="primary" size="sm" onClick={handleResetFilters}>
                    Reset All Filters
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productData?.products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-12">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => handleFilterChange({ page: p })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
