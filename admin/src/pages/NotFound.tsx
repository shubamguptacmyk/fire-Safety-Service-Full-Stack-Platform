import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-black/10 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h1 className="font-display font-bold text-xl text-ink">Admin Route Not Found (404)</h1>
          <p className="text-xs text-steel leading-relaxed">
            The administrative console resource or page you are trying to reach does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center">
          <Link
            to="/"
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Home className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
