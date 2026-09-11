import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast, ToastItem } from "@/store/toastStore";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const config = {
    success: {
      icon: CheckCircle2,
      border: "border-green-300",
      bg: "bg-white",
      iconColor: "text-green-600",
      progressBg: "bg-green-500",
    },
    error: {
      icon: AlertCircle,
      border: "border-red-300",
      bg: "bg-white",
      iconColor: "text-red-600",
      progressBg: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-amber-300",
      bg: "bg-white",
      iconColor: "text-amber-600",
      progressBg: "bg-amber-500",
    },
    info: {
      icon: Info,
      border: "border-blue-300",
      bg: "bg-white",
      iconColor: "text-blue-600",
      progressBg: "bg-blue-500",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`pointer-events-auto rounded-xl shadow-xl border ${config.border} ${config.bg} p-3.5 flex items-start gap-3 relative overflow-hidden`}
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${config.iconColor} bg-black/5`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        {toast.title && (
          <h4 className="font-display font-bold text-xs text-ink leading-tight">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-steel mt-0.5 leading-relaxed break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-steel/60 hover:text-ink p-1 rounded transition-colors shrink-0"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
