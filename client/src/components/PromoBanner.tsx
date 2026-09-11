import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { bannerService } from "@/services/bannerService";
import { normalizeBannerLink } from "@/components/BannerCarousel";

interface PromoBannerProps {
  position?: string;
  className?: string;
}

export default function PromoBanner({ position = "home_middle", className = "" }: PromoBannerProps) {
  const { data: banners = [] } = useQuery({
    queryKey: ["promo-banner", position],
    queryFn: () => bannerService.getActiveBanners(position),
    staleTime: 60 * 1000,
  });

  const activePromo = banners.find((b) => b.isActive);

  if (!activePromo) {
    return null; // Only show when real backend banner exists
  }

  const linkTarget = normalizeBannerLink(activePromo.link);
  const buttonLabel = activePromo.buttonText || "Learn More";

  return (
    <section className={`py-6 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-ink text-white shadow-xl border border-white/10">
          {/* Background banner image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
              style={{ backgroundImage: `url("${activePromo.image}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-transparent" />

            <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/20 border border-brand/40 text-brand-light text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber" />
                  <span>Featured Operational Facility</span>
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                  {activePromo.title}
                </h2>
                {activePromo.subtitle && (
                  <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
                    {activePromo.subtitle}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {linkTarget.startsWith("http://") || linkTarget.startsWith("https://") ? (
                  <a
                    href={linkTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    <span>{buttonLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    to={linkTarget}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    <span>{buttonLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
