import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function Unauthorized() {
  const user = useAdminAuthStore((s) => s.user);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-black/10 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h1 className="font-display font-bold text-xl text-ink">Access Restricted (403)</h1>
          <p className="text-xs text-steel leading-relaxed">
            Your current administrative account (<strong className="text-ink">{user?.email}</strong>) with role{" "}
            <span className="font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
              {user?.role.replace("_", " ")}
            </span>{" "}
            does not have the statutory RBAC permissions required to access this module.
          </p>
        </div>

        <div className="p-3 bg-paper rounded-xl border border-black/5 text-left text-xs space-y-1">
          <span className="font-bold text-ink block">Role Permissions Policy:</span>
          <p className="text-steel text-[11px]">
            To request elevated administrative privileges (such as <code>settings.manage</code> or <code>products.write</code>), contact your Super Administrator.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3 text-xs font-semibold">
          <Link
            to="/"
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Return to Command Center
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-white border border-black/10 text-ink rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
