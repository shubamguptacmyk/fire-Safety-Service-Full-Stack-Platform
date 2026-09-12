import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = "",
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  function toggle(id: string) {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  }

  return (
    <div className={`divide-y divide-slate-200 border border-slate-200/80 rounded-xl bg-white overflow-hidden ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="transition-colors">
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3 pr-4">
                {item.icon && <span className="text-primary-700">{item.icon}</span>}
                <span className="text-sm sm:text-base font-semibold text-dark">
                  {item.title}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-primary-700" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
