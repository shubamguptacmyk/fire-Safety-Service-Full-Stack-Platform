import { apiClient } from "./apiClient";
import { User, ApiEnvelope } from "@/types";

interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: User;
  requiresEmailVerification?: boolean;
  message?: string;
}

export const authService = {
  register: (payload: {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword?: string;
    customerType?: string;
    companyName?: string;
    gstNumber?: string;
  }) => apiClient.post<ApiEnvelope<RegisterResult>>("/auth/register", payload).then((r) => r.data.data),

  login: (identifier: string, password: string) =>
    apiClient.post<ApiEnvelope<AuthResult>>("/auth/login", { identifier, password }).then((r) => r.data.data),

  verifyEmail: (token: string) =>
    apiClient.post<ApiEnvelope<{ message: string }>>("/auth/verify-email", { token }).then((r) => r.data),

  resendVerification: (email: string) =>
    apiClient.post<ApiEnvelope<{ message: string; cooldown?: number; alreadyVerified?: boolean }>>("/auth/resend-verification", { email }).then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post<ApiEnvelope<{ message: string }>>("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiEnvelope<{ message: string }>>("/auth/reset-password", { token, password }).then((r) => r.data),

  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refreshToken }),

  me: () => apiClient.get<ApiEnvelope<User>>("/auth/me").then((r) => r.data.data),
};
