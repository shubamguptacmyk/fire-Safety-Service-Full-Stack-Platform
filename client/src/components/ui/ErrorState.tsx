import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We were unable to complete your request. Please check your connection and try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`text-center py-12 px-6 rounded-2xl border border-red-100 bg-red-50/40 flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-4 shadow-2xs">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold font-display text-dark tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
