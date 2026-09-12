import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { authService } from "@/services/authService";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import {
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Building2,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Flame,
} from "lucide-react";

const schema = z
  .object({
    name: z.string().min(2, "Full Name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number (e.g. 9820012345)"),
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
        gstNumber:
          isBusinessOrCorporate && values.gstNumber?.trim()
            ? values.gstNumber.trim().toUpperCase()
            : undefined,
      });

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
          title="Verify Your Email — Shubam Fire Protection"
          description="Verify your email address to activate your Shubam Fire Protection account."
        />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-card text-center space-y-4">
          <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-2xs border border-primary-100">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-dark">
            Check Your Email
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            We&apos;ve dispatched a secure account activation link to your email address. Please click the link to activate your customer portal access.
          </p>
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 my-4 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-dark break-all">{registeredEmail}</span>
          </div>

          {resendNotice && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 text-left ${
                resendNotice.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {resendNotice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{resendNotice.text}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button
              variant="outline"
              size="md"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResendVerification}
              className="w-full"
              isLoading={resending}
            >
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : "Resend Verification Email"}
            </Button>

            <Link to="/login" state={{ email: registeredEmail }} className="block">
              <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
      <Seo
        title="Create Facility Account — Shubam Fire Protection"
        description="Register for an account with Shubam Fire Protection to track equipment, request B2B quotes, and schedule Form B AMC inspections."
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto shadow-2xs border border-primary-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Direct access to statutory fire equipment records, Form B compliance, and corporate quoting
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="font-semibold leading-relaxed">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Customer Classification *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: "b2c", label: "Individual / Residential", icon: User },
                { id: "b2b", label: "Commercial / Business", icon: Building2 },
                { id: "corporate", label: "Industrial / Society", icon: ShieldCheck },
              ].map((t) => (
                <label
                  key={t.id}
                  className={`p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all flex flex-row sm:flex-col items-center gap-2.5 sm:gap-1.5 text-left sm:text-center ${
                    customerType === t.id
                      ? "border-primary-700 bg-primary-50/50 ring-1 ring-primary-700 text-primary-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    value={t.id}
                    {...register("customerType")}
                    className="sr-only"
                  />
                  <t.icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs sm:text-[11px] font-bold leading-tight">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name *
              </label>
              <input
                id="name"
                {...register("name")}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-dark focus:border-primary-600 outline-none"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                id="phone"
                {...register("phone")}
                placeholder="10-digit mobile (e.g. 9820012345)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-dark focus:border-primary-600 outline-none"
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email Address *
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-dark focus:border-primary-600 outline-none"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* Conditional Business Inputs */}
          {isBusinessOrCorporate && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enterprise / Society Name *
                </label>
                <input
                  {...register("companyName")}
                  placeholder="e.g. Oberoi Woods CHS / Acme Logistics"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-dark focus:border-primary-600 outline-none bg-white"
                />
                {errors.companyName && (
                  <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN Number (Optional)
                </label>
                <input
                  {...register("gstNumber")}
                  placeholder="e.g. 27AABCS1234F1Z8"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-dark focus:border-primary-600 outline-none uppercase bg-white"
                />
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-xs text-dark focus:border-primary-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-xs text-dark focus:border-primary-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            isLoading={submitting}
          >
            Create Customer Account
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="text-primary-700 font-bold hover:underline">
              Sign In to Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
