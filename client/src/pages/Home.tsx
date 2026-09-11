import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Bell,
  Wrench,
  ClipboardList,
  ArrowRight,
  Flame,
  CheckCircle2,
  Building2,
  Award,
  Star,
  FileCheck,
  Phone,
  FileSpreadsheet,
  ChevronDown,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Shield,
  Gauge,
  HelpCircle,
  Truck,
} from "lucide-react";
import Badge from "@/components/Badge";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import BannerCarousel from "@/components/BannerCarousel";
import PromoBanner from "@/components/PromoBanner";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { blogService } from "@/services/blogService";
import { faqService } from "@/services/faqService";
import { reviewService } from "@/services/reviewService";

const STATUTORY_PILLARS = [
  {
    icon: ShieldCheck,
    title: "IS 15683 & IS 2878 Certified",
    desc: "Every extinguisher and discharge valve is BIS stamped with genuine batch verification.",
  },
  {
    icon: FileCheck,
    title: "Biannual Form B Certification",
    desc: "Direct compliance submission assistance for municipal fire authorities under Maharashtra Fire Act.",
  },
  {
    icon: Gauge,
    title: "PESO Calibrated Hydro-Testing",
    desc: "Licensed hydrostatic pressure diagnostics up to 250 bar at our Turbhe workshop.",
  },
  {
    icon: Wrench,
    title: "2-Hour Emergency AMC Response",
    desc: "Technician vans stationed across Airoli, Vashi, Taloja, and Thane for rapid dispatch.",
  },
];

const WHY_CHOOSE_US = [
  {
    title: "Category 'A' Licensed Agency",
    desc: "Officially certified by the Directorate of Maharashtra Fire Services for execution of all classes of fire protection works.",
  },
  {
    title: "Over 500+ Corporate Clients",
    desc: "Trusted by IT parks in Airoli, petrochemical hubs in Taloja, and residential societies across Mumbai.",
  },
  {
    title: "Transparent B2B Invoicing",
    desc: "Instant GST invoices with complete HSN codes (8424) for 100% eligible Input Tax Credit (ITC).",
  },
  {
    title: "Digital Maintenance Records",
    desc: "Automated tracking of cylinder inspection dates, refill cycles, and Form B submission deadlines.",
  },
];

