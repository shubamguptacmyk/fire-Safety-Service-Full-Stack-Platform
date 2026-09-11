import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Flame, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { useAdminAuthStore } from "@/store/adminAuthStore";

const schema = z.object({
  identifier: z.string().min(3, "Enter your staff email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const setSession = useAdminAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const result = await authService.login(values.identifier, values.password);
      if (result.user.role === "customer") {
        setServerError("This account does not have staff access.");
        return;
      }
      setSession(result.user, result.accessToken, result.refreshToken);
      navigate("/", { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm bg-white rounded-lg p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Flame className="w-6 h-6 text-brand" aria-hidden="true" />
          <span className="font-display text-xl font-bold">AK ADMIN</span>
        </div>

        {serverError && (
          <div role="alert" className="bg-brand/10 text-brand text-sm rounded p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="identifier" className="text-sm font-medium">Staff Email</label>
            <input id="identifier" {...register("identifier")} className="w-full border border-black/15 rounded px-3 py-2 text-sm mt-1" />
            {errors.identifier && <p className="text-xs text-brand mt-1">{errors.identifier.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" type="password" {...register("password")} className="w-full border border-black/15 rounded px-3 py-2 text-sm mt-1" />
            {errors.password && <p className="text-xs text-brand mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-2.5 rounded text-sm font-medium">
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-xs text-steel mt-4 text-center">Use the credentials created by <code>npm run seed</code> in the server package.</p>
      </div>
    </div>
  );
}
