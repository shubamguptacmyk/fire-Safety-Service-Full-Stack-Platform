import React from "react";

const TONES = {
  primary: "bg-red-50 text-red-700 border border-red-200",
  secondary: "bg-slate-100 text-slate-800 border border-slate-200",
  accent: "bg-orange-50 text-orange-700 border border-orange-200",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
  outline: "bg-transparent text-slate-700 border border-slate-300",

  // Legacy mappings for backwards compatibility
  steel: "bg-slate-100 text-slate-700 border border-slate-200",
  red: "bg-red-50 text-red-700 border border-red-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  safe: "bg-green-50 text-green-700 border border-green-200",
} as const;

interface BadgeProps {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  size?: "sm" | "md";
}

export default function Badge({
  children,
  tone = "neutral",
  className = "",
  size = "sm",
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full shadow-2xs ${sizeClasses} ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
