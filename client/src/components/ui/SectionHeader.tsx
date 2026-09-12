import React from "react";
import Badge from "../Badge";

export interface SectionHeaderProps {
  badge?: string;
  badgeTone?: "primary" | "secondary" | "accent" | "success" | "warning";
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center" | "right";
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  badge,
  badgeTone = "primary",
  title,
  subtitle,
  align = "left",
  actions,
  className = "",
}: SectionHeaderProps) {
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 ${className}`}
    >
      <div className={`flex flex-col ${alignClasses[align]} max-w-2xl`}>
        {badge && (
          <div className="mb-2">
            <Badge tone={badgeTone}>{badge}</Badge>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-dark tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export default SectionHeader;
