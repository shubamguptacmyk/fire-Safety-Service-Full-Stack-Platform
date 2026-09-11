import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="bg-red-50/50 border border-red-200 rounded-xl p-8 text-center space-y-3 shadow-sm">
      <div className="mx-auto w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="font-display font-bold text-sm text-red-900">{title}</h3>
        <p className="text-xs text-red-700 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Request
          </button>
        </div>
      )}
    </div>
  );
}
