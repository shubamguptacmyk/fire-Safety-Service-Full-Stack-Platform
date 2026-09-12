import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Wrench,
  ArrowRight,
  Flame,
  Award,
  Phone,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  MapPin,
  ChevronRight,
  FlameKindling,
  Sparkles,
} from "lucide-react";

import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ui/ServiceCard";
import BlogCard from "@/components/ui/BlogCard";
import Accordion from "@/components/ui/Accordion";
import CTASection from "@/components/ui/CTASection";
import TrustBar from "@/components/ui/TrustBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  ProductCardSkeleton,
  BlogCardSkeleton,
} from "@/components/ui/LoadingSkeleton";
import Button from "@/components/ui/Button";

import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { bannerService } from "@/services/bannerService";
import { blogService } from "@/services/blogService";
import { faqService } from "@/services/faqService";
import { galleryService } from "@/services/galleryService";

export default function Home() {
  const [activeProductTab, setActiveProductTab] = useState<
    "featured" | "bestseller"
  >("featured");

  // Dynamic Banners
  const { data: banners } = useQuery({
    queryKey: ["home-banners"],
    queryFn: () => bannerService.getActiveBanners(),
    staleTime: 5 * 60 * 1000,
  });

  // Categories
  const { data: categories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  // Featured & Best Sellers
  const { data: featuredData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["home-featured-products"],
    queryFn: () => productService.getFeaturedAndBestSellers(),
  });

  // Blog posts
  const { data: blogData, isLoading: isBlogLoading } = useQuery({
    queryKey: ["home-blog-posts"],
    queryFn: () => blogService.getPublishedPosts({ limit: 3 }),
  });

  // FAQs
  const { data: faqs } = useQuery({
    queryKey: ["home-faqs"],
    queryFn: () => faqService.getPublicFaqs(),
  });

  // Gallery
  const { data: galleryData } = useQuery({
    queryKey: ["home-gallery"],
    queryFn: () => galleryService.getGalleryItems({ limit: 6 }),
  });

  const promoStrip = banners?.find((b) => b.position === "promo_strip");

  const heroBanners = banners?.filter(
    (b) => b.position === "home_hero"
  );

  const heroBanner =
    heroBanners && heroBanners.length > 0 ? heroBanners[0] : null;

  const displayedProducts =
    activeProductTab === "featured"
      ? featuredData?.featured || []
      : featuredData?.bestSellers || [];

  return (
    <>
      <Seo
        title="Shubam Fire Protection — Professional Fire Protection & Safety Solutions"
        description="Shubam Fire Protection is a licensed fire engineering contractor and equipment supplier in Navi Mumbai & Maharashtra. ISI-certified extinguishers, suppression systems, refilling, and statutory Form B AMC inspection."
      />

      {/* =========================================================
          PROMOTIONAL ANNOUNCEMENT
      ========================================================= */}
      {promoStrip && (
        <aside
          aria-label="Announcement"
          className="
            bg-primary-700
            text-white
            py-2
            px-3 sm:px-4
            text-[11px] sm:text-xs
            font-semibold
            text-center
            flex
            flex-wrap
            items-center
            justify-center
            gap-x-2
            gap-y-1.5
            shadow-xs
            overflow-hidden
          "
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-orange-300 shrink-0" />
            <span className="break-words">
              {promoStrip.title}
            </span>
          </span>

          {promoStrip.subtitle && (
            <span className="opacity-80 break-words">
              &bull; {promoStrip.subtitle}
            </span>
          )}

          {promoStrip.link && (
            <Link
              to={promoStrip.link}
              className="
                underline
                hover:text-orange-200
                font-bold
                inline-flex
                items-center
                gap-1
                shrink-0
              "
            >
              <span>
                {promoStrip.buttonText || "Explore Details"}
              </span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </aside>
      )}

      {/* =========================================================
          SECTION 1: TRUST BAR
      ========================================================= */}
      <TrustBar />

      {/* =========================================================
          SECTION 3: DYNAMIC HERO
      ========================================================= */}
      <section
        className="
          relative
          bg-dark
          text-white
          overflow-hidden
          py-10
          sm:py-16
          lg:py-24
          border-b
          border-slate-800
        "
      >
        {/* Background decoration */}
        <div
          className="
            absolute
            -top-24
            -left-24
            w-64
            h-64
            sm:w-96
            sm:h-96
            bg-primary-700/20
            rounded-full
            blur-3xl
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            top-1/2
            right-0
            w-64
            h-64
            sm:w-96
            sm:h-96
            bg-orange-600/10
            rounded-full
            blur-3xl
            pointer-events-none
          "
        />

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            relative
            z-10
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-8
            lg:gap-12
            items-center
            min-w-0
          "
        >
          {/* =====================================================
              HERO CONTENT
          ===================================================== */}
          <div
            className="
              lg:col-span-7
              min-w-0
              w-full
              space-y-5
              sm:space-y-6
            "
          >
            {/* Badge */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-white/10
                border
                border-white/15
                text-orange-400
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-wider
                max-w-full
                overflow-hidden
              "
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />

              <span className="truncate">
                Govt. Approved Licensed Fire Agency &bull; Navi Mumbai
              </span>
            </div>

            {/* Heading */}
            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                xl:text-6xl
                font-extrabold
                font-display
                tracking-tight
                text-white
                leading-[1.1]
                break-words
                max-w-full
              "
            >
              {heroBanner?.title ||
                "Industrial-Grade Fire Protection Engineered for Zero Failure"}
            </h1>

            {/* Description */}
            <p
              className="
                text-slate-300
                text-sm
                sm:text-base
                lg:text-lg
                leading-relaxed
                max-w-2xl
                break-words
              "
            >
              {heroBanner?.subtitle ||
                "From ISI-marked extinguishers and automatic clean-agent suppression to half-yearly Form B compliance certification, Shubam Fire Protection safeguards industrial plants, commercial towers, and communities across Maharashtra."}
            </p>

            {/* CTA Buttons */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                flex-wrap
                gap-3
                sm:gap-4
                pt-1
                w-full
              "
            >
              <Link
                to={heroBanner?.link || "/request-quote"}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="
                    w-full
                    sm:w-auto
                    justify-center
                    min-h-[46px]
                  "
                  leftIcon={
                    <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  }
                  rightIcon={
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  }
                >
                  {heroBanner?.buttonText || "Request B2B Quote"}
                </Button>
              </Link>

              <Link
                to="/services/amc"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="
                    w-full
                    sm:w-auto
                    justify-center
                    min-h-[46px]
                    border-slate-600
                    bg-white/5
                    text-white
                    hover:bg-white/10
                    hover:border-slate-500
                  "
                  leftIcon={
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  }
                >
                  AMC &amp; Form B Plans
                </Button>
              </Link>

              <Link
                to="/products"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="
                    w-full
                    sm:w-auto
                    justify-center
                    min-h-[46px]
                    text-slate-300
                    hover:text-white
                    hover:bg-white/5
                  "
                >
                  Browse Catalog &rarr;
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div
              className="
                pt-5
                sm:pt-8
                border-t
                border-slate-800
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-3
                sm:gap-6
                text-left
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  sm:block
                  gap-2
                  py-1
                "
              >
                <span
                  className="
                    block
                    text-2xl
                    sm:text-3xl
                    font-extrabold
                    font-display
                    text-white
                  "
                >
                  100%
                </span>

                <span className="text-xs text-slate-400 sm:mt-0.5 block">
                  ISI &amp; BIS Certified Gear
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  sm:block
                  gap-2
                  py-1
                "
              >
                <span
                  className="
                    block
                    text-2xl
                    sm:text-3xl
                    font-extrabold
                    font-display
                    text-white
                  "
                >
                  35 kg/cm²
                </span>

                <span className="text-xs text-slate-400 sm:mt-0.5 block">
                  Hydro-Testing Pressure
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  sm:block
                  gap-2
                  py-1
                "
              >
                <span
                  className="
                    block
                    text-2xl
                    sm:text-3xl
                    font-extrabold
                    font-display
                    text-white
                  "
                >
                  Form B
                </span>

                <span className="text-xs text-slate-400 sm:mt-0.5 block">
                  Municipal Compliance Cleared
                </span>
              </div>
            </div>
          </div>

          {/* =====================================================
              HERO VISUAL
          ===================================================== */}
          <div
            className="
              lg:col-span-5
              w-full
              min-w-0
            "
          >
            {heroBanner?.image ? (
              <div
                className="
                  relative
                  w-full
                  min-w-0
                  rounded-2xl
                  overflow-hidden
                  shadow-2xl
                  border
                  border-slate-700
                  aspect-[4/3]
                  sm:aspect-[16/10]
                  lg:aspect-[4/3]
                  group
                "
              >
                <img
                  src={heroBanner.image}
                  alt={heroBanner.title}
                  loading="eager"
                  className="
                    w-full
                    h-full
                    object-cover
                    group-hover:scale-105
                    transition-transform
                    duration-500
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-dark/90
                    via-transparent
                    to-transparent
                    flex
                    items-end
                    p-4
                    sm:p-6
                  "
                >
                  <div
                    className="
                      text-white
                      min-w-0
                      w-full
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        sm:text-xs
                        font-semibold
                        text-orange-400
                        uppercase
                        tracking-wider
                      "
                    >
                      Featured Equipment
                    </p>

                    <p
                      className="
                        text-base
                        sm:text-lg
                        font-bold
                        font-display
                        mt-1
                        line-clamp-2
                        break-words
                      "
                    >
                      {heroBanner.title}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="
                  relative
                  w-full
                  min-w-0
                  rounded-2xl
                  overflow-hidden
                  shadow-2xl
                  border
                  border-slate-700
                  bg-slate-900
                  p-4
                  sm:p-6
                  lg:p-8
                "
              >
                {/* Accreditation Header */}
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                    border-b
                    border-slate-800
                    pb-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-white
                      min-w-0
                    "
                  >
                    <Flame className="w-5 h-5 text-primary-500 shrink-0" />

                    <span
                      className="
                        font-bold
                        text-[11px]
                        sm:text-sm
                        font-display
                        uppercase
                        tracking-wider
                        leading-tight
                        break-words
                      "
                    >
                      Statutory Accreditation
                    </span>
                  </div>

                  <span
                    className="
                      text-[10px]
                      sm:text-xs
                      px-2.5
                      py-1
                      rounded-md
                      bg-emerald-950
                      text-emerald-400
                      border
                      border-emerald-800
                      font-semibold
                      whitespace-nowrap
                      shrink-0
                    "
                  >
                    Category A
                  </span>
                </div>

                {/* Accreditation Items */}
                <div
                  className="
                    mt-4
                    sm:mt-5
                    space-y-2.5
                    sm:space-y-3
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-2.5
                      sm:gap-3
                      p-3
                      sm:p-3.5
                      rounded-xl
                      bg-white/5
                      border
                      border-white/10
                    "
                  >
                    <CheckCircle2
                      className="
                        w-4
                        h-4
                        text-emerald-400
                        shrink-0
                        mt-0.5
                      "
                    />

                    <div className="min-w-0">
                      <p
                        className="
                          font-bold
                          text-white
                          text-[11px]
                          sm:text-xs
                          leading-snug
                          break-words
                        "
                      >
                        Maharashtra Fire Services Licensed Agency
                      </p>

                      <p
                        className="
                          text-slate-400
                          mt-1
                          text-[10px]
                          sm:text-xs
                          leading-relaxed
                          break-words
                        "
                      >
                        Authorised to conduct bi-annual Form B testing and
                        certification.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-start
                      gap-2.5
                      sm:gap-3
                      p-3
                      sm:p-3.5
                      rounded-xl
                      bg-white/5
                      border
                      border-white/10
                    "
                  >
                    <CheckCircle2
                      className="
                        w-4
                        h-4
                        text-emerald-400
                        shrink-0
                        mt-0.5
                      "
                    />

                    <div className="min-w-0">
                      <p
                        className="
                          font-bold
                          text-white
                          text-[11px]
                          sm:text-xs
                          leading-snug
                          break-words
                        "
                      >
                        IS 15683 &amp; IS 2190 Factory Specification
                      </p>

                      <p
                        className="
                          text-slate-400
                          mt-1
                          text-[10px]
                          sm:text-xs
                          leading-relaxed
                          break-words
                        "
                      >
                        Automated gas filling, hydrostatic pressure checks,
                        and hologram seals.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-start
                      gap-2.5
                      sm:gap-3
                      p-3
                      sm:p-3.5
                      rounded-xl
                      bg-white/5
                      border
                      border-white/10
                    "
                  >
                    <CheckCircle2
                      className="
                        w-4
                        h-4
                        text-emerald-400
                        shrink-0
                        mt-0.5
                      "
                    />

                    <div className="min-w-0">
                      <p
                        className="
                          font-bold
                          text-white
                          text-[11px]
                          sm:text-xs
                          leading-snug
                          break-words
                        "
                      >
                        ISO 9001:2015 Quality Management
                      </p>

                      <p
                        className="
                          text-slate-400
                          mt-1
                          text-[10px]
                          sm:text-xs
                          leading-relaxed
                          break-words
                        "
                      >
                        Comprehensive audit trail with equipment QR code
                        tracking.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accreditation CTA */}
                <div className="mt-4 sm:mt-5">
                  <Link
                    to="/book-service"
                    className="
                      w-full
                      min-w-0
                      flex
                      items-center
                      justify-center
                      gap-2
                      py-3
                      sm:py-3.5
                      px-3
                      sm:px-4
                      rounded-xl
                      bg-primary-700
                      hover:bg-primary-800
                      text-white
                      font-bold
                      text-[10px]
                      sm:text-xs
                      text-center
                      leading-tight
                      transition-colors
                      shadow-md
                    "
                  >
                    <Wrench className="w-4 h-4 text-orange-300 shrink-0" />

                    <span className="break-words">
                      Schedule On-Site Technician Inspection
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 4: QUICK ACTIONS
      ========================================================= */}
      <section
        className="
          relative
          -mt-4
          sm:-mt-6
          z-20
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
        "
      >
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-3
            sm:gap-4
          "
        >
          {/* Quote */}
          <Link
            to="/request-quote"
            className="
              p-4
              sm:p-5
              rounded-xl
              bg-white
              border
              border-slate-200
              shadow-card
              hover:shadow-hover
              hover:border-primary-300
              transition-all
              group
              flex
              items-start
              gap-3.5
              sm:gap-4
              min-w-0
            "
          >
            <div
              className="
                p-2.5
                sm:p-3
                rounded-xl
                bg-primary-50
                text-primary-700
                group-hover:bg-primary-700
                group-hover:text-white
                transition-colors
                shrink-0
              "
            >
              <FileSpreadsheet className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold font-display text-dark group-hover:text-primary-700 transition-colors">
                Request B2B Quote
              </p>

              <p className="text-xs text-slate-500 mt-1 leading-snug break-words">
                Volume pricing for factories, warehouses, &amp; societies
              </p>
            </div>
          </Link>

          {/* Refilling */}
          <Link
            to="/services/refilling"
            className="
              p-4
              sm:p-5
              rounded-xl
              bg-white
              border
              border-slate-200
              shadow-card
              hover:shadow-hover
              hover:border-primary-300
              transition-all
              group
              flex
              items-start
              gap-3.5
              sm:gap-4
              min-w-0
            "
          >
            <div
              className="
                p-2.5
                sm:p-3
                rounded-xl
                bg-orange-50
                text-orange-700
                group-hover:bg-orange-600
                group-hover:text-white
                transition-colors
                shrink-0
              "
            >
              <FlameKindling className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold font-display text-dark group-hover:text-primary-700 transition-colors">
                Cylinder Refill &amp; Hydro-Test
              </p>

              <p className="text-xs text-slate-500 mt-1 leading-snug break-words">
                Calibrated 35 kg/cm² pressure testing with pickup
              </p>
            </div>
          </Link>

          {/* AMC */}
          <Link
            to="/services/amc"
            className="
              p-4
              sm:p-5
              rounded-xl
              bg-white
              border
              border-slate-200
              shadow-card
              hover:shadow-hover
              hover:border-primary-300
              transition-all
              group
              flex
              items-start
              gap-3.5
              sm:gap-4
              min-w-0
            "
          >
            <div
              className="
                p-2.5
                sm:p-3
                rounded-xl
                bg-emerald-50
                text-emerald-700
                group-hover:bg-emerald-600
                group-hover:text-white
                transition-colors
                shrink-0
              "
            >
              <ShieldCheck className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold font-display text-dark group-hover:text-primary-700 transition-colors">
                Biannual AMC &amp; Form B
              </p>

              <p className="text-xs text-slate-500 mt-1 leading-snug break-words">
                Official statutory municipal clearance certification
              </p>
            </div>
          </Link>

          {/* Emergency */}
          <a
            href="tel:+919800000000"
            className="
              p-4
              sm:p-5
              rounded-xl
              bg-white
              border
              border-slate-200
              shadow-card
              hover:shadow-hover
              hover:border-primary-300
              transition-all
              group
              flex
              items-start
              gap-3.5
              sm:gap-4
              min-w-0
            "
          >
            <div
              className="
                p-2.5
                sm:p-3
                rounded-xl
                bg-red-50
                text-red-700
                group-hover:bg-red-600
                group-hover:text-white
                transition-colors
                shrink-0
              "
            >
              <Phone className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold font-display text-dark group-hover:text-primary-700 transition-colors">
                24/7 Emergency Support
              </p>

              <p className="text-xs text-slate-500 mt-1 leading-snug break-words">
                Direct hotline to active fire engineering cell
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* =========================================================
          SECTION 6: SERVICES
      ========================================================= */}
      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          py-14
          sm:py-20
        "
      >
        <SectionHeader
          badge="OUR CORE ENGINEERING SERVICES"
          badgeTone="primary"
          title="Certified Fire Protection & Maintenance"
          subtitle="All engineering services performed strictly under Maharashtra Fire Prevention and Life Safety Measures Act rules by licensed technicians."
          actions={
            <Link to="/services" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                rightIcon={
                  <ArrowRight className="w-3.5 h-3.5" />
                }
              >
                View All Services
              </Button>
            </Link>
          }
        />

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
            sm:gap-6
          "
        >
          <ServiceCard
            title="Annual Maintenance Contracts (AMC)"
            description="Biannual statutory inspections, preventative servicing, hydraulic line flushing, and Form B compliance certification."
            href="/services/amc"
            icon={<ShieldCheck className="w-6 h-6" />}
            highlights={[
              "Biannual Form B certification",
              "Quarterly valve & pressure checks",
              "Digital compliance register",
            ]}
            ctaText="Explore AMC Plans"
            badge="STATUTORY"
          />

          <ServiceCard
            title="Cylinder Refilling & Hydro-Testing"
            description="Calibrated electronic refilling for ABC powder, CO2, foam, and clean agents with 35 kg/cm² hydrostatic pressure vessel testing."
            href="/services/refilling"
            icon={<FlameKindling className="w-6 h-6" />}
            highlights={[
              "Hydrostatic test certificate",
              "ISI calibrated gas refills",
              "Free doorstep pickup & delivery",
            ]}
            ctaText="Book Refill Service"
            badge="CERTIFIED"
          />

          <ServiceCard
            title="Building Fire Safety Audits"
            description="Detailed structural risk assessment, evacuation plan reviews, fire hazard scoring, and compliance roadmaps for commercial towers."
            href="/services/fire-safety-audit"
            icon={<FileCheck className="w-6 h-6" />}
            highlights={[
              "NBC 2016 Part IV audit",
              "Emergency egress verification",
              "Executive compliance report",
            ]}
            ctaText="Schedule Safety Audit"
          />

          <ServiceCard
            title="Turnkey Hydrant & Sprinkler Installation"
            description="End-to-end engineering, fabrication, and commissioning of wet riser systems, landing valves, hose reels, and deluge networks."
            href="/services/installation"
            icon={<Wrench className="w-6 h-6" />}
            highlights={[
              "Fabrication & pressure testing",
              "Automatic jockey & main pumps",
              "Municipal NOC assistance",
            ]}
            ctaText="View Installation Solutions"
          />

          <ServiceCard
            title="Gas Suppression Systems (FM-200 & Novec)"
            description="Zero-residue automatic total flooding systems engineered specifically for server rooms, data centers, and electrical panel rooms."
            href="/services/installation"
            icon={<Award className="w-6 h-6" />}
            highlights={[
              "FM-200 / FK-5-1-12 clean agents",
              "UL/FM listed discharge nozzles",
              "Fast 10-second suppression",
            ]}
            ctaText="Suppression Solutions"
          />

          <ServiceCard
            title="Testing, Diagnostics & Flow Rate Analysis"
            description="Rigorous pump performance curves, hydrant nozzle pressure verification, alarm panel loop testing, and fault clearance."
            href="/services/inspection"
            icon={<CheckCircle2 className="w-6 h-6" />}
            highlights={[
              "Calibrated pitot tube flow checks",
              "Smoke & heat detector sensitivity",
              "Diagnostic certification report",
            ]}
            ctaText="Request Testing Visit"
          />
        </div>
      </section>

      {/* =========================================================
          SECTION 7: PRODUCTS
      ========================================================= */}
      <section
        className="
          bg-slate-50
          py-14
          sm:py-20
          border-y
          border-slate-200/80
          overflow-hidden
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-w-0">
          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-end
              justify-between
              gap-5
              mb-8
              min-w-0
            "
          >
            <div className="min-w-0">
              <span
                className="
                  text-[10px]
                  sm:text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-primary-700
                "
              >
                ISI-CERTIFIED SAFETY EQUIPMENT
              </span>

              <h2
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-extrabold
                  font-display
                  text-dark
                  tracking-tight
                  mt-1
                  break-words
                "
              >
                Industrial Fire Protection Catalog
              </h2>
            </div>

            {/* Product Tabs */}
            <div
              className="
                flex
                items-center
                gap-1
                p-1
                bg-white
                border
                border-slate-200
                rounded-xl
                shadow-2xs
                w-full
                sm:w-auto
                shrink-0
              "
            >
              <button
                type="button"
                onClick={() => setActiveProductTab("featured")}
                className={`
                  flex-1
                  sm:flex-none
                  text-center
                  px-3
                  sm:px-4
                  py-2.5
                  text-[11px]
                  sm:text-xs
                  font-bold
                  rounded-lg
                  transition-all
                  whitespace-nowrap
                  ${
                    activeProductTab === "featured"
                      ? "bg-primary-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-dark"
                  }
                `}
              >
                Featured Equipment
              </button>

              <button
                type="button"
                onClick={() => setActiveProductTab("bestseller")}
                className={`
                  flex-1
                  sm:flex-none
                  text-center
                  px-3
                  sm:px-4
                  py-2.5
                  text-[11px]
                  sm:text-xs
                  font-bold
                  rounded-lg
                  transition-all
                  whitespace-nowrap
                  ${
                    activeProductTab === "bestseller"
                      ? "bg-primary-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-dark"
                  }
                `}
              >
                Best Sellers
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {isProductsLoading ? (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-5
                sm:gap-6
              "
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-5
                sm:gap-6
              "
            >
              {displayedProducts
                .slice(0, 8)
                .map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
            </div>
          ) : (
            <div
              className="
                text-center
                py-10
                sm:py-12
                px-4
                bg-white
                rounded-2xl
                border
                border-slate-200
              "
            >
              <p className="text-slate-500 text-sm break-words">
                No products found in this section. Browse the full
                catalog below.
              </p>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/products"
              className="inline-block w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto justify-center"
                rightIcon={
                  <ArrowRight className="w-4 h-4" />
                }
              >
                Explore Complete 50+ Product Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 8: EQUIPMENT CATEGORIES
      ========================================================= */}
      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          py-14
          sm:py-20
        "
      >
        <SectionHeader
          badge="COMPREHENSIVE CATALOG"
          title="Browse Equipment by Classification"
          subtitle="Every unit is stamped with ISI / CE certifications and comes complete with mounting brackets, inspection tags, and warranty documentation."
          actions={
            <Link to="/products">
              <Button
                variant="ghost"
                size="sm"
                rightIcon={
                  <ArrowRight className="w-3.5 h-3.5" />
                }
              >
                All Categories &rarr;
              </Button>
            </Link>
          }
        />

        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-4
            gap-3
            sm:gap-5
          "
        >
          {categories?.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              to={`/products/${cat.slug}`}
              className="
                group
                bg-white
                rounded-xl
                sm:rounded-2xl
                border
                border-slate-200
                p-3
                sm:p-5
                hover:border-slate-300
                hover:shadow-hover
                transition-all
                duration-200
                flex
                flex-col
                justify-between
                min-w-0
                overflow-hidden
              "
            >
              <div
                className="
                  aspect-square
                  bg-slate-50
                  rounded-lg
                  sm:rounded-xl
                  mb-3
                  sm:mb-4
                  overflow-hidden
                  flex
                  items-center
                  justify-center
                  p-2
                  sm:p-4
                  border
                  border-slate-100
                  group-hover:border-primary-100
                  transition-colors
                "
              >
                <img
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={cat.name}
                  loading="lazy"
                  className="
                    w-full
                    h-full
                    object-contain
                    group-hover:scale-105
                    transition-transform
                    duration-300
                  "
                />
              </div>

              <div className="min-w-0">
                <h3
                  className="
                    font-bold
                    text-xs
                    sm:text-sm
                    text-dark
                    group-hover:text-primary-700
                    transition-colors
                    truncate
                  "
                >
                  {cat.name}
                </h3>

                <p
                  className="
                    text-[10px]
                    sm:text-xs
                    text-slate-500
                    mt-1
                    line-clamp-2
                    leading-relaxed
                  "
                >
                  {cat.description ||
                    "ISI certified fire safety equipment"}
                </p>

                <span
                  className="
                    text-[10px]
                    sm:text-xs
                    font-semibold
                    text-primary-700
                    mt-2
                    sm:mt-3
                    inline-flex
                    items-center
                    gap-1
                    group-hover:translate-x-1
                    transition-transform
                  "
                >
                  Browse Gear
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          SECTION 10: ENGINEERING WORKFLOW
      ========================================================= */}
      <section
        className="
          bg-slate-900
          text-white
          py-14
          sm:py-20
          border-y
          border-slate-800
          overflow-hidden
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="
              text-center
              max-w-3xl
              mx-auto
              mb-10
              sm:mb-14
            "
          >
            <span
              className="
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-wider
                text-orange-400
              "
            >
              OUR ENGINEERING WORKFLOW
            </span>

            <h2
              className="
                text-2xl
                sm:text-4xl
                font-extrabold
                font-display
                text-white
                tracking-tight
                mt-2
                break-words
              "
            >
              How Shubam Fire Protection Secures Your Premises
            </h2>

            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
              We follow a strict, disciplined engineering protocol to
              ensure statutory compliance and complete operational
              readiness.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-4
              sm:gap-6
              lg:gap-8
            "
          >
            {[
              {
                step: "01",
                title: "On-Site Risk Audit",
                desc: "Survey building architecture, electrical hazards, flammable storage, and egress routes per NBC 2016.",
              },
              {
                step: "02",
                title: "System Design & Supply",
                desc: "Calculate required extinguishing capacity, pipe sizing, and supply ISI-certified equipment direct from factory.",
              },
              {
                step: "03",
                title: "Certified Installation",
                desc: "Technician-led mounting, pressure testing, hydrostatic line verification, and commission sign-off.",
              },
              {
                step: "04",
                title: "AMC & Form B Clearance",
                desc: "Scheduled biannual inspection visits, cylinder refilling tracking, and statutory Form B certificate issuance.",
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="
                  relative
                  p-5
                  sm:p-6
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  flex
                  flex-col
                  justify-between
                  min-w-0
                "
              >
                <div>
                  <span
                    className="
                      text-3xl
                      font-extrabold
                      font-display
                      text-primary-500
                      block
                      mb-3
                    "
                  >
                    {s.step}
                  </span>

                  <h3
                    className="
                      text-lg
                      font-bold
                      font-display
                      text-white
                      mb-2
                      break-words
                    "
                  >
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed break-words">
                    {s.desc}
                  </p>
                </div>

                <div
                  className="
                    mt-5
                    sm:mt-6
                    pt-4
                    border-t
                    border-white/10
                    flex
                    items-center
                    text-xs
                    font-semibold
                    text-orange-400
                  "
                >
                  <span>Step {idx + 1} of 4</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 11 & 12: REFILLING + AMC
      ========================================================= */}
      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          py-12
          sm:py-20
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
            sm:gap-8
            lg:gap-12
            items-stretch
          "
        >
          {/* Refilling */}
          <div
            className="
              p-5
              sm:p-8
              lg:p-10
              rounded-2xl
              bg-white
              border
              border-slate-200
              shadow-card
              space-y-4
              sm:space-y-5
              min-w-0
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1
                rounded-full
                bg-orange-50
                text-orange-700
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-wider
                border
                border-orange-200
                max-w-full
              "
            >
              <FlameKindling
                className="w-4 h-4 text-accent shrink-0"
              />

              <span className="truncate">
                Calibrated Workshop Facility
              </span>
            </div>

            <h3
              className="
                text-xl
                sm:text-2xl
                lg:text-3xl
                font-bold
                font-display
                text-dark
                tracking-tight
                break-words
              "
            >
              Hydrostatic Pressure Testing &amp; Cylinder Refilling
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed break-words">
              Uncertified refills are dangerous. At Shubam Fire
              Protection, every cylinder undergoing refilling undergoes
              hydrostatic pressure testing up to 35 kg/cm², ultrasonic
              wall thickness verification, and precision electronic
              powder charging.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="break-words">
                  IS 2190 compliant hydrostatic test certification
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="break-words">
                  Replacement of tamper seals, O-rings, and safety pins
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="break-words">
                  Free standby backup cylinders provided during service
                </span>
              </li>
            </ul>

            <div className="pt-2 sm:pt-4">
              <Link
                to="/services/refilling"
                className="inline-block w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto justify-center"
                  rightIcon={
                    <ArrowRight className="w-4 h-4" />
                  }
                >
                  Book Cylinder Refilling
                </Button>
              </Link>
            </div>
          </div>

          {/* AMC */}
          <div
            className="
              p-5
              sm:p-8
              lg:p-10
              rounded-2xl
              bg-white
              border
              border-slate-200
              shadow-card
              space-y-4
              sm:space-y-5
              min-w-0
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1
                rounded-full
                bg-emerald-50
                text-emerald-700
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-wider
                border
                border-emerald-200
                max-w-full
              "
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />

              <span className="truncate">
                Statutory Municipal Mandate
              </span>
            </div>

            <h3
              className="
                text-xl
                sm:text-2xl
                lg:text-3xl
                font-bold
                font-display
                text-dark
                tracking-tight
                break-words
              "
            >
              Biannual AMC &amp; Form B Compliance Certification
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed break-words">
              Under the Maharashtra Fire Prevention and Life Safety
              Measures Act, all commercial premises and high-rises must
              submit Form B twice a year (January and July) certified by
              a Licensed Agency.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="break-words">
                  Issued directly by Licensed Agency Category
                  &lsquo;A&rsquo;
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="break-words">
                  Complete pump, riser, alarm and extinguisher inspection
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="break-words">
                  Online customer portal to track all equipment expiry
                  dates
                </span>
              </li>
            </ul>

            <div className="pt-2 sm:pt-4">
              <Link
                to="/services/amc"
                className="inline-block w-full sm:w-auto"
              >
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto justify-center"
                  rightIcon={
                    <ArrowRight className="w-4 h-4" />
                  }
                >
                  Explore AMC Contract Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 13: B2B CTA
      ========================================================= */}
      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          py-4
          sm:py-6
        "
      >
        <CTASection
          title="Procuring for an Industrial Plant, Warehouse, or High-Rise Society?"
          subtitle="Shubam Fire Protection supplies directly to project developers, MEP contractors, and facility managers across Maharashtra with GST-compliant billing, volume discounts, and turn-key installation."
          primaryButtonText="Request B2B Project Quotation"
          primaryButtonHref="/request-quote"
          secondaryButtonText="Book Site Survey"
          secondaryButtonHref="/book-service"
        />
      </section>

      {/* =========================================================
          SECTION 14: BLOG
      ========================================================= */}
      <section
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          py-14
          sm:py-20
        "
      >
        <SectionHeader
          badge="KNOWLEDGE BASE & GUIDES"
          title="Fire Safety Codes & Insights"
          subtitle="Stay updated with National Building Code norms, extinguisher selection guides, and statutory compliance updates."
          actions={
            <Link to="/blog">
              <Button
                variant="outline"
                size="sm"
                rightIcon={
                  <ArrowRight className="w-3.5 h-3.5" />
                }
              >
                Read All Articles
              </Button>
            </Link>
          }
        />

        {isBlogLoading ? (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-5
              sm:gap-6
            "
          >
            {Array.from({ length: 3 }).map((_, idx) => (
              <BlogCardSkeleton key={idx} />
            ))}
          </div>
        ) : blogData?.items && blogData.items.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-5
              sm:gap-6
            "
          >
            {blogData.items.slice(0, 3).map((post) => (
              <BlogCard
                key={post._id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                coverImage={post.featuredImage}
                category={post.category}
                authorName={
                  post.author?.name || "Technical Cell"
                }
                date={post.publishedAt || post.createdAt}
                readingTime={`${post.readTime || 4} min read`}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* =========================================================
          SECTION 15: FAQ
      ========================================================= */}
      {faqs && faqs.length > 0 && (
        <section
          className="
            bg-slate-50
            py-14
            sm:py-20
            border-t
            border-slate-200/80
            overflow-hidden
          "
        >
          <div
            className="
              max-w-4xl
              mx-auto
              px-4
              sm:px-6
              min-w-0
            "
          >
            <SectionHeader
              badge="FREQUENTLY ASKED QUESTIONS"
              title="Common Questions on Fire Safety & Compliance"
              subtitle="Clear, factual answers regarding extinguisher types, Form B certifications, and service schedules."
              align="center"
            />

            <Accordion
              items={faqs.slice(0, 5).map((f) => ({
                id: f._id,
                title: f.question,
                content: f.answer,
              }))}
              defaultOpenIds={[faqs[0]._id]}
            />

            <div className="text-center mt-8 sm:mt-10">
              <Link
                to="/faq"
                className="inline-block w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto justify-center"
                >
                  View All Frequently Asked Questions &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 16: GALLERY
      ========================================================= */}
      {galleryData?.items && galleryData.items.length > 0 && (
        <section
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            py-14
            sm:py-20
          "
        >
          <SectionHeader
            badge="PORTFOLIO & INSTALLATIONS"
            title="Real-World Engineering Projects"
            subtitle="Explore our completed fire hydrant setups, clean agent suppression installations, and testing sessions."
            actions={
              <Link to="/gallery">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={
                    <ArrowRight className="w-3.5 h-3.5" />
                  }
                >
                  View Full Gallery
                </Button>
              </Link>
            }
          />

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              lg:grid-cols-6
              gap-2.5
              sm:gap-4
            "
          >
            {galleryData.items.slice(0, 6).map((item) => (
              <div
                key={item._id}
                className="
                  group
                  relative
                  rounded-lg
                  sm:rounded-xl
                  overflow-hidden
                  aspect-square
                  bg-slate-100
                  border
                  border-slate-200
                  shadow-2xs
                  min-w-0
                "
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="
                    w-full
                    h-full
                    object-cover
                    group-hover:scale-105
                    transition-transform
                    duration-300
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-dark/80
                    via-transparent
                    to-transparent
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    p-2
                    sm:p-3
                    flex
                    flex-col
                    justify-end
                    text-white
                  "
                >
                  <p className="font-bold text-[10px] sm:text-xs truncate">
                    {item.title}
                  </p>

                  <p className="text-[9px] sm:text-[10px] text-slate-300 truncate">
                    {item.location || item.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 17: SERVICE AREAS
      ========================================================= */}
      <section
        className="
          bg-white
          py-12
          sm:py-16
          border-t
          border-slate-200
          overflow-hidden
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="
              text-center
              max-w-2xl
              mx-auto
              mb-8
              sm:mb-10
            "
          >
            <span
              className="
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-wider
                text-primary-700
              "
            >
              SERVICE FOOTPRINT
            </span>

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                font-display
                text-dark
                tracking-tight
                mt-1
                break-words
              "
            >
              Serving Maharashtra’s Key Industrial &amp; Commercial Hubs
            </h2>

            <p
              className="
                text-xs
                sm:text-sm
                text-slate-500
                mt-2
                leading-relaxed
                break-words
              "
            >
              Our mobile service vans provide on-site inspection,
              refilling pickup, and emergency dispatch across:
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
              sm:gap-3
              text-xs
              font-semibold
              text-slate-700
            "
          >
            {[
              "Navi Mumbai (Vashi, Nerul, Belapur)",
              "Turbhe & Pawane MIDC",
              "Taloja Industrial Area",
              "Mahape Millennium Business Park",
              "Airoli Mindspace Hub",
              "Thane & Ghodbunder Road",
              "Kalyan & Dombivli MIDC",
              "Bhiwandi Logistics Park",
              "Panvel & JNPT Port Corridor",
              "Mumbai MMR Region",
              "Pune Industrial Corridor",
            ].map((area, i) => (
              <span
                key={i}
                className="
                  px-2.5
                  sm:px-3.5
                  py-1.5
                  rounded-full
                  bg-slate-50
                  border
                  border-slate-200
                  text-slate-700
                  shadow-2xs
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  sm:text-xs
                  max-w-full
                "
              >
                <MapPin
                  className="
                    w-3.5
                    h-3.5
                    text-primary-700
                    shrink-0
                  "
                />

                <span className="break-words text-center">
                  {area}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}