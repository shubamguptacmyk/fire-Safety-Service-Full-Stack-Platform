import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import {
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Building2,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";

const schema = z
  .object({
    name: z.string().min(2, "Full Name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)"),
    email: z
      .string({ required_error: "Email Address is required" })
      .min(1, "Email Address is required")
      .email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    customerType: z.enum(["b2c", "b2b", "corporate"]),
    companyName: z.string().optional(),
    gstNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (
        (data.customerType === "b2b" || data.customerType === "corporate") &&
        (!data.companyName || !data.companyName.trim())
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Company Name is required for Business and Corporate accounts",
      path: ["companyName"],
    }
  );

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerType: "b2c",
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      gstNumber: "",
    },
  });

  const customerType = watch("customerType");
  const isBusinessOrCorporate = customerType === "b2b" || customerType === "corporate";

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);

    try {
      const cleanEmail = values.email.trim().toLowerCase();
      const cleanPhone = values.phone.trim();
      const cleanName = values.name.trim();

      await authService.register({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password: values.password,
        confirmPassword: values.confirmPassword,
        customerType: values.customerType,
        companyName: isBusinessOrCorporate ? values.companyName?.trim() : undefined,
        gstNumber: isBusinessOrCorporate && values.gstNumber?.trim() ? values.gstNumber.trim().toUpperCase() : undefined,
      });

      // DO NOT automatically authenticate the customer yet.
      // Show "Check Your Email" screen with verification link sent.
      setRegisteredEmail(cleanEmail);
      setResendCooldown(60);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors && err.response.data.errors[0]?.message) ||
        "Registration failed. Please verify your details and try again.";
      setServerError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    if (!registeredEmail || resendCooldown > 0 || resending) return;
    setResending(true);
    setResendNotice(null);
    try {
      const res = await authService.resendVerification(registeredEmail);
      setResendNotice({
        type: "success",
        text: res.message || "Verification email sent. Please check your inbox.",
      });
      setResendCooldown(res.data?.cooldown || 60);
    } catch (err: any) {
      setResendNotice({
        type: "error",
        text: err?.response?.data?.message || "Failed to resend verification email. Please try again.",
      });
    } finally {
      setResending(false);
    }
  }

  if (registeredEmail) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Seo
          title="Check Your Email — AK Fire Safety"
          description="Verify your email address to activate your AK Fire Safety account."
        />
        <div className="bg-white rounded-2xl border border-black/10 p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Check Your Email</h1>
          <p className="text-sm text-steel mb-4 leading-relaxed">
            We've sent a verification link to your email address. Please verify your email to activate your account.
          </p>
          <div className="bg-surface rounded-xl px-4 py-3 border border-black/10 mb-6 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-steel shrink-0" />
            <span className="text-sm font-semibold text-ink break-all">{registeredEmail}</span>
          </div>

          {resendNotice && (
            <div
              className={`p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 text-left ${
                resendNotice.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {resendNotice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{resendNotice.text}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResendVerification}
              className="w-full bg-surface hover:bg-black/5 border border-black/15 text-ink py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending email...</span>
                </>
              ) : resendCooldown > 0 ? (
                <span>Resend available in {resendCooldown}s</span>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            <Link
              to="/login"
              state={{ email: registeredEmail }}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
      <Seo
        title="Create Account — AK Fire Safety Service"
        description="Create an account to place orders, request quotes and track your fire safety equipment."
      />

      <div className="bg-white rounded-2xl border border-black/10 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 text-brand mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Create Account</h1>
          <p className="text-sm text-steel mt-1">Instant registration for individual, business, or corporate accounts.</p>
        </div>

        {serverError && (
          <div role="alert" className="bg-brand/10 border border-brand/20 text-brand text-sm rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="font-medium leading-snug">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Customer Type Selector */}
          <div>
            <label className="text-xs font-semibold text-steel uppercase tracking-wider block mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-surface p-1 rounded-xl border border-black/10 text-xs">
              <label className="cursor-pointer">
                <input type="radio" value="b2c" {...register("customerType")} className="sr-only peer" />
                <span className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold cursor-pointer peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-xs text-steel transition text-center">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Individual</span>
                </span>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="b2b" {...register("customerType")} className="sr-only peer" />
                <span className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold cursor-pointer peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-xs text-steel transition text-center">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>Business</span>
                </span>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="corporate" {...register("customerType")} className="sr-only peer" />
                <span className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-semibold cursor-pointer peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-xs text-steel transition text-center">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Corporate</span>
                </span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-ink block">
              Full Name <span className="text-brand">*</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Ramesh Patil"
              {...register("name")}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm mt-1 transition-all focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-brand/50 focus:ring-brand/20 bg-brand/5"
                  : "border-black/15 focus:ring-brand/20 focus:border-brand"
              }`}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-brand font-medium mt-1">{errors.name.message}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-ink block">
              Mobile Number <span className="text-brand">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-steel pointer-events-none">
                <Phone className="w-3.5 h-3.5" />
                <span className="text-xs font-mono font-medium">+91</span>
              </div>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                maxLength={10}
                placeholder="9876543210"
                {...register("phone")}
                className={`w-full border rounded-xl pl-16 pr-3.5 py-2.5 text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-brand/50 focus:ring-brand/20 bg-brand/5"
                    : "border-black/15 focus:ring-brand/20 focus:border-brand"
                }`}
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && <p className="text-xs text-brand font-medium mt-1">{errors.phone.message}</p>}
          </div>

          {/* Email Address - REQUIRED */}
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-ink block">
              Email Address <span className="text-brand">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-brand/50 focus:ring-brand/20 bg-brand/5"
                    : "border-black/15 focus:ring-brand/20 focus:border-brand"
                }`}
                aria-invalid={!!errors.email}
              />
              <Mail className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.email && <p className="text-xs text-brand font-medium mt-1">{errors.email.message}</p>}
          </div>

          {/* Business/Corporate Specific Fields */}
          {isBusinessOrCorporate && (
            <div className="p-3.5 bg-surface rounded-xl border border-black/10 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 border-b border-black/5 pb-1.5 text-xs font-bold text-ink">
                <Building2 className="w-4 h-4 text-brand" />
                <span>Organization Details</span>
              </div>
              <div>
                <label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-ink block">
                  Company Name <span className="text-brand">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  placeholder="e.g. Acme Industries Ltd."
                  {...register("companyName")}
                  className={`w-full border rounded-xl px-3.5 py-2 text-sm bg-white mt-1 transition-all focus:outline-none focus:ring-2 ${
                    errors.companyName
                      ? "border-brand/50 focus:ring-brand/20 bg-brand/5"
                      : "border-black/15 focus:ring-brand/20 focus:border-brand"
                  }`}
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName && (
                  <p className="text-xs text-brand font-medium mt-1">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="gstNumber" className="text-xs font-semibold uppercase tracking-wider text-ink block">
                    GST Number <span className="text-steel font-normal text-[11px]">(Optional)</span>
                  </label>
                  <span className="text-[11px] text-steel">For 18% GST input credit</span>
                </div>
                <input
                  id="gstNumber"
                  type="text"
                  maxLength={15}
                  placeholder="27AAAAA0000A1Z5"
                  {...register("gstNumber")}
                  className="w-full border border-black/15 rounded-xl px-3.5 py-2 text-sm bg-white uppercase font-mono mt-1 transition-all focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-ink block">
              Password <span className="text-brand">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                {...register("password")}
                className={`w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-brand/50 focus:ring-brand/20 bg-brand/5"
                    : "border-black/15 focus:ring-brand/20 focus:border-brand"
                }`}
                aria-invalid={!!errors.password}
              />
              <Lock className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink p-0.5 rounded transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-brand font-medium mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-ink block">
              Confirm Password <span className="text-brand">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                className={`w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-brand/50 focus:ring-brand/20 bg-brand/5"
                    : "border-black/15 focus:ring-brand/20 focus:border-brand"
                }`}
                aria-invalid={!!errors.confirmPassword}
              />
              <Lock className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink p-0.5 rounded transition"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-brand font-medium mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-brand hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-steel mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-bold hover:underline">
            Log in directly
          </Link>
        </p>
      </div>
    </div>
  );
}
