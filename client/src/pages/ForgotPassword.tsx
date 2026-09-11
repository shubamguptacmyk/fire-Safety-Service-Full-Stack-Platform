import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import { AlertCircle, CheckCircle2, ArrowLeft, Mail } from "lucide-react";

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
      setServerError(err?.response?.data?.message || "Failed to process request. Please check the email address and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Seo
        title="Forgot Password — AK Fire Safety Service"
        description="Reset your AK Fire Safety account password."
      />

      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-charcoal mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
      </Link>

      <h1 className="font-display text-3xl font-bold mb-1 text-charcoal">Forgot Password</h1>
      <p className="text-sm text-steel mb-6">
        Enter the email address associated with your AK Fire Safety account and we'll send you a password reset link.
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
          <h2 className="font-semibold text-emerald-950 text-lg">Reset Link Sent</h2>
          <p className="text-xs text-emerald-800 leading-relaxed">
            If an account exists with that email address, we've dispatched instructions to reset your password. Please check your inbox and spam folder.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...register("email")}
                className="w-full border border-black/15 rounded-lg px-3.5 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                aria-invalid={!!errors.email}
              />
              <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
            </div>
            {errors.email && (
              <p className="text-xs text-brand mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            {submitting ? "Sending Reset Link..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
