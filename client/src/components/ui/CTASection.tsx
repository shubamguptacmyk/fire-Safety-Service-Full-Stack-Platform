import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, ShieldCheck, FileSpreadsheet } from "lucide-react";
import Button from "./Button";

export interface CTASectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  badge?: string;
  className?: string;
}

export function CTASection({
  title = "Protect Your Facility with Certified Fire Safety Engineering",
  subtitle = "Direct manufacturer supply of ISI extinguishers, turnkey suppression systems, and accredited biannual Form B inspection certification across Maharashtra.",
  primaryButtonText,
  primaryButtonHref,
  primaryBtnText,
  primaryBtnLink,
  secondaryButtonText,
  secondaryButtonHref,
  secondaryBtnText,
  secondaryBtnLink,
  badge = "STATUTORY FIRE COMPLIANCE & SAFETY",
  className = "",
}: CTASectionProps) {
  const pText = primaryBtnText || primaryButtonText || "Request B2B Quotation";
  const pHref = primaryBtnLink || primaryButtonHref || "/request-quote";
  const sText = secondaryBtnText || secondaryButtonText || "Book Technician Visit";
  const sHref = secondaryBtnLink || secondaryButtonHref || "/book-service";

  return (
    <section className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-5 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl ${className}`}>
      {/* Background industrial graphic accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-primary-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 max-w-full">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{badge}</span>
          </div>
        )}

        <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white leading-tight break-words">
          {title}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base mt-3 sm:mt-4 leading-relaxed max-w-2xl break-words">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Link to={pHref} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto justify-center"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {pText}
            </Button>
          </Link>

          <Link to={sHref} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto justify-center border-slate-600 bg-white/5 text-white hover:bg-white/10 hover:border-slate-500"
            >
              {sText}
            </Button>
          </Link>

          <a
            href="tel:+919800000000"
            className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors px-2 py-2"
          >
            <Phone className="w-4 h-4 text-primary-500 shrink-0" />
            <span>24/7 Hotline: +91 98000 00000</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
