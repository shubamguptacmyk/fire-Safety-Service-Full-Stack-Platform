import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import { ArrowLeft, Home, ShieldAlert, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found (404) — Shubam Fire Protection"
        description="The page you are looking for does not exist or has moved."
      />

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div>
            <span className="font-display font-black text-6xl text-primary-600 tracking-tight block">
              404
            </span>
            <h1 className="text-2xl font-display font-bold text-slate-900 mt-2">
              Page Not Found
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              The fire protection resource, product, or service page you requested might have been removed or relocated.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="md">
              <Link to="/">
                <Home className="w-4 h-4 mr-1.5" /> Back to Home
              </Link>
            </Button>
            <Button asChild variant="secondary" size="md">
              <Link to="/products">Browse Equipment</Link>
            </Button>
          </div>

          <div className="pt-6 border-t border-slate-200 text-xs text-slate-400">
            Need urgent assistance? Call our 24/7 helpline at{" "}
            <a href="tel:+919800000000" className="text-primary-600 font-bold hover:underline">
              +91 98000 00000
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
