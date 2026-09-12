import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogService, BlogPostItem } from "@/services/blogService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import TrustBadge from "@/components/ui/TrustBadge";
import Pagination from "@/components/ui/Pagination";
import {
  ArrowRight,
  Calendar,
  Clock,
  Search,
  BookOpen,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  image: string;
  author?: string;
}

export const FALLBACK_ARTICLES: Article[] = [
  {
    slug: "how-to-choose-fire-extinguisher",
    title: "How to Choose the Right Fire Extinguisher for Your Office or Society",
    category: "Buyer Guide",
    date: "August 20, 2024",
    readTime: "5 min read",
    summary:
      "A practical breakdown of ABC powder, CO2, clean agents, and foam cylinders to ensure your premises match local fire norms without overspending.",
    image:
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    author: "Engr. Rajesh Sawant",
  },
  {
    slug: "maharashtra-fire-act-form-b-guide",
    title: "Maharashtra Fire Act Form B Compliance: 2026 Checklist for Housing Societies",
    category: "Legal & Compliance",
    date: "August 12, 2024",
    readTime: "7 min read",
    summary:
      "Everything management committees need to know about the January & July statutory Form B filings with the Chief Fire Officer under Maharashtra Fire Safety Act.",
    image:
      "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80",
    author: "Adv. Meera Nair",
  },
  {
    slug: "fire-extinguisher-refill-and-hydrotest-guide",
    title: "Fire Extinguisher Refill & Hydrostatic Pressure Testing: Frequency & Safety Norms",
    category: "Maintenance",
    date: "July 28, 2024",
    readTime: "6 min read",
    summary:
      "Why discharging or aging extinguishers require pressure proof testing to 35 bar, and how to spot adulterated chemical powders.",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    author: "Technical Team — Shubam Fire",
  },
  {
    slug: "fire-safety-for-commercial-offices-factories",
    title: "Essential Fire Safety Protocol for High-Density Commercial Offices and Factories",
    category: "Safety Protocols",
    date: "July 15, 2024",
    readTime: "4 min read",
    summary:
      "Establishing clear escape paths, illuminated signage, emergency warden teams, and monthly inspection logbooks.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    author: "Capt. Arvind Patil",
  },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const categories = [
    "All",
    "Buyer Guide",
    "Legal & Compliance",
    "Maintenance",
    "Safety Protocols",
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: blogData, isLoading } = useQuery({
    queryKey: ["published-blogs", selectedCategory, debouncedSearch, page],
    queryFn: () =>
      blogService.getPublishedPosts({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        search: debouncedSearch || undefined,
        page,
        limit: 6,
      }),
  });

  const apiPosts = blogData?.items || [];
  const totalPages = blogData?.totalPages || 1;

  // Adapt items
  const articles: Article[] =
    apiPosts.length > 0
      ? apiPosts.map((p) => ({
          slug: p.slug,
          title: p.title,
          category: p.category,
          date: p.publishedAt
            ? new Date(p.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent",
          readTime: `${p.readTime || 5} min read`,
          summary: p.excerpt,
          image: p.featuredImage,
          author: p.author?.name || "Shubam Fire Technical Team",
        }))
      : FALLBACK_ARTICLES.filter((a) => {
          const matchCat = selectedCategory === "All" || a.category === selectedCategory;
          const matchSearch =
            !debouncedSearch ||
            a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.summary.toLowerCase().includes(debouncedSearch.toLowerCase());
          return matchCat && matchSearch;
        });

  const featured = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <>
      <Seo
        title="Fire Safety Blog & Engineering Knowledge Base — Shubam Fire Protection"
        description="Expert guides on fire extinguishers, NBC Part IV codes, Maharashtra Form B compliance, and industrial fire prevention standards."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Knowledge Base & Blog" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Fire Engineering & Regulatory Insights
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Fire Safety Knowledge Base & Technical Guides
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Practical advice, regulatory checklists, and engineering insights curated by licensed fire safety officers and technicians.
            </p>
          </div>
        </div>
      </section>

      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Search & Categories */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides (e.g. Form B, Hydro test, Refilling, Evacuation)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-2xl focus:border-primary-600 outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article Card */}
        {featured && page === 1 && !debouncedSearch && (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all grid lg:grid-cols-2 gap-0 group">
            <div className="relative aspect-16/9 lg:aspect-auto overflow-hidden bg-slate-100">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md">
                Featured Guide
              </span>
            </div>

            <div className="p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span className="font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md">
                    {featured.category}
                  </span>
                  <span>•</span>
                  <span>{featured.readTime}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 group-hover:text-primary-700 transition-colors leading-tight">
                  <Link to={`/blog/${featured.slug}`}>{featured.title}</Link>
                </h2>

                <p className="text-sm text-slate-600 mt-3.5 leading-relaxed">
                  {featured.summary}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">By {featured.author}</span>
                <Link
                  to={`/blog/${featured.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
                >
                  Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading safety articles...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(page === 1 && !debouncedSearch ? regularArticles : articles).map((article, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {article.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {article.readTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 font-display group-hover:text-primary-700 transition-colors leading-snug">
                      <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      {article.author}
                    </span>
                    <Link
                      to={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Read Guide <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </main>
    </>
  );
}
