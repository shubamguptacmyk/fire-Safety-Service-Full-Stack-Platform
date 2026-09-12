import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Mail, Flame, ShieldCheck } from "lucide-react";

const schema = z.object({
  identifier: z.string().min(3, "Enter your registered email or phone"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  const passedEmail = (location.state as { email?: string })?.email || "";
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Unverified email state
  const [isUnverified, setIsUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: passedEmail },
  });

  const identifierVal = watch("identifier");

  useEffect(() => {
    if (passedEmail) {
      setValue("identifier", passedEmail);
    }
  }, [passedEmail, setValue]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setIsUnverified(false);
    setResendStatus(null);
    setSubmitting(true);
    try {
      const result = await authService.login(values.identifier.trim(), values.password);
      setSession(result.user, result.accessToken, result.refreshToken);
      const from = (location.state as { from?: Location })?.from?.pathname || "/profile";
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Login failed. Please verify your email/phone and password.";
      const isVerifyErr =
        msg.toLowerCase().includes("verify your email") ||
        err?.response?.data?.errors?.some((e: any) => e.message === "EMAIL_NOT_VERIFIED");

      if (isVerifyErr) {
        setIsUnverified(true);
        setServerError("Please verify your email address before accessing the customer portal.");
      } else {
        setServerError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    const emailToUse = identifierVal?.trim();
    if (!emailToUse || resendCooldown > 0 || resending) return;

    setResending(true);
    setResendStatus(null);
    try {
      const res = await authService.resendVerification(emailToUse);
      setResendStatus({
        type: "success",
        text: res.message || "Verification email sent. Please check your inbox.",
      });
      setResendCooldown(res.data?.cooldown || 60);
    } catch (err: any) {
      setResendStatus({
        type: "error",
        text: err?.response?.data?.message || "Failed to resend verification email. Please try again.",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Seo
        title="Customer Portal Login — Shubam Fire Protection"
        description="Log in to your Shubam Fire Protection account to access equipment records, Form B certificates, and order history."
      />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-2xs border border-primary-100">
            <Flame className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-dark tracking-tight">
            Customer Portal Sign In
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Access your fire safety equipment tracker, Form B inspections, and order receipts
          </p>
        </div>

        {serverError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold leading-relaxed">{serverError}</p>
                {isUnverified && (
                  <div className="mt-3 pt-2.5 border-t border-red-200">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || resending}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:underline disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending verification email...</span>
                        </>
                      ) : resendCooldown > 0 ? (
                        <span>Resend available in {resendCooldown}s</span>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Resend verification email</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {resendStatus && (
          <div
            role="status"
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              resendStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {resendStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{resendStatus.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registered Email or Phone *
            </label>
            <input
              id="identifier"
              {...register("identifier")}
              placeholder="name@company.com or 9820012345"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors ${
                errors.identifier ? "border-red-500" : "border-slate-300 hover:border-slate-400"
              }`}
              aria-invalid={!!errors.identifier}
            />
            {errors.identifier && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password *
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary-700 hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter your account password"
                className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors ${
                  errors.password ? "border-red-500" : "border-slate-300 hover:border-slate-400"
                }`}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={submitting}
          >
            Sign In to Customer Portal
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Need a facility account?{" "}
            <Link to="/register" className="text-primary-700 font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>

        <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Shubam Fire Protection &bull; Directorate Licensed Portal</span>
        </div>
      </div>
    </div>
  );
}
