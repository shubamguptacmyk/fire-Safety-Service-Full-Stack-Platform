import React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "line" | "pill";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "line",
}: TabsProps) {
  if (variant === "pill") {
    return (
      <div className={`flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-white text-dark shadow-xs"
                  : "text-slate-600 hover:text-dark hover:bg-white/50"
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span>{tab.badge}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-slate-200 ${className}`}>
      <nav className="flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 py-3.5 px-1 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? "border-primary-700 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span>{tab.badge}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Tabs;
