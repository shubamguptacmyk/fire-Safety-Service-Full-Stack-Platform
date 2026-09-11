import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Mail,
  ArrowRight,
  ShieldCheck,
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
      setMessage("No verification token was found in the link. Please check your email or request a new link.");
      return;
    }

    let isMounted = true;
    authService
      .verifyEmail(token.trim())
      .then((res) => {
        if (!isMounted) return;
        setStatus("success");
        setMessage(res.message || "Your account has been verified. You can now log in to your account.");
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err?.response?.data?.message || "";
        const lower = msg.toLowerCase();

        if (lower.includes("expired")) {
          setStatus("expired");
          setMessage("This verification link has expired. Verification links are valid for 24 hours.");
        } else if (lower.includes("already")) {
          setStatus("already_verified");
          setMessage("Your email address has already been verified. You can log in directly.");
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
    <div className="max-w-md mx-auto px-4 py-16">
      <Seo
        title="Email Verification — AK Fire Safety"
        description="Verify your email address to activate your AK Fire Safety account."
      />

      <div className="bg-white rounded-xl border border-black/10 p-8 shadow-sm text-center">
        {/* State 1: Loading */}
        {status === "loading" && (
          <div className="py-6">
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-5 animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Verifying...</h1>
            <p className="text-sm text-steel">Please wait while we confirm your verification token...</p>
          </div>
        )}

        {/* State 2: Success */}
        {status === "success" && (
          <div>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Email Verified Successfully</h1>
            <p className="text-sm text-steel mb-6 leading-relaxed">
              Your account is now verified. You can log in to continue.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* State 3: Already Verified */}
        {status === "already_verified" && (
          <div>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Email Already Verified</h1>
            <p className="text-sm text-steel mb-6 leading-relaxed">
              {message || "Your account has already been verified. You can log in directly using your credentials."}
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* State 4: Expired */}
        {status === "expired" && (
          <div>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Clock className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Verification Link Expired</h1>
            <p className="text-sm text-steel mb-6 leading-relaxed">
              This verification link has expired. For your security, email verification links expire after 24 hours.
            </p>

            <div className="border-t border-black/10 pt-6 text-left">
              <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Resend verification email
              </p>
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />

                {resendResult && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      resendResult.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {resendResult.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{resendResult.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cooldown > 0 || resending}
                  className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <span>Resend available in {cooldown}s</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* State 5: Invalid Token */}
        {status === "invalid" && (
          <div>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Invalid Verification Link</h1>
            <p className="text-sm text-steel mb-6 leading-relaxed">
              This verification link is invalid or has already been used. If you have already verified your email, you
              can log in directly.
            </p>

            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center border border-black/15 hover:bg-surface text-steel py-2 rounded-lg text-sm font-medium transition"
              >
                Create New Account
              </Link>
            </div>
          </div>
        )}

        {/* State 6: Missing Token */}
        {status === "missing_token" && (
          <div>
            <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Verification Token Missing</h1>
            <p className="text-sm text-steel mb-6 leading-relaxed">
              No verification token was found in the URL. Please make sure you clicked the complete link in your
              verification email.
            </p>

            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="w-full inline-flex items-center justify-center border border-black/15 hover:bg-surface text-steel py-2 rounded-lg text-sm font-medium transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* State 7: Server Error */}
        {status === "server_error" && (
          <div>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Verification Failed</h1>
            <p className="text-sm text-steel mb-6 leading-relaxed">
              {message || "We encountered an error processing your verification. Please try again."}
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center border border-black/15 hover:bg-surface text-steel py-2 rounded-lg text-sm font-medium transition"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-black/5 text-xs text-steel">
          Need assistance? Reach out to{" "}
          <a href="mailto:support@akfiresafety.com" className="text-brand hover:underline font-medium">
            support@akfiresafety.com
          </a>
        </div>
      </div>
    </div>
  );
}
