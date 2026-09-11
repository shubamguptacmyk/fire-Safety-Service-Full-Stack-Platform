import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-black/10 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-full shrink-0 ${
                isDestructive ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-ink">{title}</h3>
              <p className="text-xs text-steel leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-paper/60 border-t border-black/5 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-black/10 rounded-lg text-ink font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
