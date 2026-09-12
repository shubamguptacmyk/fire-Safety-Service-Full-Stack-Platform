import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-500 hover:text-primary-700 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <li>
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="hover:text-primary-700 transition-colors truncate max-w-[160px] sm:max-w-xs inline-block"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-xs inline-block ${
                      isLast ? "text-slate-900" : ""
                    }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
