import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogService, BlogPostItem } from "@/services/blogService";
import Seo from "@/components/Seo";
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
    author: "Tech. Team AK Fire",
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

  const { data, isLoading } = useQuery({
    queryKey: ["public-blogs", selectedCategory, debouncedSearch, page],
    queryFn: () =>
      blogService.getPublishedPosts({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        search: debouncedSearch || undefined,
        page,
        limit: 9,
      }),
  });

  const apiArticles = data?.items || [];
  const totalPages = data?.totalPages || 1;

  // Transform articles to uniform structure
  const articles: Article[] =
    apiArticles.length > 0
      ? apiArticles.map((item) => ({
          slug: item.slug,
          title: item.title,
          category: item.category,
          date: item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recently Published",
          readTime: `${item.readTime || 5} min read`,
          summary: item.excerpt,
          image:
            item.featuredImage ||
            "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
          author: item.author?.name || "AK Fire Safety Team",
        }))
      : FALLBACK_ARTICLES.filter((a) => {
          const matchCat =
            selectedCategory === "All" || a.category === selectedCategory;
          const matchSearch =
            !debouncedSearch ||
            a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.summary.toLowerCase().includes(debouncedSearch.toLowerCase());
          return matchCat && matchSearch;
        });

  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <>
      <Seo
        title="Fire Safety Blog & Compliance Knowledge Base — AK Fire Safety"
        description="Authoritative guides on fire extinguisher selection, hydrostatic testing norms, and Maharashtra Form B compliance guidelines."
      />

      {/* Hero Header */}
      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber font-semibold">
            <BookOpen className="w-4 h-4" /> Technical Resources & Compliance Guides
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Fire Safety Guides & Compliance Insights
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-2xl leading-relaxed">
            Written by licensed fire safety engineers, ISO auditors, and certified equipment
            inspectors in Navi Mumbai to keep your building code-compliant and secure.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-md relative">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guides, Form B, extinguisher types, NBC codes..."
              className="w-full bg-white/10 border border-white/20 focus:border-amber rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/50 outline-none"
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-brand text-white shadow-sm"
                  : "bg-paper text-ink hover:bg-gray-200 border border-black/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
            <p className="text-xs text-steel">Loading fire safety knowledge articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-16 bg-white border border-black/10 rounded-xl text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-steel/40 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-ink">No Articles Found</h3>
            <p className="text-xs text-steel mt-1">
              No fire safety resources matched your search &ldquo;{debouncedSearch}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-dark"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Article Banner */}
            {featuredArticle && !debouncedSearch && page === 1 && (
              <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all grid lg:grid-cols-2 group">
                <div className="aspect-[16/10] lg:aspect-auto bg-paper overflow-hidden relative">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 24 24' fill='%23f5f5f5' stroke='%23C13B26' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' fill='%23faf8f5'/><path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'/></svg>";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber" /> Featured Guide
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-steel">
                      <span className="font-bold text-brand uppercase">{featuredArticle.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {featuredArticle.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {featuredArticle.readTime}
                      </span>
                    </div>

                    <Link to={`/blog/${featuredArticle.slug}`} className="block">
                      <h2 className="font-display font-bold text-2xl text-ink group-hover:text-brand transition-colors leading-snug">
                        {featuredArticle.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-steel leading-relaxed">
                      {featuredArticle.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between">
                    <span className="text-xs text-ink/80 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand" /> {featuredArticle.author}
                    </span>
                    <Link
                      to={`/blog/${featuredArticle.slug}`}
                      className="text-xs font-bold text-brand hover:text-brand-dark inline-flex items-center gap-1.5"
                    >
                      Read Full Guide <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of Other Articles */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(debouncedSearch || page > 1 ? articles : regularArticles).map((art) => (
                <article
                  key={art.slug}
                  className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="aspect-[16/9] bg-paper overflow-hidden relative">
                    <img
                      src={art.image}
                      alt={art.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350' viewBox='0 0 24 24' fill='%23f5f5f5' stroke='%23C13B26' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' fill='%23faf8f5'/><path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'/></svg>";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 text-[11px] text-steel mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {art.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {art.readTime}
                        </span>
                      </div>

                      <Link to={`/blog/${art.slug}`} className="block">
                        <h3 className="font-display font-bold text-base text-ink group-hover:text-brand transition-colors leading-snug">
                          {art.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-steel mt-2 leading-relaxed line-clamp-3">
                        {art.summary}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between">
                      <span className="text-[11px] text-steel truncate max-w-[150px]">
                        By {art.author}
                      </span>
                      <Link
                        to={`/blog/${art.slug}`}
                        className="text-xs font-bold text-brand hover:text-brand-dark inline-flex items-center gap-1"
                      >
                        Read More <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 border border-black/10 rounded bg-white text-ink text-xs disabled:opacity-40 hover:bg-paper"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 border border-black/10 rounded bg-white text-ink text-xs disabled:opacity-40 hover:bg-paper"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
