import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

const schema = z
  .object({
    token: z.string().min(10, "Reset token is required or invalid"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryToken = searchParams.get("token") || "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: queryToken,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      await authService.resetPassword(values.token, values.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || "Failed to reset password. The token may be expired or invalid."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Seo
        title="Reset Password — AK Fire Safety Service"
        description="Set a new secure password for your AK Fire Safety account."
      />

      <h1 className="font-display text-3xl font-bold mb-1 text-charcoal">Set New Password</h1>
      <p className="text-sm text-steel mb-6">
        Please enter your secure new password below to regain access to your account.
      </p>

      {serverError && (
        <div role="alert" className="bg-brand/10 text-brand text-sm rounded-lg p-3 mb-4 flex items-center gap-2 border border-brand/20">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="font-semibold text-emerald-950 text-lg">Password Reset Successfully</h2>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Your password has been updated. Redirecting you to login in a few seconds...
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
            >
              Log In Now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {!queryToken && (
            <div>
              <label htmlFor="token" className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5">
                Reset Token
              </label>
              <input
                id="token"
                type="text"
                placeholder="Paste the reset token from your email"
                {...register("token")}
                className="w-full border border-black/15 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                aria-invalid={!!errors.token}
              />
              {errors.token && (
                <p className="text-xs text-brand mt-1 font-medium">{errors.token.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                {...register("password")}
                className="w-full border border-black/15 rounded-lg px-3.5 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                aria-invalid={!!errors.password}
              />
              <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
            </div>
            {errors.password && (
              <p className="text-xs text-brand mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                {...register("confirmPassword")}
                className="w-full border border-black/15 rounded-lg px-3.5 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                aria-invalid={!!errors.confirmPassword}
              />
              <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-brand mt-1 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            {submitting ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}
