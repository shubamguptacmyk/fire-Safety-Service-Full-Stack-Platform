import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { blogService } from "@/services/blogService";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import {
  Search as SearchIcon,
  ArrowLeft,
  PackageOpen,
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
        const existing = JSON.parse(
          localStorage.getItem("shubam_recent_searches") ||
            localStorage.getItem("ak_recent_searches") ||
            "[]"
        );
        const updated = [
          query.trim(),
          ...existing.filter((t: string) => t.toLowerCase() !== query.trim().toLowerCase()),
        ].slice(0, 6);
        localStorage.setItem("shubam_recent_searches", JSON.stringify(updated));
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
        title={`Search results for "${query}" — Shubam Fire Protection`}
        description={`Search results for fire safety equipment, extinguishers, and compliance articles matching "${query}".`}
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Catalog", href: "/products" },
              { label: `Search: "${query}"` },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="flex items-center gap-3">
            <SearchIcon className="w-6 h-6 text-primary-400" />
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Search Results for <span className="text-primary-400">&ldquo;{query}&rdquo;</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Found <strong className="text-white">{totalProducts}</strong> equipment item(s) and{" "}
            <strong className="text-white">{totalArticles}</strong> technical guide(s)
          </p>

          {/* Search Result Tabs */}
          <div className="flex gap-6 mt-6 border-b border-slate-800">
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-3 text-xs font-bold tracking-wide uppercase transition-all relative ${
                activeTab === "products"
                  ? "text-primary-400 border-b-2 border-primary-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Catalog Equipment ({totalProducts})
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={`pb-3 text-xs font-bold tracking-wide uppercase transition-all relative flex items-center gap-2 ${
                activeTab === "articles"
                  ? "text-primary-400 border-b-2 border-primary-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Safety Guides & Articles ({totalArticles})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {activeTab === "products" ? (
          isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-white border border-slate-200 rounded-3xl p-5 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-44 bg-slate-100 rounded-2xl" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-8 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No products match your search"
              description={`We couldn't find any equipment matching "${query}". Try searching "ABC", "CO2", "Clean Agent", or "Hydrant".`}
              actionText="View All Products"
              actionLink="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalProductPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={page}
                    totalPages={totalProductPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )
        ) : isBlogsLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Searching safety guides...</p>
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No technical articles found"
            description={`No safety guides or compliance articles matched "${query}".`}
            actionText="Browse Knowledge Base"
            actionLink="/blog"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <article
                key={art._id}
                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div className="aspect-16/10 bg-slate-100 overflow-hidden relative">
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {art.category}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />{" "}
                        {art.publishedAt
                          ? new Date(art.publishedAt).toLocaleDateString("en-IN")
                          : "Published"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {art.readTime || 5} min read
                      </span>
                    </div>

                    <Link to={`/blog/${art.slug}`} className="block">
                      <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-primary-700 transition-colors leading-snug">
                        {art.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to={`/blog/${art.slug}`}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                    >
                      Read Guide <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
