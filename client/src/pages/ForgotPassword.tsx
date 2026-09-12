import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, ArrowLeft, Mail, Flame } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      await authService.forgotPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ||
          "Failed to process your request. Please check the email address and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <Seo
        title="Forgot Password — Shubam Fire Protection"
        description="Reset your Shubam Fire Protection customer portal password."
      />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-card space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-700 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-2xs border border-primary-100">
            <Flame className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-dark tracking-tight">
            Reset Portal Password
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Enter your registered email address to receive password reset instructions
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
            <h2 className="font-bold text-emerald-950 text-base">Reset Instructions Dispatched</h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              If an account is associated with that email, we&apos;ve sent instructions to update your password. Please check your inbox and spam folder.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email Address *
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register("email")}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm pl-10 focus:border-primary-600 outline-none transition-colors"
                  aria-invalid={!!errors.email}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={submitting}
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
