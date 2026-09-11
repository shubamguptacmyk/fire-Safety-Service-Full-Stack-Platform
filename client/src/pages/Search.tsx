import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { blogService } from "@/services/blogService";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import {
  Search as SearchIcon,
  ArrowLeft,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;
  const [activeTab, setActiveTab] = useState<"products" | "articles">("products");

  // Save to recent searches
  useEffect(() => {
    if (query.trim()) {
      try {
        const existing = JSON.parse(localStorage.getItem("ak_recent_searches") || "[]");
        const updated = [
          query.trim(),
          ...existing.filter((t: string) => t.toLowerCase() !== query.trim().toLowerCase()),
        ].slice(0, 6);
        localStorage.setItem("ak_recent_searches", JSON.stringify(updated));
      } catch {
        /* ignore */
      }
    }
  }, [query]);

  // Product Query
  const { data: productData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["search-products", query, page],
    queryFn: () => productService.getProducts({ search: query, page, limit: 12 }),
    enabled: Boolean(query.trim()),
  });

  // Blog Query
  const { data: blogData, isLoading: isBlogsLoading } = useQuery({
    queryKey: ["search-blogs", query],
    queryFn: () => blogService.getPublishedPosts({ search: query, limit: 6 }),
    enabled: Boolean(query.trim()),
  });

  function handlePageChange(newPage: number) {
    const sp = new URLSearchParams(searchParams);
    sp.set("page", newPage.toString());
    setSearchParams(sp);
  }

  const products = productData?.products || [];
  const totalProducts = productData?.meta?.total || 0;
  const totalProductPages = productData?.meta?.totalPages || 1;

  const articles = blogData?.items || [];
  const totalArticles = blogData?.total || 0;

  return (
    <>
      <Seo
        title={`Search results for "${query}" — AK Fire Safety Service`}
        description={`Search results for fire safety equipment, extinguishers, and compliance articles matching "${query}".`}
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs text-steel hover:text-brand font-medium mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Full Catalog
          </Link>
          <div className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-brand" />
            <h1 className="text-xl sm:text-2xl font-display font-bold text-ink">
              Search Results for <span className="text-brand">&ldquo;{query}&rdquo;</span>
            </h1>
          </div>
          <p className="text-xs text-steel mt-1">
            Found <strong className="text-ink">{totalProducts}</strong> equipment item(s) and{" "}
            <strong className="text-ink">{totalArticles}</strong> technical guide(s)
          </p>

          {/* Search Result Tabs */}
          <div className="flex gap-4 mt-5 border-b border-black/10">
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-2.5 text-xs font-bold tracking-wide uppercase transition-colors relative ${
                activeTab === "products"
                  ? "text-brand border-b-2 border-brand"
                  : "text-steel hover:text-ink"
              }`}
            >
              Catalog Equipment ({totalProducts})
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={`pb-2.5 text-xs font-bold tracking-wide uppercase transition-colors relative flex items-center gap-1.5 ${
                activeTab === "articles"
                  ? "text-brand border-b-2 border-brand"
                  : "text-steel hover:text-ink"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Safety Guides & Articles ({totalArticles})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "products" ? (
          isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 bg-white border border-black/10 rounded-lg p-4 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-40 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center bg-white border border-black/10 rounded-xl max-w-md mx-auto">
              <PackageOpen className="w-12 h-12 text-steel/40 mx-auto mb-3" />
              <h2 className="font-display font-semibold text-lg text-ink">No Products Found</h2>
              <p className="text-steel text-xs sm:text-sm mt-1">
                We couldn&apos;t find any equipment matching &ldquo;{query}&rdquo;. Check spelling or try
                general terms like &ldquo;ABC&rdquo;, &ldquo;CO2&rdquo;, or &ldquo;Hydrant&rdquo;.
              </p>
              {totalArticles > 0 && (
                <button
                  onClick={() => setActiveTab("articles")}
                  className="mt-4 inline-block px-4 py-2 bg-paper hover:bg-gray-200 border border-black/10 text-ink text-xs font-semibold rounded-lg transition-colors"
                >
                  View {totalArticles} Related Safety Guides
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalProductPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 border border-black/10 rounded bg-white text-ink text-xs disabled:opacity-40 hover:bg-paper"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalProductPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 rounded text-xs font-semibold ${
                        i + 1 === page
                          ? "bg-brand text-white"
                          : "bg-white border border-black/10 text-ink hover:bg-paper"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalProductPages}
                    className="p-2 border border-black/10 rounded bg-white text-ink text-xs disabled:opacity-40 hover:bg-paper"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )
        ) : (
          /* Articles Tab View */
          isBlogsLoading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" />
              <p className="text-xs text-steel">Searching technical resources...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-16 text-center bg-white border border-black/10 rounded-xl max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-steel/40 mx-auto mb-3" />
              <h2 className="font-display font-semibold text-lg text-ink">No Articles Found</h2>
              <p className="text-steel text-xs sm:text-sm mt-1">
                No safety guides or articles matched &ldquo;{query}&rdquo;.
              </p>
              <Link
                to="/blog"
                className="mt-4 inline-block px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-dark"
              >
                Browse All Safety Guides
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => (
                <article
                  key={art._id}
                  className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="aspect-[16/10] bg-paper overflow-hidden relative">
                    <img
                      src={art.featuredImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-steel mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {art.publishedAt
                            ? new Date(art.publishedAt).toLocaleDateString("en-IN")
                            : "Published"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {art.readTime || 5} min read
                        </span>
                      </div>

                      <Link to={`/blog/${art.slug}`} className="block">
                        <h3 className="font-display font-bold text-base text-ink group-hover:text-brand transition-colors leading-snug">
                          {art.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-steel mt-2 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/10">
                      <Link
                        to={`/blog/${art.slug}`}
                        className="text-xs font-bold text-brand hover:text-brand-dark inline-flex items-center gap-1"
                      >
                        Read Article <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </main>
    </>
  );
}