export default function Home() {
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 1. Fetch Categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  // 2. Fetch Featured & Best Selling Products
  const { data: featuredData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["home-featured-products"],
    queryFn: () => productService.getFeaturedAndBestSellers(),
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Real Reviews
  const { data: recentReviews = [] } = useQuery({
    queryKey: ["home-recent-reviews"],
    queryFn: () => reviewService.getRecentApprovedReviews(4),
    staleTime: 5 * 60 * 1000,
  });

  // 4. Fetch Real Blog Posts
  const { data: blogData } = useQuery({
    queryKey: ["home-blog-posts"],
    queryFn: () => blogService.getPublishedPosts({ limit: 3 }),
    staleTime: 10 * 60 * 1000,
  });
  const blogPosts = blogData?.items || [];

  // 5. Fetch Real FAQs
  const { data: faqs = [] } = useQuery({
    queryKey: ["home-faqs"],
    queryFn: () => faqService.getPublicFaqs(),
    staleTime: 15 * 60 * 1000,
  });

  return (
    <>
      <Seo
        title="AK Fire Safety Service — Fire Extinguishers, Hydrants, Suppression & AMC in Navi Mumbai"
        description="Navi Mumbai's premier Category 'A' licensed fire safety supplier and contractor. ISI fire extinguishers, automatic suppression systems, Form B certification, and commercial AMC."
      />

      {/* 1. Hero / Banner Carousel from Real Admin Database */}
      <BannerCarousel position="home_hero" />

      {/* 2. Statutory Pillars / Trust Bar */}
      <section className="bg-ink border-b border-white/10 text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATUTORY_PILLARS.map((p, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-amber shrink-0">
                  <p.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{p.title}</h4>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-snug">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Shop by Fire Safety Category */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand mb-1">
              <Flame className="w-3.5 h-3.5" /> Equipment Categories
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink tracking-tight">
              Certified Fire Protection Systems
            </h2>
            <p className="text-steel text-xs sm:text-sm mt-1 max-w-xl">
              Engineered according to Indian Standard codes and National Building Code (NBC Part IV) specifications.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand hover:text-brand-dark transition-colors shrink-0"
          >
            <span>Explore All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-44 bg-paper rounded-xl border border-black/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat._id}
                to={`/products/${cat.slug}`}
                className="group bg-white rounded-xl border border-black/10 p-4 hover:border-brand/40 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="aspect-square bg-paper rounded-lg mb-3 overflow-hidden flex items-center justify-center p-3 relative">
                  <img
                    src={
                      cat.image ||
                      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={cat.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80";
                    }}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {cat.productCount !== undefined && cat.productCount > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {cat.productCount} models
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink group-hover:text-brand transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-steel mt-0.5 line-clamp-2 leading-tight">
                    {cat.description || "Certified fire safety products conforming to BIS standards"}
                  </p>
                  <span className="text-[11px] text-brand font-semibold mt-2.5 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View equipment &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Best Selling / Popular Products */}
      {featuredData?.bestSellers && featuredData.bestSellers.length > 0 && (
        <section className="bg-paper py-16 border-y border-black/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand">Fast Moving Stock</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-0.5">
                  Best Selling Fire Protection Equipment
                </h2>
                <p className="text-steel text-xs sm:text-sm mt-0.5">
                  High-demand industrial extinguishers, hydrant accessories, and alarm panels with ready inventory.
                </p>
              </div>
              <Link
                to="/products?sort=bestseller"
                className="text-xs sm:text-sm font-bold text-brand hover:text-brand-dark flex items-center gap-1 shrink-0"
              >
                See All Best Sellers <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-80 bg-white rounded-xl border border-black/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredData.bestSellers.slice(0, 4).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Promotional Banner from Backend (Position: 'home_middle' or 'deals') */}
      <PromoBanner position="home_middle" />

      {/* 6. Featured Products Section */}
      {featuredData?.featured && featuredData.featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">Industrial Grade</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-0.5">
                Featured Engineered Systems
              </h2>
              <p className="text-steel text-xs sm:text-sm mt-0.5">
                Heavy-duty commercial fire fighting equipment recommended by licensed safety auditors.
              </p>
            </div>
            <Link
              to="/products?isFeatured=true"
              className="text-xs sm:text-sm font-bold text-brand hover:text-brand-dark flex items-center gap-1 shrink-0"
            >
              View Featured Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-80 bg-white rounded-xl border border-black/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredData.featured.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 7. Comprehensive Fire Safety Services Grid */}
      <section className="bg-ink text-white py-16 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-amber">
                Licensed Field Engineering
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold mt-1 text-white">
                Turnkey Fire Safety Contracting &amp; Testing
              </h2>
              <p className="text-white/70 text-xs sm:text-sm mt-2 leading-relaxed">
                Category &lsquo;A&rsquo; certified engineers and equipped service vans delivering prompt on-site
                inspections, pressure diagnostics, and Form B statutory filings across Navi Mumbai.
              </p>
            </div>
            <Link
              to="/book-service"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow transition-colors shrink-0"
            >
              <Wrench className="w-4 h-4" /> Book Technician Visit
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                href: "/services/amc",
                badge: "Statutory Mandate",
                title: "Annual Maintenance Contracts (AMC)",
                desc: "Quarterly preventative maintenance, pump room test runs, and Form B compliance filings for housing societies and commercial towers.",
              },
              {
                href: "/services/refilling",
                badge: "On-Site & Workshop",
                title: "Cylinder Refilling & Hydro-Testing",
                desc: "Certified refilling with pure MAP-50 powder and CO2 gas, backed by PESO-approved 250 bar hydraulic pressure test certificates.",
              },
              {
                href: "/services/fire-safety-audit",
                badge: "Licensed Audit",
                title: "Comprehensive Fire Safety Audits",
                desc: "Full structural audit analyzing egress routes, passive containment, detection coverage, and compliance with Maharashtra Fire Act.",
              },
              {
                href: "/services/installation",
                badge: "Turnkey Contracting",
                title: "FM-200 & Hydrant Installations",
                desc: "Complete layout design, wet riser plumbing, jockey pump setups, and automatic clean agent flooding for server rooms and factories.",
              },
              {
                href: "/services/inspection",
                badge: "Diagnostic Testing",
                title: "Smoke Detector & Alarm Testing",
                desc: "Functional testing of addressable panels, beam detectors, manual call points, and integration with emergency PA systems.",
              },
              {
                href: "/request-quote",
                badge: "B2B Procurement",
                title: "B2B Project RFQ & Estimations",
                desc: "Upload equipment bill of quantities (BOQ) or blueprint specifications for guaranteed commercial quote dispatch within 2 hours.",
              },
            ].map((s, idx) => (
              <Link
                key={idx}
                to={s.href}
                className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:border-amber/60 hover:bg-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber bg-amber/10 border border-amber/20 px-2 py-0.5 rounded mb-3">
                    {s.badge}
                  </span>
                  <h3 className="font-bold text-base text-white group-hover:text-amber transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">{s.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber font-semibold">
                  <span>Explore service specifications</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Statutory AMC & Form B Compliance Section */}
      <section className="py-16 bg-white border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-4">
                <FileCheck className="w-4 h-4" /> Maharashtra Fire Safety Act Compliance
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight leading-tight">
                Mandatory Bi-Annual Form B Certification for Navi Mumbai Buildings
              </h2>
              <p className="mt-3 text-steel text-sm leading-relaxed">
                Under Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act, all commercial
                premises, factories, and housing societies must submit Form B twice a year (January &amp; July) to the
                local Fire Prevention Wing.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-safe shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-ink block">Category 'A' Licensed Sign-Off</strong>
                    <span className="text-xs text-steel">Official testing and digital certificate recognized by NMMC, CIDCO, and MIDC fire departments.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-safe shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-ink block">Quarterly Scheduled System Runs</strong>
                    <span className="text-xs text-steel">We test jockey pumps, main hydrants, sprinkler loops, and hose reels to ensure 100% operational readiness.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-safe shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-ink block">Zero Penalty Guarantee</strong>
                    <span className="text-xs text-steel">Automatic compliance alerts and timely inspection scheduling eliminate municipal non-compliance notices.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/services/amc"
                  className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-lg font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2"
                >
                  View AMC Packages &rarr;
                </Link>
                <Link
                  to="/request-quote"
                  className="px-6 py-3 bg-paper hover:bg-gray-200 text-ink border border-black/10 rounded-lg font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-brand" /> Get Form B Proposal
                </Link>
              </div>
            </div>

            <div className="bg-paper rounded-2xl border border-black/10 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <h4 className="font-display font-bold text-lg text-ink">Form B Bi-Annual Cycle</h4>
                  <p className="text-[11px] text-steel">Statutory timelines for commercial &amp; high-rise buildings</p>
                </div>
                <span className="px-2.5 py-1 bg-amber/20 text-ink rounded font-mono font-bold text-xs">
                  2026 Season
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-black/10 flex items-start gap-3.5">
                  <div className="p-2 rounded bg-red-50 text-brand font-bold text-xs shrink-0 text-center w-12">
                    JAN
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-ink">First Half Statutory Submission</h5>
                    <p className="text-[11px] text-steel mt-0.5">
                      Covers January 1st to June 30th. Physical verification of all extinguishers, hydrant risers, and alarm panels.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-black/10 flex items-start gap-3.5">
                  <div className="p-2 rounded bg-amber-50 text-amber font-bold text-xs shrink-0 text-center w-12">
                    JUL
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-ink">Second Half Statutory Submission</h5>
                    <p className="text-[11px] text-steel mt-0.5">
                      Covers July 1st to December 31st. Monsoon moisture inspection of electrical alarm wiring and sprinkler line pressure check.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-amber/30 text-xs text-steel">
                <p className="font-semibold text-ink flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-brand" /> Need Emergency Form B Filing?
                </p>
                Our engineering team issues fast-track reports following complete on-site compliance verification.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Why Choose Us / Company Credibility */}
      <section className="bg-paper py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">Corporate Credibility</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink mt-1">
              Why 500+ Facilities Rely On AK Fire Safety
            </h2>
            <p className="text-steel text-xs sm:text-sm mt-1">
              Providing end-to-end statutory fire engineering, equipment procurement, and maintenance services since 2003.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-black/10 p-6 hover:shadow-md hover:border-brand/40 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand font-display font-bold flex items-center justify-center text-base mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-sm text-ink mb-2">{item.title}</h3>
                <p className="text-xs text-steel leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Customer Reviews Section (Real Backend Data) */}
      {recentReviews.length > 0 && (
        <section className="bg-white py-16 border-y border-black/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand">Client Feedback</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-0.5">
                  Verified Client Reviews &amp; Testimonials
                </h2>
                <p className="text-steel text-xs sm:text-sm mt-0.5">
                  Real feedback from commercial facility managers, plant safety heads, and housing society secretaries.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-amber text-xs font-bold shrink-0">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                  ))}
                </div>
                <span className="text-ink ml-1 font-mono">4.9 / 5.0</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentReviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-paper rounded-xl border border-black/10 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber mb-2">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber text-amber" />
                      ))}
                    </div>
                    <h4 className="font-bold text-xs text-ink line-clamp-1">{rev.title}</h4>
                    <p className="text-xs text-steel mt-1.5 line-clamp-3 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-ink block">{rev.userName}</span>
                      <span className="text-steel text-[10px]">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] bg-safe/10 text-safe font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. Blog & Fire Safety Knowledge Hub (Real Backend Data) */}
      {blogPosts.length > 0 && (
        <section className="py-16 bg-paper">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand">Safety Knowledge</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-0.5">
                  Articles, Compliance Norms &amp; Technical Guides
                </h2>
                <p className="text-steel text-xs sm:text-sm mt-0.5">
                  Stay updated with latest BIS standards, IS 2190 guidelines, and municipal compliance notifications.
                </p>
              </div>
              <Link
                to="/blog"
                className="text-xs sm:text-sm font-bold text-brand hover:text-brand-dark flex items-center gap-1 shrink-0"
              >
                Browse All Articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-black/10 overflow-hidden hover:shadow-lg hover:border-brand/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video bg-paper overflow-hidden">
                      <img
                        src={
                          post.featuredImage ||
                          "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[11px] text-steel mb-2">
                        <span className="bg-brand/10 text-brand font-semibold px-2 py-0.5 rounded">
                          {post.category}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime || 5} min read
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-steel mt-2 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs text-brand font-semibold">
                    <span>Read safety guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. FAQ Accordion (Real Backend Data) */}
      {faqs.length > 0 && (
        <section className="py-16 bg-white border-t border-black/10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-brand">Help &amp; Clarifications</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-0.5">
                Frequently Asked Fire Safety Questions
              </h2>
              <p className="text-steel text-xs sm:text-sm mt-1">
                Common queries regarding extinguisher refills, AMC scope, Form B compliance, and delivery timelines.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.slice(0, 6).map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq._id || idx}
                    className="border border-black/10 rounded-xl overflow-hidden transition-all bg-paper/50"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-ink hover:text-brand transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-brand shrink-0" />
                        <span>{faq.question}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-steel shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-brand" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs text-steel leading-relaxed border-t border-black/5 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/faq"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
              >
                View all frequently asked questions &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 13. Strong B2B CTA / Emergency Contact Section */}
      <section className="bg-gradient-to-r from-ink via-ink/95 to-ink text-white py-16 border-t border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-brand/10 skew-x-12 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="bg-white/5 border border-white/15 rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 backdrop-blur-sm">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber/20 border border-amber/40 text-amber text-xs font-bold uppercase mb-3">
                <Phone className="w-3.5 h-3.5" /> Rapid Engineering Helpdesk
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Require Form B Compliance or Fire Equipment Quotation?
              </h2>
              <p className="text-white/80 text-xs sm:text-sm mt-2 leading-relaxed">
                Connect directly with our licensed technical auditors in Navi Mumbai. We provide certified site inspections,
                formal tender proposals, and bulk GST equipment quotes within 2 business hours.
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber" />
                  <span><strong>Hotline:</strong> +91 98000 00000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber" />
                  <span><strong>Workshop:</strong> Turbhe MIDC, Navi Mumbai</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 w-full lg:w-auto">
              <Link
                to="/request-quote"
                className="px-6 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-xs shadow-lg shadow-brand/30 transition-all text-center inline-flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Request Official B2B Quote
              </Link>
              <Link
                to="/book-service"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-xs transition-colors text-center inline-flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4 text-amber" /> Book On-Site Inspection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
