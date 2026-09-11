import { apiClient } from "./apiClient";
import { StaffUser, ApiEnvelope } from "@/types";

interface AuthResult {
  user: StaffUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: (identifier: string, password: string) =>
    apiClient.post<ApiEnvelope<AuthResult>>("/auth/login", { identifier, password }).then((r) => r.data.data),
  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refreshToken }),
  me: () => apiClient.get<ApiEnvelope<StaffUser>>("/auth/me").then((r) => r.data.data),
};
