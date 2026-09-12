import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: "left" | "right";
  width?: "sm" | "md" | "lg";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  width = "md",
}: DrawerProps) {
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

  const widthClasses = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
  };

  const positionClasses = position === "right" ? "right-0" : "left-0";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 ${positionClasses} w-full ${widthClasses[width]} bg-white shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out`}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold font-display text-dark tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;
