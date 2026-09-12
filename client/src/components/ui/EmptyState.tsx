import React from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = <Inbox className="w-10 h-10 text-slate-400" />,
  title,
  description,
  action,
  actionText,
  actionLink,
  onAction,
  className = "",
}: EmptyStateProps) {
  let renderedIcon: React.ReactNode;
  if (React.isValidElement(icon)) {
    renderedIcon = icon;
  } else if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    const IconComp = icon as React.ComponentType<{ className?: string }>;
    renderedIcon = <IconComp className="w-8 h-8 text-slate-400" />;
  } else {
    renderedIcon = <Inbox className="w-8 h-8 text-slate-400" />;
  }

  return (
    <div
      className={`text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-500 shadow-2xs">
        {renderedIcon}
      </div>
      <h3 className="text-base sm:text-lg font-bold font-display text-dark tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
      {!action && actionText && (
        <div className="mt-6">
          {actionLink ? (
            <Button asChild variant="primary" size="md">
              <Link to={actionLink}>{actionText}</Link>
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
