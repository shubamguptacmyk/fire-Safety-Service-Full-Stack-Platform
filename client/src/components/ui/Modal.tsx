import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className = "",
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-elevated border border-slate-200/80 z-10 overflow-hidden my-8 scale-100 transition-all ${className}`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-bold font-display text-dark tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
