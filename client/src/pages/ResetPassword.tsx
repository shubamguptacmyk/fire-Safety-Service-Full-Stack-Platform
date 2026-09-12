import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Lock, Flame } from "lucide-react";

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
        err?.response?.data?.message || "Failed to reset password. The reset link may be expired or invalid."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <Seo
        title="Set New Password — Shubam Fire Protection"
        description="Set a new secure password for your Shubam Fire Protection account."
      />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-2xs border border-primary-100">
            <Flame className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-dark tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Choose a strong password with at least 8 characters to secure your facility data
          </p>
        </div>

        {serverError && (
          <div role="alert" className="bg-red-50 text-red-700 text-xs rounded-xl p-4 flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{serverError}</span>
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-emerald-950 text-base">Password Updated Successfully</h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your password has been changed. Redirecting you to sign in...
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {!queryToken && (
              <div>
                <label htmlFor="token" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Verification Token *
                </label>
                <input
                  id="token"
                  type="text"
                  placeholder="Paste the reset token received"
                  {...register("token")}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-primary-600 outline-none"
                  aria-invalid={!!errors.token}
                />
                {errors.token && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{errors.token.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Secure Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm pl-10 focus:border-primary-600 outline-none"
                  aria-invalid={!!errors.password}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-type your new password"
                  {...register("confirmPassword")}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm pl-10 focus:border-primary-600 outline-none"
                  aria-invalid={!!errors.confirmPassword}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={submitting}
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
