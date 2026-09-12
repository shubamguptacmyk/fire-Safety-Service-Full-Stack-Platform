import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
              ...
            </span>
          );
        }
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(Number(p))}
            className={`min-w-[36px] h-9 px-2 text-xs font-semibold rounded-lg transition-colors ${
              isCurrent
                ? "bg-primary-700 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
            aria-current={isCurrent ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

export default Pagination;
