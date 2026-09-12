import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ children, className = "", hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-card transition-all duration-200 overflow-hidden ${
        hoverable ? "hover:shadow-hover hover:border-slate-300" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-5 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-bold font-display text-dark tracking-tight leading-snug ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-slate-500 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
