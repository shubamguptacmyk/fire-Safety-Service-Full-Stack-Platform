import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-steel font-medium mb-3" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-ink transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center space-x-1.5">
            <ChevronRight className="w-3 h-3 text-steel/60 shrink-0" />
            {isLast || !item.to ? (
              <span className="text-ink font-semibold">{item.label}</span>
            ) : (
              <Link to={item.to} className="hover:text-ink transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
