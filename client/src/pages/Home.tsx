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
  CheckCircle,
  Building2,
  Award,
} from "lucide-react";
import Badge from "@/components/Badge";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";

const FEATURES = [
  { icon: ShieldCheck, label: "ISI / IS-code certified stock", sub: "IS 15683 & IS 2878 compliant" },
  { icon: Bell, label: "Automatic refill due reminders", sub: "SMS/Email notifications on expiry" },
  { icon: Wrench, label: "Technician-led AMC visits", sub: "Periodic audit and refilling" },
  { icon: ClipboardList, label: "GST invoices & compliance", sub: "Form B compliance certification" },
];

export default function Home() {
  const { t } = useTranslation();

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch Featured & Best Selling Products
  const { data: featuredData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["home-featured-products"],
    queryFn: () => productService.getFeaturedAndBestSellers(),
  });

  return (
    <>
      <Seo
        title="AK Fire Safety Service — Fire Extinguishers, Hydrants, Suppression & AMC in Navi Mumbai"
        description="Navi Mumbai's premier fire safety equipment supplier and service provider. ISI-marked fire extinguishers, hydrant systems, gas suppression, and AMC maintenance."
      />

      {/* Hero Section */}
      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-transparent z-0" />
        <div className="max-w-6xl mx-auto px-4 py-16 relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge tone="amber">Navi Mumbai · Serving Maharashtra Since 2003</Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 leading-[1.05] tracking-tight">
              {t("home.heroTitle")}
            </h1>
            <p className="text-white/70 mt-4 max-w-lg text-sm sm:text-base leading-relaxed">
              Industrial-grade fire extinguishers, automatic suppression systems, hydrants, and
              certified AMC contracts engineered to safeguard your facility, staff, and compliance.
            </p>
            <div className="flex flex-wrap gap-3.5 mt-7">
              <Link
                to="/products"
                className="bg-brand hover:bg-brand-dark px-6 py-3 rounded-md font-semibold text-sm shadow-md transition-colors flex items-center gap-2"
              >
                Browse Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?inStock=true"
                className="border border-white/30 hover:border-white/70 px-6 py-3 rounded-md font-semibold text-sm transition-colors text-white"
              >
                Ready Stock Equipment
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm hover:border-amber/50 transition-colors"
              >
                <f.icon className="w-6 h-6 text-amber mb-2.5" aria-hidden="true" />
                <p className="text-sm font-semibold text-white/90 leading-snug">{f.label}</p>
                <p className="text-[11px] text-white/60 mt-1">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Categories</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
              Fire Safety Solutions
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              to={`/products/${cat.slug}`}
              className="group bg-white rounded-lg border border-black/10 p-4 hover:border-brand hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-square bg-paper rounded mb-3 overflow-hidden flex items-center justify-center p-3">
                <img
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-ink group-hover:text-brand transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-steel mt-0.5 line-clamp-2">
                  {cat.description || "Certified fire safety products"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="bg-paper py-14 border-y border-black/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Popular</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Best Selling Equipment
              </h2>
            </div>
            <Link
              to="/products?sort=bestseller"
              className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1"
            >
              See All Best Sellers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-72 bg-white rounded-lg border border-black/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredData?.bestSellers?.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Recommended</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
              Featured Industrial Gear
            </h2>
          </div>
          <Link
            to="/products?isFeatured=true"
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1"
          >
            Explore Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-72 bg-white rounded-lg border border-black/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredData?.featured?.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Services Showcase */}
      <section className="bg-ink text-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber">Maintenance & Testing</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">
              Complete On-Site Fire Safety Services
            </h2>
            <p className="text-white/70 text-sm mt-2">
              Our certified technicians service commercial towers, industrial plants, societies, and data hubs across Mumbai and Navi Mumbai.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "/services/amc",
                label: "Annual Maintenance (AMC)",
                desc: "Quarterly and bi-annual inspections with digital compliance certificates.",
              },
              {
                href: "/services/refilling",
                label: "Certified Cylinder Refilling",
                desc: "High-pressure gas refilling with hydrostatic pressure testing.",
              },
              {
                href: "/services/installation",
                label: "Hydrant & Suppression Installs",
                desc: "Turnkey FM-200 gas flooding, wet risers, and detection loop setups.",
              },
              {
                href: "/services/fire-safety-audit",
                label: "Building Fire Safety Audits",
                desc: "Comprehensive safety audits conforming to Maharashtra Fire Prevention norms.",
              },
            ].map((s) => (
              <Link
                key={s.href}
                to={s.href}
                className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-amber hover:bg-white/10 transition-all block"
              >
                <Flame className="w-5 h-5 text-amber mb-3" />
                <h3 className="font-bold text-sm text-white">{s.label}</h3>
                <p className="text-xs text-white/60 mt-1.5 leading-relaxed">{s.desc}</p>
                <span className="text-xs text-amber font-semibold mt-3 inline-flex items-center gap-1">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Certifications */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="border border-black/10 rounded-xl p-8 bg-white grid sm:grid-cols-3 gap-8 text-center items-center">
          <div className="flex flex-col items-center">
            <Award className="w-8 h-8 text-brand mb-2" />
            <h3 className="font-bold text-base text-ink">Bureau of Indian Standards</h3>
            <p className="text-xs text-steel mt-1 max-w-xs">
              Every cylinder and extinguisher is ISI-marked conforming strictly to IS 15683, IS 2878, and IS 10204.
            </p>
          </div>
          <div className="flex flex-col items-center border-y sm:border-y-0 sm:border-x border-black/10 py-6 sm:py-0">
            <Building2 className="w-8 h-8 text-brand mb-2" />
            <h3 className="font-bold text-base text-ink">500+ Corporate Clients</h3>
            <p className="text-xs text-steel mt-1 max-w-xs">
              Trusted by IT parks in Airoli, manufacturing facilities in Taloja, and residential complexes across Navi Mumbai.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-8 h-8 text-brand mb-2" />
            <h3 className="font-bold text-base text-ink">Form B Compliance Support</h3>
            <p className="text-xs text-steel mt-1 max-w-xs">
              Direct assistance with half-yearly Form B fire safety compliance certificates for local municipal corporations.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
