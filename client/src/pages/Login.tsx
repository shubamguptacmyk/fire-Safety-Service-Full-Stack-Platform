import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import Seo from "@/components/Seo";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Mail } from "lucide-react";

const schema = z.object({
  identifier: z.string().min(3, "Enter your email or phone"),
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
      const msg = err?.response?.data?.message || "Login failed. Please check your credentials.";
      const isVerifyErr =
        msg.toLowerCase().includes("verify your email") ||
        err?.response?.data?.errors?.some((e: any) => e.message === "EMAIL_NOT_VERIFIED");

      if (isVerifyErr) {
        setIsUnverified(true);
        setServerError("Please verify your email address before logging in.");
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
    <div className="max-w-sm mx-auto px-4 py-16">
      <Seo
        title="Log In — AK Fire Safety Service"
        description="Log in to your AK Fire Safety account to view orders, quotes and registered equipment."
      />
      <h1 className="font-display text-3xl font-bold mb-1">Log In</h1>
      <p className="text-sm text-steel mb-6">Access your orders, quotes and registered equipment.</p>

      {serverError && (
        <div role="alert" className="bg-brand/10 border border-brand/20 text-brand text-sm rounded-xl p-3.5 mb-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-medium text-xs leading-relaxed">{serverError}</p>
              {isUnverified && (
                <div className="mt-2.5 pt-2 border-t border-brand/15">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || resending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
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
          className={`p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 ${
            resendStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {resendStatus.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{resendStatus.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="identifier" className="text-sm font-medium">
            Email or Phone
          </label>
          <input
            id="identifier"
            {...register("identifier")}
            placeholder="name@example.com or 9876543210"
            className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            aria-invalid={!!errors.identifier}
          />
          {errors.identifier && <p className="text-xs text-brand mt-1">{errors.identifier.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-brand hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter your password"
              className="w-full border border-black/15 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-brand mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-sm text-steel mt-6 text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
