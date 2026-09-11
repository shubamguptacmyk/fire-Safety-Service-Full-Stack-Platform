import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { bannerService, BannerItem } from "@/services/bannerService";

export function normalizeBannerLink(link?: string): string {
  if (!link || !link.trim()) return "/products";
  const trimmed = link.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;

  const lower = trimmed.toLowerCase();
  if (lower.includes("product")) return "/products";
  if (lower.includes("service")) return "/services";
  if (lower.includes("quote") || lower.includes("rfq")) return "/request-quote";
  if (lower.includes("amc")) return "/services/amc";
  if (lower.includes("refill")) return "/services/refilling";
  if (lower.includes("audit")) return "/services/fire-safety-audit";
  if (lower.includes("contact")) return "/contact";
  if (lower.includes("about")) return "/about";

  return `/${lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

interface BannerCarouselProps {
  position?: string;
  className?: string;
}

export default function BannerCarousel({ position = "home_hero", className = "" }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch active banners from the real backend API (fetch all so hero fallback can use active banners)
  const {
    data: rawBanners = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["active-banners", position],
    queryFn: () => bannerService.getActiveBanners(),
    staleTime: 60 * 1000, // 1 minute fresh
  });

  // Filter banners based on active status, scheduling dates, and position
  const banners = React.useMemo(() => {
    const now = new Date().getTime();
    const active = rawBanners.filter((b) => {
      if (!b.isActive) return false;
      if (b.startDate && new Date(b.startDate).getTime() > now) return false;
      if (b.endDate && new Date(b.endDate).getTime() < now) return false;
      return true;
    });

    if (position === "home_hero") {
      const heroMatches = active.filter((b) => !b.position || b.position === "home_hero");
      const candidates = heroMatches.length > 0 ? heroMatches : active;
      return candidates.sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0));
    }

    const posMatches = active.filter((b) => b.position === position);
    return posMatches.sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0));
  }, [rawBanners, position]);

  const total = banners.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay with pause-on-hover
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [total, isPaused, handleNext]);

  // Touch swipe support for mobile
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  }

  if (isLoading) {
    return (
      <div className={`relative bg-ink/90 overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent animate-pulse" />
        <div className="max-w-6xl w-full mx-auto px-4 py-16 relative z-10 space-y-4">
          <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-12 w-3/4 max-w-xl bg-white/15 rounded animate-pulse" />
          <div className="h-20 w-full max-w-lg bg-white/10 rounded animate-pulse" />
          <div className="flex gap-4 pt-4">
            <div className="h-11 w-36 bg-brand/40 rounded animate-pulse" />
            <div className="h-11 w-36 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`relative bg-ink text-white py-12 px-4 border-b border-white/10 ${className}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber shrink-0" />
            <div>
              <p className="font-bold text-sm">Unable to synchronize latest promotional campaigns</p>
              <p className="text-xs text-white/60">Displaying certified statutory services.</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Sync
          </button>
        </div>
      </div>
    );
  }

  // Fallback if no active banners exist in database
  if (banners.length === 0) {
    return (
      <section className={`relative bg-ink text-white overflow-hidden min-h-[440px] md:min-h-[520px] flex items-center ${className}`}>
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1920&q=80")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 md:via-ink/80 to-transparent z-10" />

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber/20 border border-amber/40 text-amber text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4" /> Category &lsquo;A&rsquo; Directorate of Maharashtra Fire Services
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
              Industrial Fire Protection & Statutory Form B Compliance
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
              Certified ISI fire extinguishers, automatic FM-200 gas suppression, calibrated cylinder hydro-testing,
              and turnkey AMC contracts across Navi Mumbai and Maharashtra.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Browse Equipment Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services/amc"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-colors"
              >
                Get AMC Proposal
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];
  const targetLink = normalizeBannerLink(currentBanner.link);
  const buttonLabel = currentBanner.buttonText || "Explore Equipment";

  return (
    <section
      className={`relative bg-ink text-white overflow-hidden select-none min-h-[440px] md:min-h-[520px] flex items-center ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Promotional Banners Carousel"
    >
      {/* Background Image Slides */}
      {banners.map((b, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={b._id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-0 ${
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            <picture className="w-full h-full">
              {b.mobileImage && (
                <source media="(max-width: 768px)" srcSet={b.mobileImage} />
              )}
              <img
                src={b.image}
                alt={b.title}
                loading={idx === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1920&q=80";
                }}
                className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000"
              />
            </picture>
          </div>
        );
      })}

      {/* Cinematic Dark Gradient Overlays for High Contrast Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 md:via-ink/85 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent z-10" />

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-20 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber/20 border border-amber/40 text-amber text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber shrink-0" />
            <span>Govt. Approved Licensed Agency &bull; Navi Mumbai</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white transition-all duration-300">
            {currentBanner.title}
          </h1>

          {currentBanner.subtitle && (
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl transition-all duration-300">
              {currentBanner.subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {targetLink.startsWith("http://") || targetLink.startsWith("https://") ? (
              <a
                href={targetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{buttonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link
                to={targetLink}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{buttonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/request-quote"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-colors"
            >
              Request B2B RFQ
            </Link>
          </div>
        </div>
      </div>

      {/* Left/Right Navigation Arrows (if multiple banners) */}
      {total > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous banner slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-brand text-white/80 hover:text-white border border-white/15 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next banner slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-brand text-white/80 hover:text-white border border-white/15 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator & Autoplay Status */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? "w-7 h-2 bg-amber"
                    : "w-2 h-2 bg-white/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
