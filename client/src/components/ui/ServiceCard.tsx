import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Card from "./Card";

export interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  highlights?: string[];
  ctaText?: string;
  badge?: string;
  className?: string;
}

export function ServiceCard({
  title,
  description,
  href,
  icon,
  highlights = [],
  ctaText = "Learn More",
  badge,
  className = "",
}: ServiceCardProps) {
  return (
    <Card hoverable className={`flex flex-col justify-between h-full group ${className}`}>
      <div className="p-4 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
          <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center border border-primary-100/60 group-hover:scale-105 group-hover:bg-primary-700 group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold font-display text-dark group-hover:text-primary-700 transition-colors break-words">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {description}
        </p>

        {highlights.length > 0 && (
          <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="break-words leading-tight">{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/70 border-t border-slate-100">
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 transition-colors group-hover:translate-x-1 duration-200"
        >
          <span>{ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </Card>
  );
}

export default ServiceCard;
