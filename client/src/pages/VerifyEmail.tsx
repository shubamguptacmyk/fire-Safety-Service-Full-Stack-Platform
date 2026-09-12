import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Mail,
  ArrowRight,
  ShieldCheck,
  Flame,
} from "lucide-react";

type VerificationStatus =
  | "loading"
  | "success"
  | "already_verified"
  | "expired"
  | "invalid"
  | "missing_token"
  | "server_error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>("");

  // Resend state
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendResult, setResendResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!token || !token.trim()) {
      setStatus("missing_token");
      setMessage("No verification token was found in the link. Please check your email or request a new activation link.");
      return;
    }

    let isMounted = true;
    authService
      .verifyEmail(token.trim())
      .then((res) => {
        if (!isMounted) return;
        setStatus("success");
        setMessage(res.message || "Your account has been verified. You can now access your customer portal.");
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err?.response?.data?.message || "";
        const lower = msg.toLowerCase();

        if (lower.includes("expired")) {
          setStatus("expired");
          setMessage("This verification link has expired. Links are valid for 24 hours.");
        } else if (lower.includes("already")) {
          setStatus("already_verified");
          setMessage("Your email address has already been verified. You can sign in directly.");
        } else if (lower.includes("invalid") || lower.includes("used")) {
          setStatus("invalid");
          setMessage("This verification link is invalid or has already been used.");
        } else {
          setStatus("server_error");
          setMessage(msg || "Verification failed. The server could not process the request. Please try again.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail || !resendEmail.trim() || cooldown > 0 || resending) return;

    setResending(true);
    setResendResult(null);
    try {
      const response = await authService.resendVerification(resendEmail.trim());
      setResendResult({
        type: "success",
        text: response.message || "Verification email sent. Please check your inbox.",
      });
      setCooldown(response.data?.cooldown || 60);
    } catch (err: any) {
      setResendResult({
        type: "error",
        text: err?.response?.data?.message || "Failed to resend verification email. Please try again.",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <Seo
        title="Email Verification — Shubam Fire Protection"
        description="Verify your email address to activate your Shubam Fire Protection customer portal account."
      />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-card text-center space-y-6">
        {/* Loading */}
        {status === "loading" && (
          <div className="py-6 space-y-3">
            <div className="w-14 h-14 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mx-auto shadow-2xs border border-primary-100 animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-dark">
              Verifying Account...
            </h1>
            <p className="text-xs text-slate-500">
              Please wait while we validate your security token with the safety server...
            </p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-dark">
              Account Verified Successfully
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              Your customer account is now fully active. You can now access your equipment tracker, Form B inspections, and invoices.
            </p>
            <div className="pt-3">
              <Link to="/login" className="block">
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Sign In to Customer Portal
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Already verified */}
        {status === "already_verified" && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-dark">
              Account Already Verified
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              Your email address has already been authenticated. You can sign in immediately.
            </p>
            <div className="pt-3">
              <Link to="/login" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Expired / Invalid */}
        {(status === "expired" ||
          status === "invalid" ||
          status === "missing_token" ||
          status === "server_error") && (
          <div className="space-y-5">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              {status === "expired" ? <Clock className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
            </div>
            <h1 className="font-display text-2xl font-extrabold text-dark">
              {status === "expired" ? "Link Expired" : "Verification Failed"}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              {message}
            </p>

            {resendResult && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 text-left ${
                  resendResult.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {resendResult.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{resendResult.text}</span>
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
              <label className="block text-xs font-semibold text-slate-700">
                Request New Verification Link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter registered email"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-dark focus:border-primary-600 outline-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={resending}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `${cooldown}s` : "Resend"}
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-slate-100">
              <Link to="/login" className="text-xs font-bold text-primary-700 hover:underline">
                Return to Login Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
